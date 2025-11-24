import express from "express";
import {
    getMedicalRecords,
    createMedicalRecord,
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord,
    analyzeMedicalRecord,
} from "../controllers/medicalRecordController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMedicalRecords);
router.post("/", protect, createMedicalRecord);
router.get("/:id", protect, getMedicalRecordById);
router.put("/:id", protect, updateMedicalRecord);
router.delete("/:id", protect, deleteMedicalRecord);
router.post("/:id/analyze", protect, analyzeMedicalRecord);

export default router;
