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
  latitude: z.number(),
  longitude: z.number(),
});

export async function createSavedPlace(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in to save a place." });
    }

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Name, latitude, and longitude are required." });
    }

    const { name, latitude, longitude } = parsed.data;

    const place = await prisma.savedPlace.create({
      data: { userId, name, latitude, longitude },
    });

    return res.status(201).json({ place });
  } catch (error) {
    console.error("Create saved place error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

export async function listSavedPlaces(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const places = await prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ places });
  } catch (error) {
    console.error("List saved places error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

export async function deleteSavedPlace(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    const { id } = req.params;

    const place = await prisma.savedPlace.findUnique({ where: { id } });
    if (!place || place.userId !== userId) {
      return res.status(404).json({ error: "Saved place not found." });
    }

    await prisma.savedPlace.delete({ where: { id } });

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete saved place error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}