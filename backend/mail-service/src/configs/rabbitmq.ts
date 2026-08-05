import amqp from "amqplib";
import { config } from "./index.js";
import { logger } from "./logger.js";

export let channel: amqp.Channel;

export const connectRabbitMq = async () => {
  if (
    !config.RABBITMQ_HOST ||
    !config.RABBITMQ_PORT ||
    !config.RABBITMQ_USERNAME ||
    !config.RABBITMQ_PASSWORD
  ) {
    logger.info("RabbitMq configs are missing");
    return;
  }

  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      port: config.RABBITMQ_PORT,
      hostname: config.RABBITMQ_HOST,
      username: config.RABBITMQ_USERNAME,
      password: config.RABBITMQ_PASSWORD,
    });

    channel = await connection.createChannel();
    logger.info("RabbitMq connected successfully");
  } catch (error) {
    logger.info("Rabbitmq Connection Failed");
  }
};
