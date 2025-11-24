import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String },
        attachments: [{ type: String }], // URLs to uploaded files
        messageType: { type: String, enum: ["text", "file", "image"], default: "text" },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
