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

const getReceiverSocketId = (receiverId: string): string | undefined => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket: Socket) => {
  logger.info({ socketId: socket.id }, "User Connected");

  const userId = socket.handshake.query.userId as string | undefined;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    logger.info(`User ${userId} mapped to socket ${socket.id}`);
  }

  io.emit("getOnlineUser", Object.keys(userSocketMap));

  if (userId) {
    socket.join(userId);
  }

  socket.on("typing", (data) => {
    logger.info(`User ${data.userId} is typing in chat ${data.chatId}`);
    socket.to(data.chatId).emit("userTyping", {
      chatId: data.chatId,
      userId: data.userId,
    });
  });

  socket.on("stopTyping", (data) => {
    logger.info(
      `User ${data.userId} has stopped typing in chat ${data.chatId}`
    );
    socket.to(data.chatId).emit("userTypingStop", {
      chatId: data.chatId,
      userId: data.userId,
    });
  });

  socket.on("joinChat", (data) => {
    socket.join(data.chatId);
    console.log(`User ${data.userId} has joined the chat room ${data.chatId}`);
  });

  socket.on("leaveChat", (data) => {
    socket.leave(data.chatId);
    console.log(`User ${data.userId} has left the chat room ${data.chatId}`);
  });

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

export { app, server, io, getReceiverSocketId };
