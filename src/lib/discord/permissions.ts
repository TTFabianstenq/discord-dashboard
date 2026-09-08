export const PERMISSIONS: { key: string; bit: bigint; label: string; hint: string }[] = [
  { key: "view", bit: 1n << 10n, label: "View channels", hint: "See channels in the server" },
  { key: "send", bit: 1n << 11n, label: "Send messages", hint: "Post in text channels" },
  { key: "manageMessages", bit: 1n << 13n, label: "Manage messages", hint: "Delete and pin others' messages" },
  { key: "embed", bit: 1n << 14n, label: "Embed links", hint: "Send rich embeds" },
  { key: "attach", bit: 1n << 15n, label: "Attach files", hint: "Upload files and images" },
  { key: "history", bit: 1n << 16n, label: "Read history", hint: "Read past messages" },
  { key: "manageChannels", bit: 1n << 4n, label: "Manage channels", hint: "Create, edit, and delete channels" },
  { key: "manageRoles", bit: 1n << 28n, label: "Manage roles", hint: "Create and edit roles below the bot" },
  { key: "manageNick", bit: 1n << 27n, label: "Manage nicknames", hint: "Change other members' nicknames" },
  { key: "kick", bit: 1n << 1n, label: "Kick members", hint: "Remove members from the server" },
  { key: "ban", bit: 1n << 2n, label: "Ban members", hint: "Permanently ban members" },
  { key: "moderate", bit: 1n << 40n, label: "Moderate members", hint: "Timeout members" },
  { key: "manageWebhooks", bit: 1n << 29n, label: "Manage webhooks", hint: "Create and edit webhooks" },
  { key: "manageGuild", bit: 1n << 5n, label: "Manage server", hint: "Edit server name and settings" },
  { key: "connect", bit: 1n << 20n, label: "Connect", hint: "Join voice channels" },
  { key: "speak", bit: 1n << 21n, label: "Speak", hint: "Talk in voice channels" },
  { key: "admin", bit: 8n, label: "Administrator", hint: "Every permission, including destructive ones" },
];

export const PERM = {
  CREATE_INSTANT_INVITE: 1n << 0n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 8n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  ADD_REACTIONS: 1n << 6n,
  VIEW_AUDIT_LOG: 1n << 7n,
  PRIORITY_SPEAKER: 1n << 8n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  SEND_TTS_MESSAGES: 1n << 12n,
  MANAGE_MESSAGES: 1n << 13n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  MUTE_MEMBERS: 1n << 22n,
  DEAFEN_MEMBERS: 1n << 23n,
  MOVE_MEMBERS: 1n << 24n,
  USE_VAD: 1n << 25n,
  CHANGE_NICKNAME: 1n << 26n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MANAGE_EMOJIS_AND_STICKERS: 1n << 30n,
  USE_APPLICATION_COMMANDS: 1n << 31n,
  REQUEST_TO_SPEAK: 1n << 32n,
  MANAGE_EVENTS: 1n << 33n,
  MANAGE_THREADS: 1n << 34n,
  CREATE_PUBLIC_THREADS: 1n << 35n,
  CREATE_PRIVATE_THREADS: 1n << 36n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
  USE_EMBEDDED_ACTIVITIES: 1n << 39n,
  MODERATE_MEMBERS: 1n << 40n,
} as const;

export function bitsToPermissions(bits: bigint): string[] {
  return PERMISSIONS.filter((p) => (bits & p.bit) === p.bit).map((p) => p.key);
}

export function permissionsToBits(keys: string[]): bigint {
  return PERMISSIONS.reduce((acc, p) => (keys.includes(p.key) ? acc | p.bit : acc), 0n);
}

export function inviteUrl(clientId: string, bits: bigint): string {
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: bits.toString(),
    scope: "bot applications.commands",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function parsePermissionString(raw?: string | null): bigint {
  if (!raw) return 0n;
  try {
    return BigInt(raw);
  } catch {
    return 0n;
  }
}

export function hasPerm(raw: string | undefined | null, bit: bigint): boolean {
  const n = parsePermissionString(raw);
  if ((n & PERM.ADMINISTRATOR) === PERM.ADMINISTRATOR) return true;
  return (n & bit) === bit;
}

/** Guild-level permission check from the bot's permissions string on the guild object. */
export function botCan(guildPermissions: string | undefined | null, bit: bigint): boolean {
  return hasPerm(guildPermissions, bit);
}

export function canManageRoles(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.MANAGE_ROLES);
}

export function canKick(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.KICK_MEMBERS);
}

export function canBan(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.BAN_MEMBERS);
}

export function canModerate(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.MODERATE_MEMBERS);
}

export function canManageChannels(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.MANAGE_CHANNELS);
}

export function canManageMessages(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.MANAGE_MESSAGES);
}

export function canManageWebhooks(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.MANAGE_WEBHOOKS);
}

export function canManageGuild(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.MANAGE_GUILD);
}

export function canSendMessages(guildPermissions?: string | null): boolean {
  return botCan(guildPermissions, PERM.SEND_MESSAGES);
}
