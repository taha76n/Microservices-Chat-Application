import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { TryCatch } from "../utils/TryCatch.js";
import { chatService } from "../services/chat.js";

const createNewChat = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "UserId is missing" });
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    const chat = await chatService.createNewChat(userId, otherUserId);

    res
      .status(200)
      .json({ message: "New Chat created successfully", newChat: chat });
  }
);

const getAllChats = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "userId is missing" });
    }

    const chats = await chatService.getAllChats(userId);

    return res.status(200).json({message: "Chats Fetched Successfully",  chats:chats})
  }
);

const sendMessage = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const senderId = req.user?._id;
    const { chatId } = req.body;
    const { text } = req.body;
    const image = req.file;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!chatId) {
      return res.status(401).json({ message: "ChatId is required" });
    }

    if (!text && !image) {
      return res
        .status(401)
        .json({ message: "Either text or image is required" });
    }

    const savedMessage = await chatService.sendMessage(
      senderId,
      chatId,
      text,
      image
    );

    return res.status(201).json({ message: savedMessage, sender: senderId });
  }
);

const getMessagesByChat = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!chatId) {
      return res.status(401).json({ message: "ChatId is required" });
    }

    const { messages, user } = await chatService.getMessagesByChat(
      userId,
      chatId
    );

    return res.json({ messages: messages, user: user });
  }
);

export const chatController = {
  createNewChat,
  getAllChats,
  sendMessage,
  getMessagesByChat,
};
