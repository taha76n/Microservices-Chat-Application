"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';
import axios from "axios";
import toast, {Toaster} from "react-hot-toast"


interface User {
  _id: string;
  userName: string;
  email: string;
}

interface Chat {
  _id: string;
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
  unseenCount?: number;
}

interface Chats {
  _id: string;
  user: User;
  chat: Chat;
}

interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  fetchChats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  users: User[] | null;
  chats: Chats[] | null;
  setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const token = Cookies.get("token")
      const {data} = await axios.get(`http://localhost:5301/api/v1/user/me`,
        {headers: {
          Authorization: `Bearer ${token}`
        }}
      )
      setUser(data);
      setIsAuth(true);
      setLoading(false)
      
    } catch (error) {
      console.log(error)
      setIsAuth(false);
      setLoading(false)
    }
  }

  const logoutUser = async () => {
    Cookies.remove("token")
    setUser(null)
    setIsAuth(false)
    toast.success("User Logged out successfully")
  }

  const [chats, setChats] = useState<Chats[] | null>(null);

  const fetchChats = async () => {
    const token = Cookies.get("token")
    try {
      const {data} = await axios.post(`http://localhost:5302/api/v1/chat/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setChats(data.chats)      
    } catch (error) {
      console.log(error);
      
    }
  }

  const [users, setUsers] = useState<User[] | null>(null);

  const fetchUsers = async () => {
    const token = Cookies.get("token")
    try {
      const {data} = await axios.post(`http://localhost:5301/api/v1/user/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setUsers(data)      
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchUser();
    fetchChats();
    fetchUsers()
  }, [])

  return (
    <AppContext.Provider
      value={{ user,isAuth, loading, setUser, setIsAuth, logoutUser, fetchUsers, fetchChats, users, chats, setChats}}>
      {children}
      <Toaster/>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppData must be use within AppProvider")
  }
  return context;
}
