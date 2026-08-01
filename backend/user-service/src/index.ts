import express from "express";
import cors from "cors";
import { config } from "./configs/index.js";
import connectDb from "./configs/mongo.js";
import connectRabbitMq from "./configs/rabbitmq.js";
import userRoutes from "./routes/user.js";
import { connectRedis } from "./configs/redis.js";

const app = express();

await connectDb();
await connectRedis();
await connectRabbitMq();

app.use(express.json());

app.use(cors());

app.use("/api/v1/user", userRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of chat-service</h1>");
});

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
