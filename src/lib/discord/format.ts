import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { CHANNEL_TYPES } from "./types";

export function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`;
  return format(d, "d MMM HH:mm");
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
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
    default:
      return "Channel";
  }
}

export function isTextLike(type: number): boolean {
  return (
    type === CHANNEL_TYPES.GUILD_TEXT ||
    type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT ||
    type === CHANNEL_TYPES.GUILD_FORUM
  );
}

export function hexToInt(hex: string): number {
  const clean = hex.replace("#", "").trim();
  const n = Number.parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return Number.isFinite(n) ? n : 0xc9bfb0;
}

export function intToHex(n?: number): string {
  const v = (n ?? 0xc9bfb0) & 0xffffff;
  return `#${v.toString(16).padStart(6, "0")}`;
}

export async function fileToDataUri(file: File): Promise<string> {
  if (file.size > 2_000_000) throw new Error("Keep images under 2 MB.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
