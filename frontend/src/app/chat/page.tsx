"use client";
import ChatSidebar from "@/src/components/ChatSidebar";
import { useAppData} from "@/src/context/AppContext";
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
import { User } from "@/src/types/user";
import { Message } from "@/src/types/message";

const ChatApp = () => {
  // local state
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);

  // context
  const {
    isAuth,
    loading,
    logoutUser,
    chats,
    setChats,
    user: loggedInUser,
    users,
    fetchChats,
  } = useAppData();

  const { onlineUsers, socket } = useSocketData();
  const router = useRouter();

  // ─── Auth guard ───
  useEffect(() => {
    if (!isAuth && !loading) router.push("/login");
  }, [isAuth, loading, router]);

  // ─── Helpers ───

  // Move a chat to the top and update latestMessage / unseenCount
  const moveChatToTop = (
    chatId: string,
    newMessage: { text: string; sender: string },
    incrementUnseen = true
  ) => {
    setChats((prev) => {
      if (!prev) return null;
      const updatedChats = [...prev];
      const index = updatedChats.findIndex((item) => item.chat._id === chatId);
      if (index === -1) return prev;

      const [chatToMove] = updatedChats.splice(index, 1);
      const updatedChat = {
        ...chatToMove,
        chat: {
          ...chatToMove.chat,
          latestMessage: {
            text: newMessage.text,
            sender: newMessage.sender,
          },
          updatedAt: new Date().toISOString(),
          unseenCount:
            incrementUnseen && newMessage.sender !== loggedInUser?._id
              ? (chatToMove.chat.unseenCount || 0) + 1
              : chatToMove.chat.unseenCount || 0,
        },
      };
      updatedChats.unshift(updatedChat);
      return updatedChats;
    });
  };

  // Reset unseen count for a chat
  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null;
      return prev.map((item) =>
        item.chat._id === chatId
          ? { ...item, chat: { ...item.chat, unseenCount: 0 } }
          : item
      );
    });
  };

  // ─── Handlers ───
  const handleLogout = () => logoutUser();

  const createChat = async (u: User) => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `http://localhost:5300/api/v1/chat/new`,
        { userId: loggedInUser?._id, otherUserId: u._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedUser(data.newChat._id);
      setShowAllUsers(false);
      await fetchChats();
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.message);
    }
  };

  const fetchChat = async () => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.get(
        `http://localhost:5300/api/v1/chat/${selectedUser}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
    text: string,
    imageFile?: File | null
  ) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    if (!selectedUser) return;

    // Clear typing
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    });

    const token = Cookies.get("token");
    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser);
      if (text.trim()) formData.append("text", text);
      if (imageFile) formData.append("image", imageFile);

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

      // Optimistically add the message to the messages list
      setMessages((prev) => {
        const current = prev || [];
        if (current.some((msg) => msg._id === data.message._id)) return current;
        return [...current, data.message];
      });

      setMessage("");
      const displayText = imageFile ? "Image" : text;
      moveChatToTop(
        selectedUser,
        { text: displayText, sender: data.sender },
        false
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to send");
      }
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser || !socket) return;

    socket.emit("typing", { chatId: selectedUser, userId: loggedInUser?._id });

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket?.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }, 2000);
    setTypingTimeout(timeout);
  };

  // ─── Socket listeners ───
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message: Message) => {
      console.log("New message:", message);

      // Update message list if we are in the same chat
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const current = prev || [];
          if (current.some((msg) => msg._id === message._id)) return current;
          return [...current, message];
        });
        // move chat to top without incrementing unseen (we're in the chat)
        moveChatToTop(
          message.chatId,
          { text: message.text || "Image", sender: message.sender },
          false
        );
      } else {
        // increment unseen count for other chats
        moveChatToTop(
          message.chatId,
          { text: message.text || "Image", sender: message.sender },
          true
        );
      }
    };

    const onMessageSeen = (data: { chatId: string; messageIds: string[] }) => {
      console.log("Message seen:", data);
      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) => {
            if (
              msg.sender === loggedInUser?._id &&
              data.messageIds.includes(msg._id)
            ) {
              return { ...msg, seen: true, seenAt: new Date().toISOString() };
            }
            return msg;
          });
        });
      }
    };

    const onUserTyping = (data: { chatId: string; userId: string }) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true);
      }
    };

    const onUserTypingStop = (data: { chatId: string; userId: string }) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false);
      }
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messageSeen", onMessageSeen);
    socket.on("userTyping", onUserTyping);
    socket.on("userTypingStop", onUserTypingStop);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageSeen", onMessageSeen);
      socket.off("userTyping", onUserTyping);
      socket.off("userTypingStop", onUserTypingStop);
    };
  }, [socket, selectedUser, loggedInUser?._id, setChats]);

  // ─── Join/leave chat when selectedUser changes ───
  useEffect(() => {
    if (!selectedUser) return;

    const loadChat = async () => {
      await fetchChat();
      setIsTyping(false);
      resetUnseenCount(selectedUser);
    };
    loadChat();

    socket?.emit("joinChat", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    });

    return () => {
      socket?.emit("leaveChat", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
      setMessages(null);
    };
  }, [selectedUser]); // only run when selectedUser changes

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  // ─── Render ───
  if (loading) return <Loading />;

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
          onlineUsers={onlineUsers}
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
