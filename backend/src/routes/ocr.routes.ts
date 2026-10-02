import { Router } from "express";
import { summarize } from "../controllers/ocr.controller";

const router = Router();

router.post("/summarize", summarize);

export default router;