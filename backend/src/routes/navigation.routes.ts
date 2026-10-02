import { Router } from "express";
import { navigate, navigateByCoords } from "../controllers/navigation.controller";

const router = Router();

router.post("/route", navigate);
router.post("/route-coords", navigateByCoords);

export default router;