import axios from "axios";
import { Chat } from "../model/chat.js";
import { Message } from "../model/messsage.js";
import { config } from "../configs/index.js";
import { BadRequestError, NotFoundError } from "../utils/error.js";
import { logger } from "../configs/logger.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { getReceiverSocketId, io } from "../configs/socket.js";

const createNewChat = async (userId: string, otherUserId: string) => {
  const existingChat = await Chat.findOne({
    users: {
      $all: [userId, otherUserId],
      $size: 2,
    },
  });

  if (existingChat) {
    throw new BadRequestError("Chat already exists");
  }

  const newChat = await Chat.create({ users: [userId, otherUserId] });

  return newChat;
};

const getAllChats = async (userId: string) => {
  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  const chatsWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);
      const unseenCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        const { data } = await axios.get(
          `http://localhost:${config.USER_SERVICE_URL}/api/v1/user/user/${otherUserId}`
        );

        return {
          user: data.user,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      } catch (error) {
        logger.error(error);
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
  return chatsWithUserData;
};

const sendMessage = async (
  senderId: string,
  chatId: string,
  text: string,
  imageFile: Express.Multer.File | undefined
) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new BadRequestError("Chat not Found");
  }

  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );

  if (!isUserInChat) {
    throw new BadRequestError("You are not a participant of this chat");
  }
  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  );

  if (!otherUserId) {
    throw new BadRequestError("No other user in this chat");
  }

  //socket setup

  const receiverSocketId = getReceiverSocketId(otherUserId.toString());
  let isReceiverInChatRoom = false;

  if (receiverSocketId) {
    const receiverSocket = io.sockets.sockets.get(receiverSocketId);
    if (receiverSocket && receiverSocket.rooms.has(chatId)) {
      isReceiverInChatRoom = true;
    }
  }

  interface MessageData {
    chatId: string;
    sender: string;
    seen: boolean;
    seenAt?: Date;
    text?: string;
    image?: {
      url: string;
      // publicId: string;
    };
    messageType: "text" | "image";
  }

  let messageData: MessageData = {
    chatId: chatId,
    sender: senderId,
    seen: isReceiverInChatRoom,
    ...(isReceiverInChatRoom && { seenAt: new Date() }),
    // seenAt: isReceiverInChatRoom? new Date() : undefined,
    messageType: "text",
  };  

  if (imageFile) {
    // Upload the image buffer to Cloudinary
    const imageUrl = await uploadToCloudinary(imageFile); // <-- this returns the secure URL
    messageData.image = {
      url: imageUrl,
      // publicId: result.public_id
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
  io.to(chatId).emit("newMessage", savedMessage)
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", savedMessage)
  }

  const senderSockedId = getReceiverSocketId(senderId.toString())
  if (senderSockedId) {
    io.to(senderSockedId).emit("newMessage", savedMessage)
  }

  if (isReceiverInChatRoom && senderSockedId) {
    io.to(senderSockedId).emit("messageSeen", {
      chatId: chatId,
      seenBy: otherUserId,
      messageIds: [savedMessage._id]
    })
    
  }


  return savedMessage;
};

const getMessagesByChat = async (userId: string, chatId: string) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new NotFoundError("Chat not Found");
  }

  const isUserInChat = chat.users.some(
    (chatUserId) => chatUserId.toString() === userId.toString()
  );

  if (!isUserInChat) {
    throw new BadRequestError("You are not a participant of this chat");
  }

  const messagesToMarkSeen = await Message.find({
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

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

  const otherUserId = chat.users.find(
    (userid) => userid.toString() !== userId.toString()
  );

  if (messagesToMarkSeen.length > 0) {
    const otherUserSocketId = getReceiverSocketId(otherUserId?.toString())
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("messageSeen", {
        chatId: chatId,
        seenBy: userId,
        messageIds: messagesToMarkSeen.map((msg) => msg._id)

      })
    }
  }

  try {
    const data = await axios.get(
      `${config.USER_SERVICE_URL}/api/v1/user/user/${otherUserId}`
    );

    if (!otherUserId) {
      throw new Error("No other user");
    }  

    return { messages, otherUserId };
  } catch (error) {
    console.log(error);
    return {
      messages,
      user: { _id: otherUserId, userName: "Unknown User" },
    };
  }
};

export const chatService = {
  createNewChat,
  getAllChats,
  sendMessage,
  getMessagesByChat,
};
