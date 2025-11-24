import CallSession from "../models/CallSession.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";

// Initiate a new call
export const initiateCall = async (req, res) => {
    try {
        const { doctorId, appointmentId } = req.body;
        const patientId = req.user._id;

        // Verify doctor exists and is available
        const doctor = await User.findOne({
            _id: doctorId,
            role: "doctor",
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        if (!doctor.isAvailable) {
            return res.status(400).json({ message: "Doctor is currently offline" });
        }

        // Create call session
        const roomId = uuidv4();
        const callSession = await CallSession.create({
            patientId,
            doctorId,
            appointmentId,
            status: "ringing",
            roomId,
            callType: "video",
        });

        const populatedSession = await CallSession.findById(callSession._id)
            .populate("patientId", "name email phone")
            .populate("doctorId", "name email specialty");

        res.status(201).json(populatedSession);
    } catch (error) {
        console.error("Initiate call error:", error);
        res.status(500).json({ message: "Error initiating call" });
    }
};

// Accept a call
export const acceptCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const doctorId = req.user._id;

        const callSession = await CallSession.findOne({
            _id: callId,
            doctorId,
            status: "ringing",
        });

        if (!callSession) {
            return res.status(404).json({ message: "Call not found or already answered" });
        }

        callSession.status = "accepted";
        callSession.startTime = new Date();
        await callSession.save();

        const populatedSession = await CallSession.findById(callSession._id)
            .populate("patientId", "name email phone")
            .populate("doctorId", "name email specialty");

        res.json(populatedSession);
    } catch (error) {
        console.error("Accept call error:", error);
        res.status(500).json({ message: "Error accepting call" });
    }
};

// Decline a call
export const declineCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const { reason } = req.body;
        const doctorId = req.user._id;

        const callSession = await CallSession.findOne({
            _id: callId,
            doctorId,
            status: "ringing",
        });

        if (!callSession) {
            return res.status(404).json({ message: "Call not found or already answered" });
        }

        callSession.status = "declined";
        callSession.endTime = new Date();
        callSession.declineReason = reason || "Doctor declined the call";
        await callSession.save();

        res.json(callSession);
    } catch (error) {
        console.error("Decline call error:", error);
        res.status(500).json({ message: "Error declining call" });
    }
};

// End an active call
export const endCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user._id;

        const callSession = await CallSession.findOne({
            _id: callId,
            $or: [{ patientId: userId }, { doctorId: userId }],
            status: "accepted",
        });

        if (!callSession) {
            return res.status(404).json({ message: "Active call not found" });
        }

        callSession.status = "ended";
        callSession.endTime = new Date();

        // Calculate duration in seconds
        if (callSession.startTime) {
            const duration = Math.floor((callSession.endTime - callSession.startTime) / 1000);
            callSession.duration = duration;
        }

        await callSession.save();

        res.json(callSession);
    } catch (error) {
        console.error("End call error:", error);
        res.status(500).json({ message: "Error ending call" });
    }
};

// Get call history
export const getCallHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { role } = req.user;

        const filter = role === "doctor"
            ? { doctorId: userId }
            : { patientId: userId };

        const calls = await CallSession.find(filter)
            .populate("patientId", "name email phone")
            .populate("doctorId", "name email specialty")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(calls);
    } catch (error) {
        console.error("Get call history error:", error);
        res.status(500).json({ message: "Error fetching call history" });
    }
};

// Get active call
export const getActiveCall = async (req, res) => {
    try {
        const userId = req.user._id;

        const activeCall = await CallSession.findOne({
            $or: [{ patientId: userId }, { doctorId: userId }],
            status: { $in: ["ringing", "accepted"] },
        })
            .populate("patientId", "name email phone")
            .populate("doctorId", "name email specialty");

        res.json(activeCall);
    } catch (error) {
        console.error("Get active call error:", error);
        res.status(500).json({ message: "Error fetching active call" });
    }
};

// Mark call as timeout
export const timeoutCall = async (req, res) => {
    try {
        const { callId } = req.params;

        const callSession = await CallSession.findOne({
            _id: callId,
            status: "ringing",
        });

        if (!callSession) {
            return res.status(404).json({ message: "Call not found" });
        }

        callSession.status = "timeout";
        callSession.endTime = new Date();
        await callSession.save();

        res.json(callSession);
    } catch (error) {
        console.error("Timeout call error:", error);
        res.status(500).json({ message: "Error timing out call" });
    }
};
