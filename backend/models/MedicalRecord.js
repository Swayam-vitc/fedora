import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
    {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        doctor: { type: String, required: true },

        // Vital Signs
        bloodPressureSystolic: { type: Number }, // mmHg
        bloodPressureDiastolic: { type: Number }, // mmHg
        heartRate: { type: Number }, // bpm
        temperature: { type: Number }, // °F or °C
        oxygenSaturation: { type: Number }, // %
        bloodGlucose: { type: Number }, // mg/dL
        weight: { type: Number }, // kg or lbs
        height: { type: Number }, // cm or inches
        respiratoryRate: { type: Number }, // breaths/min

        // Symptoms and Medications
        symptoms: [{ type: String }],
        medications: [{ type: String }],

        // Medical Information
        diagnosis: { type: String },
        treatment: { type: String },
        date: { type: String, required: true },
        notes: { type: String },
        attachments: [{ type: String }], // URLs to files
    },
    { timestamps: true }
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
