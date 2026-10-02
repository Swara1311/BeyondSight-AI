import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { summarizeText } from "../services/summarizationService";
import { verifyToken } from "../utils/jwt";

const summarizeSchema = z.object({
  text: z.string().min(1),
});

export async function summarize(req: Request, res: Response) {
  try {
    const parsed = summarizeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Text is required." });
    }

    const { text } = parsed.data;

    if (text.length < 200) {
      return res.status(400).json({
        error: "Text is too short to summarize. Try reading it directly instead.",
      });
    }

    const summary = await summarizeText(text);

    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (decoded) {
        await prisma.ocrHistory.create({
          data: {
            userId: decoded.userId,
            extractedText: text.slice(0, 5000),
            summary,
          },
        });
      }
    }

    return res.json({ summary });
  } catch (error) {
    console.error("Summarize error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
}