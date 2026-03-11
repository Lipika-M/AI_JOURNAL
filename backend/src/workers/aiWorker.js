import "dotenv/config";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import mongoose from "mongoose";
import { Journal } from "../models/journal.model.js";
import { processJournal } from "../services/ai.service.js";

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_QUEUE_URL;

await mongoose.connect(process.env.MONGODB_URI);
console.log("Worker: MongoDB connected");

async function pollQueue() {
  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 60,
      });

      const data = await sqsClient.send(command);

      if (data.Messages) {
        for (const msg of data.Messages) {
          try {
            const { journalId } = JSON.parse(msg.Body);
            const journal = await Journal.findById(journalId);

            if (!journal) {
              console.warn(`Worker: journal ${journalId} not found, skipping`);
            } else {
              await processJournal(journal);
            }

            const deleteCmd = new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: msg.ReceiptHandle,
            });
            await sqsClient.send(deleteCmd);
          } catch (err) {
            console.error("Worker: job processing error:", err.message);
          }
        }
      }
    } catch (err) {
      console.error("Worker: polling error:", err.message);
    }
  }
}

pollQueue();
