// backend/server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

// Routes
import appointmentRoutes from "./routes/appointmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import callRoutes from "./routes/callRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Use express.json to parse JSON bodies
app.use(express.json());

// Use default CORS (allows all origins, handles preflight automatically)
app.use(cors());

// Serve static files (for uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Optional: additional CORS headers fallback (safe)
app.use((req, res, next) => {
  // Only set these if not already set by cors()
  if (!res.getHeader("Access-Control-Allow-Origin")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  if (!res.getHeader("Access-Control-Allow-Methods")) {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
  }
  if (!res.getHeader("Access-Control-Allow-Headers")) {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
  }
  next();
});

// Connect DB (prints error if can't connect)
try {
  connectDB();
} catch (err) {
  console.error("Error calling connectDB():", err);
}

// API routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/calls", callRoutes);

// Health-check / base route
app.get("/", (req, res) => {
  res.send("API running with full CORS and Socket.io");
});

// Simple 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Socket.io connection handling
const activeUsers = new Map(); // Store userId -> socketId mapping
const activeCalls = new Map(); // Store roomId -> {caller, receiver} mapping

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with their ID
  socket.on("user:join", (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);

    // Notify user is online
    io.emit("user:online", userId);
  });

  // Chat message
  socket.on("chat:message", (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = activeUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chat:message", {
        ...message,
        senderId: socket.userId,
      });
    }
  });

  // Typing indicator
  socket.on("chat:typing", (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = activeUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chat:typing", {
        senderId: socket.userId,
        isTyping,
      });
    }
  });

  // WebRTC Signaling for Video Calls
  socket.on("call:initiate", (data) => {
    const { receiverId, roomId } = data;
    const receiverSocketId = activeUsers.get(receiverId);

    if (receiverSocketId) {
      activeCalls.set(roomId, {
        caller: socket.userId,
        receiver: receiverId,
      });

      io.to(receiverSocketId).emit("call:incoming", {
        callerId: socket.userId,
        roomId,
      });
    }
  });

  socket.on("call:accept", (data) => {
    const { callerId, roomId } = data;
    const callerSocketId = activeUsers.get(callerId);

    if (callerSocketId) {
      socket.join(roomId);
      io.to(callerSocketId).emit("call:accepted", {
        receiverId: socket.userId,
        roomId,
      });
      io.sockets.sockets.get(callerSocketId)?.join(roomId);
    }
  });

  socket.on("call:reject", (data) => {
    const { callerId } = data;
    const callerSocketId = activeUsers.get(callerId);

    if (callerSocketId) {
      io.to(callerSocketId).emit("call:rejected", {
        receiverId: socket.userId,
      });
    }
  });

  // WebRTC signaling
  socket.on("webrtc:offer", (data) => {
    const { receiverId, offer } = data;
    const receiverSocketId = activeUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc:offer", {
        senderId: socket.userId,
        offer,
      });
    }
  });

  socket.on("webrtc:answer", (data) => {
    const { receiverId, answer } = data;
    const receiverSocketId = activeUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc:answer", {
        senderId: socket.userId,
        answer,
      });
    }
  });

  socket.on("webrtc:ice-candidate", (data) => {
    const { receiverId, candidate } = data;
    const receiverSocketId = activeUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc:ice-candidate", {
        senderId: socket.userId,
        candidate,
      });
    }
  });

  socket.on("call:end", (data) => {
    const { roomId, receiverId } = data;
    const receiverSocketId = activeUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:ended", {
        senderId: socket.userId,
      });
    }

    activeCalls.delete(roomId);
    socket.leave(roomId);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.userId) {
      activeUsers.delete(socket.userId);
      io.emit("user:offline", socket.userId);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready`);
});

// Extra safety: log unhandled rejections / exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
  // Optionally exit: process.exit(1);
});
