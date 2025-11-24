// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      required: [true, "Role is required"],
    },
    specialization: {
      type: String, // only relevant for doctors
    },
    // Doctor Profile Fields
    specialty: { type: String }, // Primary medical specialty
    qualifications: [{ type: String }], // Array of degrees/certifications
    experience: { type: Number }, // Years of experience
    bio: { type: String }, // Profile description
    consultationFee: { type: Number }, // Fee per consultation
    rating: { type: Number, default: 0 }, // Average rating
    availability: {
      type: Map,
      of: [String], // e.g., { "Monday": ["9:00-12:00", "14:00-17:00"] }
    },
    profileImage: { type: String }, // URL to profile photo
    isAvailable: { type: Boolean, default: true }, // Online status
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;