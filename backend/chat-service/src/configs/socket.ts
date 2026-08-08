import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import { logger } from "./logger.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap: Record<string, string> = {};

io.on("connection", (socket: Socket) => {
  logger.info({ socketId: socket.id }, "User Connected");

  const userId = socket.handshake.query.userId as string | undefined;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    logger.info(`User ${userId} mapped to socket ${socket.id}`);
  }

  io.emit("getOnlineUser", Object.keys(userSocketMap));
  console.log(Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Socket Disconnected");
    if (userId) {
      delete userSocketMap[userId];
      logger.info(`User ${userId} removed from online users`);
      io.emit("getOnlineUser", Object.keys(userSocketMap));
    }
  });

  socket.on("connect_error", (error) => {
    logger.error({ error: error }, "Socket connection error");
  });
});

export { app, server, io };
