import { Request, Response } from "express";
import { z } from "zod";
import { geocodePlace, getRoute } from "../services/navigationService";

const navigateSchema = z.object({
  destination: z.string().min(1),
  currentLatitude: z.number(),
  currentLongitude: z.number(),
});

const navigateCoordsSchema = z.object({
  startLat: z.number(),
  startLon: z.number(),
  endLat: z.number(),
  endLon: z.number(),
});

export async function navigate(req: Request, res: Response) {
  try {
    const parsed = navigateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Destination and current location are required." });
    }

    const { destination, currentLatitude, currentLongitude } = parsed.data;

    const destinationCoords = await geocodePlace(destination, currentLatitude, currentLongitude);

    const route = await getRoute(
      { latitude: currentLatitude, longitude: currentLongitude },
      destinationCoords
    );

    return res.json({
      destination,
      destinationCoords,
      route,
    });
  } catch (error) {
    console.error("Navigate error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
}

export async function navigateByCoords(req: Request, res: Response) {
  try {
    const parsed = navigateCoordsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Start and end coordinates are required." });
    }

    const { startLat, startLon, endLat, endLon } = parsed.data;

    const route = await getRoute(
      { latitude: startLat, longitude: startLon },
      { latitude: endLat, longitude: endLon }
    );

    return res.json({ route });
  } catch (error) {
    console.error("Navigate by coords error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
}