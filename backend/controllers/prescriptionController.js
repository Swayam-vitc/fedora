import Prescription from "../models/Prescription.js";

export const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.user._id }).sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        console.error("Get prescriptions error:", error);
        res.status(500).json({ message: "Error fetching prescriptions" });
    }
};

export const createPrescription = async (req, res) => {
    try {
        const { doctor, medication, dosage, frequency, startDate, endDate } = req.body;
        if (!doctor || !medication || !dosage || !frequency || !startDate || !endDate) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const newPrescription = await Prescription.create({
            ...req.body,
            patientId: req.user._id,
        });
        res.status(201).json(newPrescription);
    } catch (error) {
        console.error("Create prescription error:", error);
        res.status(400).json({ message: "Error creating prescription" });
    }
};
