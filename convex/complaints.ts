import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. අලුත් පැමිණිල්ලක් දාන්න
export const createComplaint = mutation({
  args: {
    case_key: v.string(),
    description: v.string(),
    evidence_path: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("complaints", {
      case_key: args.case_key,
      description: args.description,
      evidence_path: args.evidence_path,
      status: "Pending",
      metadata: args.metadata,
    });
  },
});

// 2. ෆොටෝ අප්ලෝඩ් කරන්න URL එකක් ගන්න
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// 3. Admin ට ඔක්කොම පැමිණිලි බලන්න
export const getAllComplaints = query({
  handler: async (ctx) => {
    return await ctx.db.query("complaints").order("desc").collect();
  },
});

// 4. Admin ට තත්ත්වය අප්ඩේට් කරන්න
export const updateComplaintStatus = mutation({
  args: {
    id: v.id("complaints"),
    status: v.string(),
    investigator_reply: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      investigator_reply: args.investigator_reply,
    });
  },
});

// 5. පැමිණිලිකරුට Status එක බලන්න
export const getComplaintByCaseKey = query({
  args: { case_key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complaints")
      .withIndex("by_case_key", (q) => q.eq("case_key", args.case_key))
      .first();
  },
});

// 6. පැමිණිලිකරුට ආපහු Reply කරන්න
export const updateReporterReply = mutation({
  args: {
    id: v.id("complaints"),
    reporter_reply: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      reporter_reply: args.reporter_reply,
    });
  },
});

// 7. ෆොටෝ එකේ URL එක ගන්න
export const getImageUrl = query({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});