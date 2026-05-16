import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  complaints: defineTable({
    case_key: v.string(),
    description: v.string(),
    evidence_path: v.optional(v.string()), // Image Storage ID එක
    status: v.optional(v.string()), // Pending, Investigating, Resolved
    investigator_reply: v.optional(v.string()),
    reporter_reply: v.optional(v.string()),
    metadata: v.optional(v.string()),
  }).index("by_case_key", ["case_key"]),
});