import axios from "axios";
import { Chat } from "../model/chat.js";
import { Message } from "../model/messsage.js";
import { config } from "../configs/index.js";

const createNewChat = async (userId: string, otherUserId: string) => {
  const existingChat = await Chat.findOne({
    $all: [userId, otherUserId],
    $size: 2,
  });

  if (existingChat) {
    throw new Error("Chat already exists");
  }

  const newChat = await Chat.create({ users: [userId, otherUserId] });

  return newChat;
};

const getAllChats = async (userId: string) => {
  const chats = await Chat.findOne({ users: userId }).sort({ updatedAt: -1 });

  const chatsWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chats.users.find((id) => id !== userId);
      const unseenCount = await Message.countDocuments({
        _id: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        const data = await axios.get(
          `${config.USER_SERVICE_URL}/api/v1/user/user/${otherUserId}`
        );

        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      } catch (error) {
        console.log(error);
        return {
          user: { _id: otherUserId, name: "Unknown User" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      }
    })
  );
};

const sendMessage = async (senderId: string, chatId: string, text: string, imageFile: string) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new Error("Chat not Found");
  }

  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );

  if (!isUserInChat) {
    throw new Error("You are not a participant of this chat");
  }
  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  );

  if (!otherUserId) {
    throw new Error("No other user in this chat");
  }

  //socket setup

  let messageData = {
    chatId: chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };

  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.fileName,
    };

    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }

  const message = new Message(messageData);

  const savedMessage = await message.save();

  const latestMessageText = imageFile ? "Image" : text;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: {
        text: latestMessageText,
        sender: senderId,
      },
      updatedAt: new Date(),
    },
    { new: true }
  );

  // emit to socket

  return { savedMessage };
};

const getMessagesByChat = async (userId: string, chatId: string) => {
  const chat = await Chat.findById(userId);

  if (!chat) {
    throw new Error("Chat not Found");
  }

  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === userId.toString()
  );

  if (!isUserInChat) {
    throw new Error("You are not a participant of this chat");
  }

  const messagesToMarkSeen = await Message.findOne({
    chatId,
    sender: { $ne: userId },
    seen: false,
  });

  await Message.updateMany(
    {
      chatId,
      sender: { $ne: userId },
      seen: false,
    },
    {
      seen: true,
      seenAt: new Date(),
    }
  );

  const messages = await Message.find({ chatId }).sort({ createdAt: -1 });

  const otherUserId = chat.users.find(
    (userid) => userid.toString() !== userId.toString()
  );

  try {
    const data = await axios.get(
      `${config.USER_SERVICE_URL}/api/v1/user/user/${otherUserId}`
    );

    if (!otherUserId) {
      throw new Error("No other user");
    }

    //socket

    return { messages, data };
  } catch (error) {
    console.log(error);
    return {
      messages,
      user: { _id: otherUserId, name: "Unknown User" },
    };
  }
};

export const chatService = {
  createNewChat,
  getAllChats,
  sendMessage,
  getMessagesByChat
};
