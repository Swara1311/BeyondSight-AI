import { Router } from "express";
import { triggerSos, listSosHistory } from "../controllers/sos.controller";

const router = Router();

router.post("/trigger", triggerSos);
router.get("/history", listSosHistory);

export default router;