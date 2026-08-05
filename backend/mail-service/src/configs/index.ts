import "dotenv/config";

export const config = {
  PORT: process.env.PORT || 5302,
  SERVICE_NAME: process.env.SERVICE_NAME,
  NODE_ENV: process.env.NODE_ENV,
  RABBITMQ_HOST: process.env.RABBITMQ_HOST,
  RABBITMQ_USERNAME: process.env.RABBITMQ_USERNAME,
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
  RABBITMQ_PORT: Number(process.env.RABBITMQ_PORT),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};

if (!config.SMTP_USER || !config.SMTP_PASS) {
  throw new Error("SMTP user or password is missing");
}
