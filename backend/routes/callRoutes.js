import express from "express";
import {
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    getCallHistory,
    getActiveCall,
    timeoutCall,
} from "../controllers/callController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initiate", protect, initiateCall);
router.put("/:callId/accept", protect, acceptCall);
router.put("/:callId/decline", protect, declineCall);
router.put("/:callId/end", protect, endCall);
router.put("/:callId/timeout", protect, timeoutCall);
router.get("/history", protect, getCallHistory);
router.get("/active", protect, getActiveCall);

export default router;
