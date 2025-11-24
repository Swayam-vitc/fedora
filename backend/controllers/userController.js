// backend/controllers/userController.js
import User from "../models/User.js";

// GET /api/users
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// GET /api/users/doctors
export const getDoctors = async (req, res) => {
  try {
    const { specialty, minRating, isAvailable } = req.query;
    const filter = { role: "doctor" };

    if (specialty) filter.specialty = specialty;
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (isAvailable) filter.isAvailable = isAvailable === "true";

    const doctors = await User.find(filter).select("-password").sort({ rating: -1 });
    res.json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: "Server error fetching doctors" });
  }
};

// GET /api/users/patients
export const getPatients = async (_req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json(patients);
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ message: "Server error fetching patients" });
  }
};

// GET /api/users/doctor/:id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" }).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({ message: "Server error fetching doctor" });
  }
};

// PUT /api/users/doctor/profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const doctor = await User.findOneAndUpdate(
      { _id: userId, role: "doctor" },
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error("Update doctor profile error:", error);
    res.status(400).json({ message: "Error updating profile" });
  }
};