import ProjectActivity from "../models/ProjectActivityModel.js";

export const logProjectActivity = async ({
  orderId,
  actorId,
  actorName,
  actorRole,
  action,
  details = "",
  meta = {},
}) => {
  if (!orderId || !actorId || !action) return null;
  return ProjectActivity.create({
    orderId,
    actorId,
    actorName: actorName || "User",
    actorRole: actorRole || "",
    action,
    details,
    meta,
  });
};

export const buildOrderAttachments = (order) => {
  const items = [];
  const push = (label, url, type = "file") => {
    if (url && String(url).trim() && !String(url).includes("pending")) {
      items.push({ label, url: String(url).trim(), type });
    }
  };
  push("Raw footage", order.rawFootageLink, "video");
  push("Voiceover", order.voiceoverLink, "audio");
  push("Script", order.scriptLink, "file");
  (order.musicLinks || []).forEach((link, i) => push(`Music ${i + 1}`, link, "audio"));
  (order.referenceLinks || []).forEach((link, i) => push(`Reference ${i + 1}`, link, "video"));
  return items;
};
