import express from "express";
import { config } from "./configs/index.js";
import { connectRabbitMq } from "./configs/rabbitmq.js";
import { sendMailConsumer } from "./consumer/sendMailConsumer.js";

const app = express();

await connectRabbitMq();
await sendMailConsumer("send-otp");

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of mail-service</h1>")
})

app.listen(config.PORT, () => {
  console.log(`Server is listening on port ${config.PORT}`);
})