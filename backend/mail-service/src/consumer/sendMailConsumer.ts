import { createTransport } from "nodemailer";
import { channel } from "../configs/rabbitmq.js";
import { config } from "../configs/index.js";

export const sendMailConsumer = async (queueName: string) => {
  if (!channel) {
    console.log("Rabbitmq channel is missing");
    return;
  }

  try {
    channel.assertQueue(queueName, { durable: true });

    console.log(
      `sendMailConsumer started ready to consume messages from ${queueName}`
    );

    await channel.consume(queueName, async (msg) => {
      if (msg) {
        console.log(`Consuming ${msg} from ${queueName}`);
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
          console.log(`otp-email sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send otp");
        }
      }
    });
  } catch (error) {
    console.log("Failed to start sendMail consumer", error);
  }
};
