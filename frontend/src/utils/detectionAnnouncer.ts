import type { DetectedObject } from "../hooks/useObjectDetection";
import type { AppLanguage } from "../context/LanguageContext";
import { buildDetectionAnnouncement } from "./objectTranslations";

const ANNOUNCE_COOLDOWN_MS = 4000;

export class DetectionAnnouncer {
  private lastAnnounced: Record<string, number> = {};

  getAnnouncementText(objects: DetectedObject[], language: AppLanguage = "en"): string | null {
    const now = Date.now();

    const newObjects = objects.filter((obj) => {
      const lastTime = this.lastAnnounced[obj.class];
      return !lastTime || now - lastTime > ANNOUNCE_COOLDOWN_MS;
    });

    if (newObjects.length === 0) return null;

    newObjects.forEach((obj) => {
      this.lastAnnounced[obj.class] = now;
    });

    const uniqueClasses = [...new Set(newObjects.map((o) => o.class))];

    return buildDetectionAnnouncement(uniqueClasses, language);
  }

  reset() {
    this.lastAnnounced = {};
  }
}