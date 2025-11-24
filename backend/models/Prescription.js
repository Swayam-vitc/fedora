import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
    {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctor: { type: String, required: true },
        medication: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        status: { type: String, default: "Active" },
    },
    { timestamps: true }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
