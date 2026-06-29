import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDB, disconnectDB } from "./database/prisma.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = (signal: string): void => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        void disconnectDB().finally(() => process.exit(0));
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("unhandledRejection", (reason) => {
      logger.error({ reason }, "Unhandled Rejection");
    });

    process.on("uncaughtException", (err) => {
      logger.error({ err }, "Uncaught Exception");
      process.exit(1);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
};

void startServer();
