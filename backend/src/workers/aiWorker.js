import "dotenv/config";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { connectRedis } from "../config/redis.js";
import { Journal } from "../models/journal.model.js";
import { processJournal } from "../services/ai.service.js";
import { log } from "../utils/logger.js";

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const cwClient = new CloudWatchClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_QUEUE_URL;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pushMetric(name, value, unit = "Count") {
  try {
    await cwClient.send(
      new PutMetricDataCommand({
        Namespace: "AIJournal",
        MetricData: [{ MetricName: name, Value: value, Unit: unit }],
      })
    );
  } catch (err) {
    console.error("Worker: metric push error", err.message);
  }
}

async function initializeConnections() {
  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  console.log("Worker: MongoDB connected");
  await connectRedis();
}

async function pollQueue() {
  while (true) {
    try {
      // 1. Track SQS queue length
      const queueAttrs = await sqsClient.send(
        new GetQueueAttributesCommand({
          QueueUrl: QUEUE_URL,
          AttributeNames: ["ApproximateNumberOfMessages"],
        })
      );
      const queueLength = parseInt(
        queueAttrs.Attributes.ApproximateNumberOfMessages,
        10
      );
      await pushMetric("QueueLength", queueLength);

      // 2. Poll messages
      const data = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 60,
        })
      );

      if (data.Messages) {
        for (const msg of data.Messages) {
          const startTime = Date.now();
          try {
            const { journalId } = JSON.parse(msg.Body);
            const journal = await Journal.findById(journalId);

            if (!journal) {
              console.warn(`Worker: journal ${journalId} not found`);
              log("warning", journalId, "Journal not found");
            } else {
              await processJournal(journal);

              const duration = Date.now() - startTime;
              await pushMetric("ProcessingTimeMs", duration, "Milliseconds");
              await pushMetric("JobStatus", 1);
              log("success", journalId, `Processed in ${duration}ms`);
            }

            await sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: msg.ReceiptHandle,
              })
            );
          } catch (err) {
            console.error("Worker: job processing error:", err.message);
            await pushMetric("JobStatus", 0);
            log("error", null, err.message);
          }
        }
      }
    } catch (err) {
      console.error("Worker: polling error:", err.message);
      await sleep(2000);
    }
  }
}

async function startWorker() {
  try {
    await initializeConnections();
    console.log("Worker: ready and polling SQS");
    await pollQueue();
  } catch (err) {
    console.error("Worker: failed to start:", err.message);
    process.exit(1);
  }
}

startWorker();
