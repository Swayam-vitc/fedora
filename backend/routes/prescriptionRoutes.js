import express from "express";
import {
    getPrescriptions,
    createPrescription,
} from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPrescriptions);
router.post("/", protect, createPrescription);

export default router;
