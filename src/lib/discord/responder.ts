/**
 * BotDeck auto-responder.
 *
 * Registering a slash command only tells Discord the command exists — something
 * still has to answer it within 3 seconds or Discord shows "The application did
 * not respond". While BotDeck is open it holds the bot's gateway session, so it
 * receives INTERACTION_CREATE and can answer commands that have a reply set up
 * here. Commands without a BotDeck reply are left alone so your own bot code can
 * answer them.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { discordRequest } from "./api";
import type { DiscordApplicationCommand, DiscordApplicationCommandOption, DiscordGuild } from "./types";

export type ReplyAction =
  | "text"
  | "ping"
  | "help"
  | "serverinfo"
  | "userinfo"
  | "avatar"
  | "roll"
  | "coinflip"
  | "8ball"
  | "say";

export type CommandReply = {
  enabled: boolean;
  action: ReplyAction;
  /** Message text for "text" (supports {variables}); optional intro for built-ins. */
  content: string;
  /** Send the text inside an embed instead of a plain message. */
  embed: boolean;
  embedTitle: string;
  /** #rrggbb */
  color: string;
  /** Only the person who ran the command can see the reply. */
  ephemeral: boolean;
};

export const ACTION_INFO: Record<ReplyAction, { label: string; hint: string }> = {
  text: { label: "Custom message", hint: "Replies with your text. Variables like {user} and {server} are filled in." },
  ping: { label: "Ping", hint: "Replies with Pong and how long Discord took to deliver the command." },
  help: { label: "Help", hint: "Lists every slash command the bot has in this server." },
  serverinfo: { label: "Server info", hint: "Embed with the server name, members, creation date and ID." },
  userinfo: { label: "User info", hint: "Embed about the user picked in a `user` option (or whoever ran it)." },
  avatar: { label: "Avatar", hint: "Shows the avatar of the user in a `user` option (or whoever ran it)." },
  roll: { label: "Dice roll", hint: "Rolls a die. Uses an integer option named `sides` if present (default 6)." },
  coinflip: { label: "Coin flip", hint: "Heads or tails." },
  "8ball": { label: "Magic 8-ball", hint: "Answers the `question` option with a random 8-ball reply." },
  say: { label: "Say (echo)", hint: "Repeats the `text` option as the bot. Mentions are never pinged." },
};

export const DEFAULT_REPLY: CommandReply = {
  enabled: true,
  action: "text",
  content: "Hey {user}! 👋",
  embed: false,
  embedTitle: "",
  color: "#c9bfb0",
  ephemeral: false,
};

export const TEMPLATE_VARIABLES: { token: string; meaning: string }[] = [
  { token: "{user}", meaning: "Mention of whoever ran the command" },
  { token: "{user.name}", meaning: "Their display name" },
  { token: "{user.id}", meaning: "Their user ID" },
  { token: "{server}", meaning: "Server name" },
  { token: "{members}", meaning: "Approx. member count" },
  { token: "{channel}", meaning: "Channel mention" },
  { token: "{option.NAME}", meaning: "Value of an option, e.g. {option.reason}" },
  { token: "{time}", meaning: "Current time (shown in each viewer's timezone)" },
];

// ---------------------------------------------------------------------------
// Presets — one click creates the command on Discord *and* wires its reply.
// ---------------------------------------------------------------------------

export type CommandPreset = {
  id: string;
  emoji: string;
  command: {
    name: string;
    description: string;
    type: number;
    options?: DiscordApplicationCommandOption[];
    default_member_permissions?: string | null;
  };
  reply: CommandReply;
};

const OPT = { STRING: 3, INTEGER: 4, USER: 6 } as const;

function preset(
  id: string,
  emoji: string,
  command: CommandPreset["command"],
  reply: Partial<CommandReply>,
): CommandPreset {
  return { id, emoji, command, reply: { ...DEFAULT_REPLY, content: "", ...reply } };
}

export const COMMAND_PRESETS: CommandPreset[] = [
  preset("ping", "🏓", { name: "ping", description: "Check that the bot is alive", type: 1 }, { action: "ping" }),
  preset("help", "📖", { name: "help", description: "List the bot's commands", type: 1 }, { action: "help", ephemeral: true }),
  preset("serverinfo", "🏠", { name: "serverinfo", description: "Show info about this server", type: 1 }, { action: "serverinfo" }),
  preset(
    "userinfo",
    "🪪",
    {
      name: "userinfo",
      description: "Show info about a user",
      type: 1,
      options: [{ type: OPT.USER, name: "user", description: "Who to look up (defaults to you)", required: false }],
    },
    { action: "userinfo" },
  ),
  preset(
    "avatar",
    "🖼️",
    {
      name: "avatar",
      description: "Show someone's avatar",
      type: 1,
      options: [{ type: OPT.USER, name: "user", description: "Whose avatar (defaults to you)", required: false }],
    },
    { action: "avatar" },
  ),
  preset(
    "roll",
    "🎲",
    {
      name: "roll",
      description: "Roll a die",
      type: 1,
      options: [{ type: OPT.INTEGER, name: "sides", description: "Number of sides (default 6)", required: false }],
    },
    { action: "roll" },
  ),
  preset("coinflip", "🪙", { name: "coinflip", description: "Flip a coin", type: 1 }, { action: "coinflip" }),
  preset(
    "8ball",
    "🎱",
    {
      name: "8ball",
      description: "Ask the magic 8-ball a question",
      type: 1,
      options: [{ type: OPT.STRING, name: "question", description: "Your yes/no question", required: true }],
    },
    { action: "8ball" },
  ),
  preset(
    "say",
    "📣",
    {
      name: "say",
      description: "Make the bot say something",
      type: 1,
      options: [{ type: OPT.STRING, name: "text", description: "What to say", required: true }],
      default_member_permissions: "8192",
    },
    { action: "say" },
  ),
  preset(
    "rules",
    "📜",
    { name: "rules", description: "Show the server rules", type: 1 },
    {
      action: "text",
      embed: true,
      embedTitle: "📜 {server} rules",
      content: "1. Be respectful.\n2. No spam or self-promo.\n3. Keep it in the right channel.\n4. Follow Discord's ToS.",
    },
  ),
  preset("user-info-menu", "👤", { name: "User Info", description: "", type: 2 }, { action: "userinfo", ephemeral: true }),
];

// ---------------------------------------------------------------------------
// Persisted reply config + in-memory activity log
// ---------------------------------------------------------------------------

export type ResponderLogEntry = {
  id: string;
  at: number;
  command: string;
  user: string;
  guildName: string | null;
  ok: boolean;
  detail: string;
};

type ResponderState = {
  /** appId -> command name -> reply */
  replies: Record<string, Record<string, CommandReply>>;
  log: ResponderLogEntry[];
  setReply: (appId: string, commandName: string, reply: CommandReply | null) => void;
  renameReply: (appId: string, from: string, to: string) => void;
  pushLog: (entry: ResponderLogEntry) => void;
  clearLog: () => void;
};

export const useResponder = create<ResponderState>()(
  persist(
    (set) => ({
      replies: {},
      log: [],
      setReply: (appId, commandName, reply) =>
        set((s) => {
          const forApp = { ...(s.replies[appId] ?? {}) };
          if (reply) forApp[commandName] = reply;
          else delete forApp[commandName];
          return { replies: { ...s.replies, [appId]: forApp } };
        }),
      renameReply: (appId, from, to) =>
        set((s) => {
          const forApp = { ...(s.replies[appId] ?? {}) };
          if (!forApp[from] || from === to) return s;
          forApp[to] = forApp[from];
          delete forApp[from];
          return { replies: { ...s.replies, [appId]: forApp } };
        }),
      pushLog: (entry) => set((s) => ({ log: [entry, ...s.log].slice(0, 40) })),
      clearLog: () => set({ log: [] }),
    }),
    {
      name: "botdeck.replies",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ replies: s.replies }),
    },
  ),
);

export function getReply(appId: string | undefined, name: string): CommandReply | undefined {
  if (!appId) return undefined;
  return useResponder.getState().replies[appId]?.[name];
}

// ---------------------------------------------------------------------------
// Interaction handling
// ---------------------------------------------------------------------------

type IUser = { id: string; username: string; global_name?: string | null; avatar: string | null; bot?: boolean };
type IMember = { nick?: string | null; joined_at?: string; roles?: string[]; user?: IUser };
type IOption = { name: string; type: number; value?: string | number | boolean; options?: IOption[] };

type Interaction = {
  id: string;
  application_id: string;
  type: number;
  token: string;
  guild_id?: string;
  channel_id?: string;
  member?: IMember;
  user?: IUser;
  data?: {
    id: string;
    name: string;
    type: number;
    options?: IOption[];
    target_id?: string;
    resolved?: {
      users?: Record<string, IUser>;
      members?: Record<string, IMember>;
      messages?: Record<string, { content?: string; author?: IUser }>;
    };
  };
};

export type ResponderContext = {
  token: string;
  appId: string | undefined;
  guilds: DiscordGuild[];
  commands: { global: DiscordApplicationCommand[]; guild: Record<string, DiscordApplicationCommand[]> };
};

const DISCORD_EPOCH = 1420070400000;

export function snowflakeTime(id: string): number {
  try {
    return Number(BigInt(id) >> BigInt(22)) + DISCORD_EPOCH;
  } catch {
    return Date.now();
  }
}

function avatarOf(user: IUser, size = 512): string {
  if (user.avatar) {
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
  }
  let idx = 0;
  try {
    idx = Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));
  } catch {
    idx = 0;
  }
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

function hexToInt(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  return Number.isFinite(n) ? n : 0xc9bfb0;
}

function flattenOptions(options: IOption[] | undefined, out: Record<string, IOption> = {}): Record<string, IOption> {
  for (const o of options ?? []) {
    if (o.options?.length) flattenOptions(o.options, out);
    else out[o.name] = o;
  }
  return out;
}

const EIGHT_BALL = [
  "It is certain.",
  "Without a doubt.",
  "Yes — definitely.",
  "You may rely on it.",
  "Most likely.",
  "Outlook good.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
];

type Built = { content?: string; embeds?: Record<string, unknown>[] };

/** Exposed so the editor can render a live preview with sample data. */
export function buildReply(
  reply: CommandReply,
  i: Interaction,
  ctx: Pick<ResponderContext, "guilds" | "commands">,
): Built {
  const invoker: IUser = i.member?.user ?? i.user ?? { id: "0", username: "someone", avatar: null };
  const invokerName = i.member?.nick || invoker.global_name || invoker.username;
  const guild = i.guild_id ? ctx.guilds.find((g) => g.id === i.guild_id) : undefined;
  const opts = flattenOptions(i.data?.options);
  const resolvedUsers = i.data?.resolved?.users ?? {};
  const resolvedMembers = i.data?.resolved?.members ?? {};
  const color = hexToInt(reply.color);

  const fill = (text: string) =>
    text
      .replace(/\{user\}/g, `<@${invoker.id}>`)
      .replace(/\{user\.name\}/g, invokerName)
      .replace(/\{user\.id\}/g, invoker.id)
      .replace(/\{server\}/g, guild?.name ?? "this server")
      .replace(/\{server\.id\}/g, i.guild_id ?? "")
      .replace(/\{members\}/g, guild?.approximate_member_count != null ? String(guild.approximate_member_count) : "?")
      .replace(/\{channel\}/g, i.channel_id ? `<#${i.channel_id}>` : "")
      .replace(/\{time\}/g, `<t:${Math.floor(Date.now() / 1000)}:f>`)
      .replace(/\{option\.([\w-]+)\}/g, (_, name: string) => {
        const o = opts[name];
        if (!o || o.value === undefined) return "";
        if (o.type === 6) return `<@${o.value}>`;
        if (o.type === 7) return `<#${o.value}>`;
        if (o.type === 8) return `<@&${o.value}>`;
        return String(o.value);
      });

  // Pick the "target" user for userinfo / avatar.
  const targetId =
    (i.data?.type === 2 ? i.data.target_id : undefined) ??
    (Object.values(opts).find((o) => o.type === 6)?.value as string | undefined);
  const target: IUser = (targetId && resolvedUsers[targetId]) || invoker;
  const targetMember: IMember | undefined = targetId ? resolvedMembers[targetId] : i.member;

  const intro = reply.content.trim() ? fill(reply.content) : undefined;

  switch (reply.action) {
    case "text": {
      const body = fill(reply.content || " ");
      if (reply.embed) {
        return {
          embeds: [{ title: reply.embedTitle ? fill(reply.embedTitle).slice(0, 256) : undefined, description: body.slice(0, 4096), color }],
        };
      }
      return { content: body.slice(0, 2000) };
    }
    case "ping": {
      const ms = Math.max(0, Date.now() - snowflakeTime(i.id));
      return { content: `${intro ? intro + "\n" : ""}🏓 **Pong!** Command reached the bot in \`${ms}ms\`.` };
    }
    case "coinflip":
      return { content: `${intro ? intro + "\n" : ""}🪙 **${Math.random() < 0.5 ? "Heads" : "Tails"}!**` };
    case "roll": {
      const raw = Number(opts.sides?.value ?? 6);
      const sides = Number.isFinite(raw) ? Math.min(1000, Math.max(2, Math.floor(raw))) : 6;
      const n = 1 + Math.floor(Math.random() * sides);
      return { content: `${intro ? intro + "\n" : ""}🎲 You rolled **${n}** (d${sides})` };
    }
    case "8ball": {
      const q = String(opts.question?.value ?? "").slice(0, 200);
      const a = EIGHT_BALL[Math.floor(Math.random() * EIGHT_BALL.length)];
      return {
        embeds: [
          {
            color,
            title: "🎱 Magic 8-ball",
            description: `${q ? `> ${q}\n\n` : ""}**${a}**`,
          },
        ],
      };
    }
    case "say": {
      const text = String(opts.text?.value ?? Object.values(opts).find((o) => o.type === 3)?.value ?? "").slice(0, 2000);
      return { content: text || "(nothing to say)" };
    }
    case "avatar":
      return {
        embeds: [
          {
            color,
            title: `${target.global_name || target.username}'s avatar`,
            image: { url: avatarOf(target, 1024) },
            url: avatarOf(target, 4096),
          },
        ],
      };
    case "userinfo": {
      const created = Math.floor(snowflakeTime(target.id) / 1000);
      const fields: Record<string, unknown>[] = [
        { name: "Username", value: `@${target.username}`, inline: true },
        { name: "ID", value: `\`${target.id}\``, inline: true },
        { name: "Account created", value: `<t:${created}:D> (<t:${created}:R>)`, inline: false },
      ];
      if (targetMember?.joined_at) {
        const joined = Math.floor(new Date(targetMember.joined_at).getTime() / 1000);
        fields.push({ name: "Joined server", value: `<t:${joined}:D> (<t:${joined}:R>)`, inline: false });
      }
      if (targetMember?.roles?.length) {
        fields.push({
          name: `Roles (${targetMember.roles.length})`,
          value: targetMember.roles.slice(0, 15).map((r) => `<@&${r}>`).join(" "),
          inline: false,
        });
      }
      return {
        content: intro,
        embeds: [
          {
            color,
            author: { name: target.global_name || target.username, icon_url: avatarOf(target, 64) },
            thumbnail: { url: avatarOf(target, 256) },
            fields,
            footer: target.bot ? { text: "🤖 Bot account" } : undefined,
          },
        ],
      };
    }
    case "serverinfo": {
      if (!guild) return { content: "This command only works inside a server." };
      const created = Math.floor(snowflakeTime(guild.id) / 1000);
      return {
        content: intro,
        embeds: [
          {
            color,
            title: guild.name,
            description: guild.description || undefined,
            thumbnail: guild.icon
              ? { url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256` }
              : undefined,
            fields: [
              { name: "Members", value: String(guild.approximate_member_count ?? "?"), inline: true },
              { name: "Online", value: String(guild.approximate_presence_count ?? "?"), inline: true },
              { name: "Created", value: `<t:${created}:D>`, inline: true },
              { name: "Server ID", value: `\`${guild.id}\``, inline: false },
            ],
          },
        ],
      };
    }
    case "help": {
      const list = [...(i.guild_id ? ctx.commands.guild[i.guild_id] ?? [] : []), ...ctx.commands.global]
        .filter((c) => c.type === 1)
        .sort((a, b) => a.name.localeCompare(b.name));
      const lines = list.length
        ? list.map((c) => `\`/${c.name}\` — ${c.description || "No description"}`).join("\n")
        : "No slash commands loaded yet.";
      return {
        embeds: [
          {
            color,
            title: "📖 Commands",
            description: `${intro ? intro + "\n\n" : ""}${lines}`.slice(0, 4096),
          },
        ],
      };
    }
  }
}

/** Sample interaction used for editor previews. */
export function sampleInteraction(guildId: string | undefined, commandName: string, botLike?: IUser): Interaction {
  const user: IUser = botLike ?? { id: "80351110224678912", username: "you", global_name: "You", avatar: null };
  return {
    id: String((BigInt(Date.now() - 120 - DISCORD_EPOCH) << BigInt(22))),
    application_id: "0",
    type: 2,
    token: "preview",
    guild_id: guildId,
    channel_id: "0",
    member: { user, joined_at: new Date(Date.now() - 86400000 * 200).toISOString(), roles: [] },
    data: {
      id: "0",
      name: commandName,
      type: 1,
      options: [
        { name: "question", type: 3, value: "Will this work?" },
        { name: "text", type: 3, value: "Hello from BotDeck!" },
      ],
    },
  };
}

const handled = new Set<string>();

export async function handleInteraction(raw: unknown, ctx: ResponderContext): Promise<void> {
  const i = raw as Interaction;
  if (!i || typeof i !== "object" || i.type !== 2 || !i.data?.name) return; // slash + context menu commands only
  if (ctx.appId && i.application_id !== ctx.appId) return;
  if (handled.has(i.id)) return;

  const reply = getReply(i.application_id, i.data.name);
  if (!reply || !reply.enabled) return; // leave it for the bot's own code
  handled.add(i.id);
  if (handled.size > 500) handled.clear();

  const invoker = i.member?.user ?? i.user;
  const guildName = i.guild_id ? ctx.guilds.find((g) => g.id === i.guild_id)?.name ?? null : null;
  const label = i.data.type === 1 ? `/${i.data.name}` : i.data.name;

  try {
    const built = buildReply(reply, i, ctx);
    const data: Record<string, unknown> = {
      ...built,
      // Only the person who ran the command can be pinged; text from options never pings anyone.
      allowed_mentions: { parse: [], users: reply.action === "say" || !invoker ? [] : [invoker.id] },
    };
    if (reply.ephemeral) data.flags = 64;
    await discordRequest({
      data: {
        token: ctx.token,
        method: "POST",
        path: `/interactions/${i.id}/${i.token}/callback`,
        body: { type: 4, data },
      },
    });
    useResponder.getState().pushLog({
      id: i.id,
      at: Date.now(),
      command: label,
      user: invoker ? invoker.global_name || invoker.username : "unknown",
      guildName,
      ok: true,
      detail: `Answered in ${Math.max(0, Date.now() - snowflakeTime(i.id))}ms`,
    });
  } catch (err) {
    useResponder.getState().pushLog({
      id: i.id,
      at: Date.now(),
      command: label,
      user: invoker ? invoker.global_name || invoker.username : "unknown",
      guildName,
      ok: false,
      detail: err instanceof Error ? err.message : "Reply failed",
    });
  }
}
