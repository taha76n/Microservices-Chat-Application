import express from "express";
import { config } from "./configs/index.js";
import chatRoutes from "./routes/chat.js";
import { logger } from "./configs/logger.js";

const app = express();

app.use("api/v1/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of chat-service</h1>");
});

app.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`);
});
