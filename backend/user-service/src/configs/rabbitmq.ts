import amqp from "amqplib";
import { config } from "./index.js";
import { logger } from "./logger.js";

let channel: amqp.Channel;

const connectRabbitMq = async () => {
  if (
    !config.RABBITMQ_HOST ||
    !config.RABBITMQ_USERNAME ||
    !config.RABBITMQ_PASSWORD ||
    !config.RABBITMQ_PORT
  ) {
    throw new Error("RabbitMq config keys are missing");
  }

  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: config.RABBITMQ_HOST,
      username: config.RABBITMQ_USERNAME,
      password: config.RABBITMQ_PASSWORD,
      port: config.RABBITMQ_PORT,
    });

    channel = await connection.createChannel();

    logger.info("Connected to Rabbitmq");
  } catch (error) {
    logger.info("Failed to connect to Rabbitmq");
  }
};

export const publishToQueue = (queueName: string, message: any) => {
  if (!channel) {
    logger.info("RabbitMq Channel is missing");
    return;
  }

  channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

export default connectRabbitMq;
