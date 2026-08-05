import { createTransport } from "nodemailer";
import { channel } from "../configs/rabbitmq.js";
import { config } from "../configs/index.js";
import { logger } from "../configs/logger.js";

export const sendMailConsumer = async (queueName: string) => {
  if (!channel) {
    logger.info("Rabbitmq channel is missing");
    return;
  }

  try {
    channel.assertQueue(queueName, { durable: true });

    logger.info(
      `sendMailConsumer started ready to consume messages from ${queueName}`
    );

    await channel.consume(queueName, async (msg) => {
      if (msg) {
        logger.info(`Consuming ${msg} from ${queueName}`);
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());
          const transporter = createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: config.SMTP_USER,
              pass: config.SMTP_USER,
            },
          });
          transporter.sendMail({
            from: "Chat App",
            to,
            subject,
            text: body,
          });
          logger.info(`otp-email sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          logger.info("Failed to send otp");
        }
      }
    });
  } catch (error) {
    logger.error(error)
    logger.error("Failed to start sendMail consumer");
  }
};
