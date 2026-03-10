import { redisClient } from "../config/redis.js";
 

export async function getCache(key) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache(key, value, ttl = 3600) {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttl
  });
}

export async function invalidateJournalCache(userId, journalId) {
  const keys = [
    `journals:${userId}`,
    `journals:${userId}:list`,
    `summary:${journalId}`,
    `mood:${journalId}`,
    `journals:${userId}:detail:${journalId}`,
    `analytics:${userId}:mood-trends`,
    `analytics:${userId}:sentiment-distribution`,
    `analytics:${userId}:tags-distribution`,
    `analytics:${userId}:average-mood-by-tag`,
  ];

  await Promise.all(keys.map((key) => redisClient.del(key)));
}