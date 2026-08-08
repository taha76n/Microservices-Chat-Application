"use client";
import ChatSidebar from "@/src/components/ChatSidebar";
import { useAppData, User } from "@/src/context/AppContext";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Loading from "@/src/components/Loading";
import ChatHeader from "@/src/components/ChatHeader";
import ChatMessages from "@/src/components/ChatMessages";
import MessageInput from "@/src/components/MessageInput";
import { useSocketData } from "@/src/context/SocketContext";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: Date;
}

const ChatApp = () => {
  const {
    isAuth,
    loading,
    logoutUser,
    chats,
    user: loggedInUser,
    users,
    fetchChats,
  } = useAppData();

  const {onlineUsers} = useSocketData()
  

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  const handleLogout = () => logoutUser();

  const createChat = async (u: User) => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `http://localhost:5300/api/v1/chat/new`,
        {
          userId: loggedInUser?._id,
          otherUserId: u._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedUser(data.newChat._id);
      setShowAllUsers(false);
      await fetchChats();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.message);
      }
    }
  };

  const fetchChat = async () => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.get(
        `http://localhost:5300/api/v1/chat/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to load Messages");
    }
  };

  const handleSendMessage = async (
    e: React.FormEvent,
    message: string,
    imageFile?: File | null
  ) => {
    e.preventDefault();

    if (!message.trim() && !imageFile) {
      return;
    }

    if (!selectedUser) {
      return;
    }

    //socket work

    const token = Cookies.get("token");
    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser);

      if (message.trim()) {
        formData.append("text", message);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.post(
        `http://localhost:5300/api/v1/chat/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        );
        if (!messageExists) {
          return [...currentMessages, data.message];
        }
        return currentMessages;
      });

      setMessage("");
      const displayText = imageFile ? "image" : message;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!selectedUser) {
      return;
    }

    //socket
  };

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
    }
  }, [selectedUser]);

  if (loading) {
    <Loading />;
  }
  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-900 text-white relative">
      <ChatSidebar
        selectedUser={selectedUser}
        users={users}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        setSelectedUser={setSelectedUser}
        loggedInUser={loggedInUser}
        chats={chats}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />
      <div className="flex-1 flex flex-col justify-between p-4 backdrop:blur-xl bg-white/5 border border-white/10">
        <ChatHeader
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
          user={loggedInUser}
        />
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          loggedInUser={loggedInUser}
        />
        <MessageInput
          selectedUser={selectedUser}
          message={message}
          setMessage={handleTyping}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatApp;
