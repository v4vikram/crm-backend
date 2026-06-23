import { createClient } from "redis";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on("error", (err) => logger.error({ err }, "Redis client error"));

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    logger.info("Redis connected");
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.disconnect();
    logger.info("Redis disconnected");
  }
};
