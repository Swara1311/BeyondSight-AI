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

const sosSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  message: z.string().optional(),
});

export async function triggerSos(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const parsed = sosSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Location is required." });
    }

    const { latitude, longitude, message } = parsed.data;

    const sosEvent = await prisma.sosEvent.create({
      data: {
        userId,
        latitude,
        longitude,
        message: message || null,
        status: "triggered",
      },
    });

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
    });

    return res.status(201).json({ sosEvent, contacts });
  } catch (error) {
    console.error("SOS trigger error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

export async function listSosHistory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const events = await prisma.sosEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ events });
  } catch (error) {
    console.error("SOS history error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}