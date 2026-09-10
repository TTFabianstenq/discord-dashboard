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
  communication_disabled_until?: string | null;
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
  footer?: { text: string; icon_url?: string };
  author?: { name: string; url?: string; icon_url?: string };
  fields?: DiscordEmbedField[];
  thumbnail?: { url: string };
  image?: { url: string };
};

export type DiscordAttachment = {
  id: string;
  filename: string;
  url: string;
  proxy_url?: string;
  size?: number;
  content_type?: string | null;
  width?: number | null;
  height?: number | null;
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
  attachments?: DiscordAttachment[];
  pinned: boolean;
  type: number;
  webhook_id?: string;
};

export type DiscordWebhook = {
  id: string;
  type: number;
  guild_id?: string;
  channel_id: string;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id?: string | null;
  url?: string;
};

export type DiscordApplicationCommandOption = {
  type: number;
  name: string;
  description: string;
  required?: boolean;
  choices?: { name: string; value: string | number }[];
  options?: DiscordApplicationCommandOption[];
};

export type DiscordApplicationCommand = {
  id: string;
  application_id: string;
  guild_id?: string;
  name: string;
  description: string;
  type: number;
  options?: DiscordApplicationCommandOption[];
  default_member_permissions?: string | null;
  dm_permission?: boolean;
  nsfw?: boolean;
};

export type DiscordPresenceUpdate = {
  status: "online" | "idle" | "dnd" | "invisible";
  activities?: {
    name: string;
    type: number;
    url?: string;
    state?: string;
  }[];
};

export type DiscordBan = {
  reason: string | null;
  user: DiscordUser;
};

export type DiscordInvite = {
  code: string;
  channel?: { id: string; name?: string };
  max_age?: number;
  max_uses?: number;
  temporary?: boolean;
  url?: string;
  approximate_member_count?: number;
};

export type DiscordAuditLogEntry = {
  id: string;
  action_type: number;
  user_id?: string | null;
  target_id?: string | null;
  reason?: string | null;
  created_at?: string;
};

export type DiscordEmoji = {
  id: string;
  name: string;
  roles?: string[];
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
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

export const COMMAND_TYPES = {
  CHAT_INPUT: 1,
  USER: 2,
  MESSAGE: 3,
} as const;

export const ACTIVITY_TYPES = {
  PLAYING: 0,
  STREAMING: 1,
  LISTENING: 2,
  WATCHING: 3,
  CUSTOM: 4,
  COMPETING: 5,
} as const;

export type GuildTab =
  | "chat"
  | "channels"
  | "roles"
  | "members"
  | "bans"
  | "invites"
  | "audit"
  | "webhooks"
  | "commands"
  | "emojis"
  | "server";

export type AppView =
  | { t: "overview" }
  | { t: "bot" }
  | { t: "guild"; id: string; tab: GuildTab; channelId?: string };
