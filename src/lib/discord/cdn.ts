import type { DiscordGuild, DiscordUser } from "./types";

export function userAvatarUrl(user: Pick<DiscordUser, "id" | "avatar">, size = 128): string | null {
  if (!user.avatar) return null;
  if (user.avatar.startsWith("data:") || user.avatar.startsWith("http")) return user.avatar;
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
}

export function guildIconUrl(guild: Pick<DiscordGuild, "id" | "icon">, size = 128): string | null {
  if (!guild.icon) return null;
  if (guild.icon.startsWith("data:") || guild.icon.startsWith("http")) return guild.icon;
  const ext = guild.icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=${size}`;
}

export function applicationIconUrl(id: string, icon: string | null, size = 128): string | null {
  if (!icon) return null;
  if (icon.startsWith("data:") || icon.startsWith("http")) return icon;
  const ext = icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/app-icons/${id}/${icon}.${ext}?size=${size}`;
}

export function initialsOf(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}
