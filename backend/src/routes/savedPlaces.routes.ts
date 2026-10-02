import { Router } from "express";
import {
  createSavedPlace,
  listSavedPlaces,
  deleteSavedPlace,
} from "../controllers/savedPlaces.controller";

const router = Router();

router.post("/", createSavedPlace);
router.get("/", listSavedPlaces);
router.delete("/:id", deleteSavedPlace);

export default router;