import express from "express";
import { config } from "./configs/index.js";
import chatRoutes from "./routes/chat.js";
import { logger } from "./configs/logger.js";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import connectDb from "./configs/mongo.js";

const app = express();

await connectDb()

app.use(express.json())

app.use(requestLoggerMiddleware)

app.use("api/v1/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of chat-service</h1>");
});

app.use(errorHandler)

app.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`);
});
