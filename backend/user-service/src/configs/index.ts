import "dotenv/config";

export const config = {
  PORT: process.env.PORT || 5300,
  DATABASE_URI: process.env.MONGO_URI,
  REDIS_URI: process.env.REDIS_URI,
  RABBITMQ_HOST: process.env.RABBITMQ_HOST ,
  RABBITMQ_USERNAME: process.env.RABBITMQ_USERNAME ,
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD ,
  RABBITMQ_PORT: Number(process.env.RABBITMQ_PORT) 
};
