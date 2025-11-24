import express from "express";
import {
  getAppointments,
  createAppointment,
  getAppointmentById,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAppointments);
router.post("/", protect, createAppointment);
router.get("/:id", protect, getAppointmentById);

export default router;