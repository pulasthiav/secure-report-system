import { v } from "convex/values";

export const evidenceMetadataValidator = v.object({
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  dateTime: v.optional(v.string()),
  software: v.optional(v.string()),
});
