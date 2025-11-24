import Appointment from "../models/Appointment.js";

export const getAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};

    const data = await Appointment.find(filter)
      .populate("patientId", "name email")
      .populate("medicalRecords")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, patientId } = req.body;
    if (!doctor || !date || !time || !patientId) {
      return res.status(400).json({ message: "Please provide doctor, date, time, and patientId" });
    }
    const newAppointment = await Appointment.create(req.body);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(400).json({ message: "Error creating appointment" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email")
      .populate("medicalRecords");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ message: "Error fetching appointment" });
  }
};