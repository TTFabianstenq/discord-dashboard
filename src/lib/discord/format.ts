import { formatDistanceToNow } from "date-fns";
import { CHANNEL_TYPES } from "./types";

export function isTextLike(type: number): boolean {
  return (
    type === CHANNEL_TYPES.GUILD_TEXT ||
    type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT ||
    type === CHANNEL_TYPES.GUILD_FORUM ||
    type === CHANNEL_TYPES.GUILD_MEDIA ||
    type === 10 || // announcement thread
    type === 11 || // public thread
    type === 12 // private thread
  );
}

export function channelKindLabel(type: number): string {
  switch (type) {
    case CHANNEL_TYPES.GUILD_TEXT:
      return "Text";
    case CHANNEL_TYPES.GUILD_VOICE:
      return "Voice";
    case CHANNEL_TYPES.GUILD_CATEGORY:
      return "Category";
    case CHANNEL_TYPES.GUILD_ANNOUNCEMENT:
      return "Announcement";
    case CHANNEL_TYPES.GUILD_STAGE_VOICE:
      return "Stage";
    case CHANNEL_TYPES.GUILD_FORUM:
      return "Forum";
    case CHANNEL_TYPES.GUILD_MEDIA:
      return "Media";
    default:
      return "Channel";
  }
}

export function formatStamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function hexToInt(hex: string): number {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return Number.isFinite(n) ? n : 0;
}

export function intToHex(n: number): string {
  const v = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return `#${v.toString(16).padStart(6, "0")}`;
}

export async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/** Read file as base64 for Discord multipart upload (no data: prefix). Max 8MB. */
export async function fileToUpload(file: File): Promise<{
  filename: string;
  contentType: string;
  dataBase64: string;
}> {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8MB");
  }
  const dataUri = await fileToDataUri(file);
  const comma = dataUri.indexOf(",");
  const dataBase64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
  return {
    filename: file.name || "upload.png",
    contentType: file.type || "application/octet-stream",
    dataBase64,
  };
}
