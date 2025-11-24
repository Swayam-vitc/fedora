import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema(
    {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        status: {
            type: String,
            enum: ["initiated", "ringing", "accepted", "declined", "ended", "timeout"],
            default: "initiated",
        },
        startTime: { type: Date },
        endTime: { type: Date },
        duration: { type: Number }, // in seconds
        callType: { type: String, enum: ["video", "audio"], default: "video" },
        roomId: { type: String, required: true, unique: true },
        declineReason: { type: String },
    },
    { timestamps: true }
);

const CallSession = mongoose.model("CallSession", callSessionSchema);
export default CallSession;
