import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    messageType: string;
    createdAt: string;
    isRead: boolean;
}

interface ChatBoxProps {
    appointmentId: string;
    receiverId: string;
    receiverName: string;
    onClose?: () => void;
}

const ChatBox = ({ appointmentId, receiverId, receiverName, onClose }: ChatBoxProps) => {
    const { socket } = useSocket();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const userId = localStorage.getItem("userId") || "";

    // Fetch messages
    useEffect(() => {
        fetchMessages();
    }, [appointmentId]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/chat/${appointmentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on("chat:message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        socket.on("chat:typing", ({ senderId, isTyping: typing }) => {
            if (senderId === receiverId) {
                setIsTyping(typing);
            }
        });

        return () => {
            socket.off("chat:message");
            socket.off("chat:typing");
        };
    }, [socket, receiverId]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    appointmentId,
                    receiverId,
                    message: newMessage,
                    messageType: "text",
                }),
            });

            if (response.ok) {
                const sentMessage = await response.json();
                setMessages((prev) => [...prev, sentMessage]);

                // Emit via socket for real-time delivery
                socket?.emit("chat:message", {
                    receiverId,
                    message: sentMessage,
                });

                setNewMessage("");
                scrollToBottom();
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive",
            });
        }
    };

    // Handle typing indicator
    const handleTyping = () => {
        socket?.emit("chat:typing", {
            receiverId,
            isTyping: true,
        });

        setTimeout(() => {
            socket?.emit("chat:typing", {
                receiverId,
                isTyping: false,
            });
        }, 1000);
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Chat with {receiverName}</CardTitle>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isSent = msg.senderId === userId;
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${isSent
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg px-4 py-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button onClick={handleSendMessage}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatBox;
