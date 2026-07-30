import express from "express";
import { config } from "./configs/index.js";
import connectDb from "./configs/mongo.js";
import connectRedis from "./configs/redis.js";
import connectRabbitMq from "./configs/rabbitmq.js";
import userRoutes from "./routes/user.js"

const app = express();

connectDb();
connectRedis();
connectRabbitMq();

app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of chat-service</h1>");
});

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
