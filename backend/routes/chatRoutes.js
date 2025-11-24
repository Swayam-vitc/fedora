import express from "express";
import {
    sendMessage,
    getMessages,
    getConversations,
    markAsRead,
    uploadFile,
    upload,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/:appointmentId", protect, getMessages);
router.put("/read/:messageId", protect, markAsRead);
router.post("/upload", protect, upload.single("file"), uploadFile);

export default router;
