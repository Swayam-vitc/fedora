import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: new Set(),
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io("http://localhost:5000", {
            autoConnect: true,
        });

        setSocket(newSocket);

        // Connection events
        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            setIsConnected(true);

            // Join with user ID
            const userId = localStorage.getItem("userId");
            if (userId) {
                newSocket.emit("user:join", userId);
            }
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        // User presence events
        newSocket.on("user:online", (userId: string) => {
            setOnlineUsers((prev) => new Set(prev).add(userId));
        });

        newSocket.on("user:offline", (userId: string) => {
            setOnlineUsers((prev) => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        });

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
