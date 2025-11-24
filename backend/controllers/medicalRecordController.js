import MedicalRecord from "../models/MedicalRecord.js";
import Appointment from "../models/Appointment.js";

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
    try {
        console.log("Creating medical record with data:", req.body);

        // Validate required fields
        if (!req.body.patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }
        if (!req.body.doctor) {
            return res.status(400).json({ message: "Doctor name is required" });
        }
        if (!req.body.date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const medicalRecord = await MedicalRecord.create(req.body);

        // If appointmentId is provided, add this record to the appointment
        if (req.body.appointmentId) {
            await Appointment.findByIdAndUpdate(
                req.body.appointmentId,
                { $push: { medicalRecords: medicalRecord._id } }
            );
        }

        res.status(201).json(medicalRecord);
    } catch (error) {
        console.error("Create medical record error:", error);
        res.status(400).json({
            message: "Error creating medical record",
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : null
        });
    }
};

// Get all medical records (optionally filtered by patientId)
export const getMedicalRecords = async (req, res) => {
    try {
        const { patientId } = req.query;
        const filter = patientId ? { patientId } : {};

        const records = await MedicalRecord.find(filter)
            .populate("patientId", "name email")
            .sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error("Get medical records error:", error);
        res.status(500).json({ message: "Error fetching medical records" });
    }
};

// Get a specific medical record by ID
export const getMedicalRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate("patientId", "name email");

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        res.json(record);
    } catch (error) {
        console.error("Get medical record error:", error);
        res.status(500).json({ message: "Error fetching medical record" });
    }
};

// Update a medical record
export const updateMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        res.json(record);
    } catch (error) {
        console.error("Update medical record error:", error);
        res.status(400).json({ message: "Error updating medical record" });
    }
};

// Delete a medical record
export const deleteMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByIdAndDelete(req.params.id);

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        // Remove from appointment if linked
        if (record.appointmentId) {
            await Appointment.findByIdAndUpdate(
                record.appointmentId,
                { $pull: { medicalRecords: record._id } }
            );
        }

        res.json({ message: "Medical record deleted successfully" });
    } catch (error) {
        console.error("Delete medical record error:", error);
        res.status(500).json({ message: "Error deleting medical record" });
    }
};

// Analyze medical record and provide health insights
export const analyzeMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        const analysis = {
            recordId: record._id,
            date: record.date,
            vitalSigns: {},
            overallStatus: "normal",
            alerts: [],
            recommendations: []
        };

        // Blood Pressure Analysis
        if (record.bloodPressureSystolic && record.bloodPressureDiastolic) {
            const systolic = record.bloodPressureSystolic;
            const diastolic = record.bloodPressureDiastolic;

            if (systolic < 90 || diastolic < 60) {
                analysis.vitalSigns.bloodPressure = {
                    value: `${systolic}/${diastolic}`,
                    status: "critical",
                    message: "Low blood pressure detected"
                };
                analysis.alerts.push("Low blood pressure - consult doctor immediately");
                analysis.overallStatus = "critical";
            } else if (systolic >= 140 || diastolic >= 90) {
                analysis.vitalSigns.bloodPressure = {
                    value: `${systolic}/${diastolic}`,
                    status: "warning",
                    message: "High blood pressure detected"
                };
                analysis.alerts.push("High blood pressure - monitor closely");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else if (systolic >= 120 || diastolic >= 80) {
                analysis.vitalSigns.bloodPressure = {
                    value: `${systolic}/${diastolic}`,
                    status: "warning",
                    message: "Elevated blood pressure"
                };
                analysis.recommendations.push("Consider lifestyle modifications");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else {
                analysis.vitalSigns.bloodPressure = {
                    value: `${systolic}/${diastolic}`,
                    status: "normal",
                    message: "Blood pressure is normal"
                };
            }
        }

        // Heart Rate Analysis
        if (record.heartRate) {
            const hr = record.heartRate;

            if (hr < 60) {
                analysis.vitalSigns.heartRate = {
                    value: hr,
                    unit: "bpm",
                    status: "warning",
                    message: "Low heart rate (Bradycardia)"
                };
                analysis.recommendations.push("Low heart rate detected - consult if symptomatic");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else if (hr > 100) {
                analysis.vitalSigns.heartRate = {
                    value: hr,
                    unit: "bpm",
                    status: "warning",
                    message: "High heart rate (Tachycardia)"
                };
                analysis.recommendations.push("Elevated heart rate - ensure adequate rest");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else {
                analysis.vitalSigns.heartRate = {
                    value: hr,
                    unit: "bpm",
                    status: "normal",
                    message: "Heart rate is normal"
                };
            }
        }

        // Temperature Analysis
        if (record.temperature) {
            const temp = record.temperature;

            if (temp < 97) {
                analysis.vitalSigns.temperature = {
                    value: temp,
                    unit: "°F",
                    status: "warning",
                    message: "Low body temperature"
                };
                analysis.recommendations.push("Low temperature - ensure warmth");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else if (temp > 100.4) {
                analysis.vitalSigns.temperature = {
                    value: temp,
                    unit: "°F",
                    status: "critical",
                    message: "Fever detected"
                };
                analysis.alerts.push("Fever present - monitor and treat as needed");
                analysis.overallStatus = "critical";
            } else {
                analysis.vitalSigns.temperature = {
                    value: temp,
                    unit: "°F",
                    status: "normal",
                    message: "Temperature is normal"
                };
            }
        }

        // Oxygen Saturation Analysis
        if (record.oxygenSaturation) {
            const o2 = record.oxygenSaturation;

            if (o2 < 90) {
                analysis.vitalSigns.oxygenSaturation = {
                    value: o2,
                    unit: "%",
                    status: "critical",
                    message: "Critically low oxygen saturation"
                };
                analysis.alerts.push("Low oxygen saturation - seek immediate medical attention");
                analysis.overallStatus = "critical";
            } else if (o2 < 95) {
                analysis.vitalSigns.oxygenSaturation = {
                    value: o2,
                    unit: "%",
                    status: "warning",
                    message: "Low oxygen saturation"
                };
                analysis.recommendations.push("Monitor oxygen levels closely");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else {
                analysis.vitalSigns.oxygenSaturation = {
                    value: o2,
                    unit: "%",
                    status: "normal",
                    message: "Oxygen saturation is normal"
                };
            }
        }

        // Blood Glucose Analysis
        if (record.bloodGlucose) {
            const glucose = record.bloodGlucose;

            if (glucose < 70) {
                analysis.vitalSigns.bloodGlucose = {
                    value: glucose,
                    unit: "mg/dL",
                    status: "critical",
                    message: "Low blood sugar (Hypoglycemia)"
                };
                analysis.alerts.push("Low blood sugar - consume fast-acting carbohydrates");
                analysis.overallStatus = "critical";
            } else if (glucose > 180) {
                analysis.vitalSigns.bloodGlucose = {
                    value: glucose,
                    unit: "mg/dL",
                    status: "warning",
                    message: "High blood sugar (Hyperglycemia)"
                };
                analysis.recommendations.push("Elevated blood sugar - monitor diet and medication");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else {
                analysis.vitalSigns.bloodGlucose = {
                    value: glucose,
                    unit: "mg/dL",
                    status: "normal",
                    message: "Blood glucose is normal"
                };
            }
        }

        // Respiratory Rate Analysis
        if (record.respiratoryRate) {
            const rr = record.respiratoryRate;

            if (rr < 12 || rr > 20) {
                analysis.vitalSigns.respiratoryRate = {
                    value: rr,
                    unit: "breaths/min",
                    status: "warning",
                    message: "Abnormal respiratory rate"
                };
                analysis.recommendations.push("Monitor breathing pattern");
                if (analysis.overallStatus === "normal") analysis.overallStatus = "warning";
            } else {
                analysis.vitalSigns.respiratoryRate = {
                    value: rr,
                    unit: "breaths/min",
                    status: "normal",
                    message: "Respiratory rate is normal"
                };
            }
        }

        // General recommendations
        if (analysis.overallStatus === "normal") {
            analysis.recommendations.push("All vital signs are within normal range");
            analysis.recommendations.push("Continue maintaining a healthy lifestyle");
        }

        res.json(analysis);
    } catch (error) {
        console.error("Analyze medical record error:", error);
        res.status(500).json({ message: "Error analyzing medical record" });
    }
};
