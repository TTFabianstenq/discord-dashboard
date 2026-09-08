export type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  bot?: boolean;
  banner?: string | null;
  flags?: number;
  public_flags?: number;
};

export type DiscordApplication = {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  bot_public?: boolean;
  bot_require_code_grant?: boolean;
  approximate_guild_count?: number;
  tags?: string[];
};

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: string;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  description?: string | null;
  banner?: string | null;
};

export type DiscordChannel = {
  id: string;
  type: number;
  guild_id?: string;
  name?: string;
  topic?: string | null;
  nsfw?: boolean;
  position?: number;
  parent_id?: string | null;
  rate_limit_per_user?: number;
  bitrate?: number;
  user_limit?: number;
};

export type DiscordRole = {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  hoist: boolean;
};

export type DiscordMember = {
  user?: DiscordUser;
  nick: string | null;
  avatar?: string | null;
  roles: string[];
  joined_at: string;
};

export type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type DiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string };
  author?: { name: string };
  fields?: DiscordEmbedField[];
};

export type DiscordMessage = {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  embeds: DiscordEmbed[];
  pinned: boolean;
  type: number;
  webhook_id?: string;
};

export const CHANNEL_TYPES = {
  GUILD_TEXT: 0,
  DM: 1,
  GUILD_VOICE: 2,
  GROUP_DM: 3,
  GUILD_CATEGORY: 4,
  GUILD_ANNOUNCEMENT: 5,
  GUILD_STAGE_VOICE: 13,
  GUILD_FORUM: 15,
  GUILD_MEDIA: 16,
} as const;

export type GuildTab = "chat" | "channels" | "members" | "server";

export type AppView =
  | { t: "overview" }
  | { t: "bot" }
  | { t: "guild"; id: string; tab: GuildTab; channelId?: string };
