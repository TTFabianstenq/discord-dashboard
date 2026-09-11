import type { DiscordChannel } from "./types";
import { CHANNEL_TYPES } from "./types";

export function isTextLike(type: number): boolean {
  return (
    type === CHANNEL_TYPES.GUILD_TEXT ||
    type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT ||
    type === CHANNEL_TYPES.PUBLIC_THREAD ||
    type === CHANNEL_TYPES.PRIVATE_THREAD ||
    type === CHANNEL_TYPES.ANNOUNCEMENT_THREAD ||
    type === CHANNEL_TYPES.GUILD_FORUM ||
    type === CHANNEL_TYPES.GUILD_MEDIA
  );
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

export function hexToInt(hex: string): number {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return Number.isFinite(n) ? n : 0;
}

export async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/** Read file as base64 payload for Discord multipart upload (no data: prefix). */
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

export function channelSortKey(c: DiscordChannel): string {
  return `${c.position ?? 0}`.padStart(6, "0") + (c.name ?? "");
}
