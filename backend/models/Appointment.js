// backend/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, default: "Hospital" },
    type: { type: String, default: "Consultation" },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    medicalRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord" }],
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;