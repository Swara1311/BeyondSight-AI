import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { verifyToken } from "../utils/jwt";

function getUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  relationship: z.string().min(1),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  relationship: z.string().min(1).optional(),
});

export async function createContact(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Name, phone, and relationship are required." });
    }

    const { name, phone, relationship } = parsed.data;

    const contact = await prisma.emergencyContact.create({
      data: { userId, name, phone, relationship },
    });

    return res.status(201).json({ contact });
  } catch (error) {
    console.error("Create contact error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

export async function listContacts(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
    });

    return res.json({ contacts });
  } catch (error) {
    console.error("List contacts error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const { id } = req.params;

    const existing = await prisma.emergencyContact.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Contact not found." });
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input." });
    }

    const contact = await prisma.emergencyContact.update({
      where: { id },
      data: parsed.data,
    });

    return res.json({ contact });
  } catch (error) {
    console.error("Update contact error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const { id } = req.params;

    const existing = await prisma.emergencyContact.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Contact not found." });
    }

    await prisma.emergencyContact.delete({ where: { id } });

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete contact error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}