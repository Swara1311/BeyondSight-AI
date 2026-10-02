import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import ocrRoutes from "./routes/ocr.routes";
import navigationRoutes from "./routes/navigation.routes";
import savedPlacesRoutes from "./routes/savedPlaces.routes";
import emergencyContactsRoutes from "./routes/emergencyContacts.routes";
import sosRoutes from "./routes/sos.routes";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "BeyondSight AI backend is running" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/saved-places", savedPlacesRoutes);
app.use("/api/emergency-contacts", emergencyContactsRoutes);
app.use("/api/sos", sosRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});