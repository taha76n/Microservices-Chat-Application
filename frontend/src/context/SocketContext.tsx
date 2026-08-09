// "use client"
// import {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { io, Socket } from "socket.io-client";
// import { useAppData } from "./AppContext";

// interface SocketContextType {
//   socket: Socket | null;
//   onlineUsers: string[] | []
// }

// export const SocketContext = createContext<SocketContextType | null>({
//   socket: null,
//   onlineUsers: []
// });

// interface ProviderProps {
//   children: ReactNode;
// }

// export const SocketContextProvider = ({ children }: ProviderProps) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [onlineUsers, setOnlineUsers] = useState<string[] | []>([])
//   const { user } = useAppData();

//   useEffect(() => {
//     if (!user?._id) {
//       return;
//     }

//     const newSocket = io("http://localhost:5300", {
//       query: {
//         userId: user?._id
//       }
//     });

//     newSocket.on("getOnlineUser", (users: string[]) => {

//       setOnlineUsers(users)
//     })    

    
//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [user?._id]);

//   return (
//     <SocketContext.Provider value={{ socket, onlineUsers }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocketData = () => {
//   const context = useContext(SocketContext);

//   return context;
// };


"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

// Default value matches the interface
const defaultContext: SocketContextType = {
  socket: null,
  onlineUsers: [],
};

export const SocketContext = createContext<SocketContextType>(defaultContext);

interface ProviderProps {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: ProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAppData();

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io("http://localhost:5300", {
      query: { userId: user._id },
    });

    newSocket.on("getOnlineUser", (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook now returns a guaranteed SocketContextType (never null)
export const useSocketData = (): SocketContextType => {
  const context = useContext(SocketContext);
  // No need to check for null – the context is always defined
  return context;
};