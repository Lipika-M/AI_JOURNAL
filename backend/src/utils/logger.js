import fs from "fs";

const logStream = fs.createWriteStream("/home/ubuntu/AI_JOURNAL/logs/app.log", { flags: "a" });

export const log = (type, journalId, message) => {
  const entry = {
    timestamp: new Date().toISOString(),
    type,         // "success" | "error" | "warning"
    journalId: journalId || null,
    message
  };
  // Write to local file
  logStream.write(JSON.stringify(entry) + "\n");
};