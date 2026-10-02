import { Router } from "express";
import {
  createContact,
  listContacts,
  updateContact,
  deleteContact,
} from "../controllers/emergencyContacts.controller";

const router = Router();

router.post("/", createContact);
router.get("/", listContacts);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;