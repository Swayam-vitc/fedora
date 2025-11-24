import Chat from "../models/Chat.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { appointmentId, receiverId, message, messageType } = req.body;
        const senderId = req.user._id;

        const newMessage = await Chat.create({
            appointmentId,
            senderId,
            receiverId,
            message,
            messageType: messageType || "text",
        });

        const populatedMessage = await Chat.findById(newMessage._id)
            .populate("senderId", "name email role")
            .populate("receiverId", "name email role");

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Send message error:", error);
        res.status(400).json({ message: "Error sending message" });
    }
};

// Get messages for an appointment
export const getMessages = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const messages = await Chat.find({ appointmentId })
            .populate("senderId", "name email role")
            .populate("receiverId", "name email role")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ message: "Error fetching messages" });
    }
};

// Get chat conversations for a user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Chat.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { receiverId: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: "$appointmentId",
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$isRead", false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        res.json(conversations);
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({ message: "Error fetching conversations" });
    }
};

// Mark message as read
export const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Chat.findByIdAndUpdate(
            messageId,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.json(message);
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ message: "Error updating message" });
    }
};

// Upload file
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl, filename: req.file.originalname });
    } catch (error) {
        console.error("Upload file error:", error);
        res.status(500).json({ message: "Error uploading file" });
    }
};
