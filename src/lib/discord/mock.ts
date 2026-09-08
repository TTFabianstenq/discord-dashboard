import type {
  DiscordApplication,
  DiscordChannel,
  DiscordGuild,
  DiscordMember,
  DiscordMessage,
  DiscordRole,
  DiscordUser,
} from "./types";

const BOT_ID = "128490120938475521";

export const demoBot: DiscordUser = {
  id: BOT_ID,
  username: "Relay",
  discriminator: "0",
  global_name: "Relay",
  avatar: null,
  bot: true,
};

export const demoApplication: DiscordApplication = {
  id: BOT_ID,
  name: "Relay",
  icon: null,
  description: "A calm console for operating Discord bots — messages, channels, and server tools in one place.",
  bot_public: true,
  approximate_guild_count: 3,
  tags: ["moderation", "utility"],
};

function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function user(id: string, username: string, bot = false): DiscordUser {
  return { id, username, discriminator: "0", global_name: username, avatar: null, bot };
}

const U = {
  mara: user("301", "mara"),
  jules: user("302", "jules"),
  kenji: user("303", "kenji"),
  ada: user("304", "ada"),
  rio: user("305", "rio"),
  nova: user("306", "nova"),
  theo: user("307", "theo"),
  iris: user("308", "iris"),
};

const NW = "210000000000000001";
const HP = "210000000000000002";
const SR = "210000000000000003";

export const demoGuilds: DiscordGuild[] = [
  {
    id: NW,
    name: "Northwind Labs",
    icon: null,
    owner: false,
    permissions: "8",
    approximate_member_count: 1284,
    approximate_presence_count: 186,
    description: "A working studio for product, design, and infra.",
  },
  {
    id: HP,
    name: "Hollow Park",
    icon: null,
    owner: false,
    permissions: String(1n << 4n | 1n << 10n | 1n << 11n | 1n << 13n | 1n << 14n | 1n << 16n),
    approximate_member_count: 412,
    approximate_presence_count: 67,
    description: "Evening raids, voice nights, and quiet off-topic.",
  },
  {
    id: SR,
    name: "Signal Room",
    icon: null,
    owner: true,
    permissions: "8",
    approximate_member_count: 38,
    approximate_presence_count: 9,
    description: "Private ops channel for the bot itself.",
  },
];

export const demoRoles: Record<string, DiscordRole[]> = {
  [NW]: [
    { id: NW, name: "@everyone", color: 0, position: 0, permissions: "0", managed: false, mentionable: false, hoist: false },
    { id: "r-core", name: "Core", color: 0xb7a58d, position: 5, permissions: "8", managed: false, mentionable: true, hoist: true },
    { id: "r-eng", name: "Engineering", color: 0x7d8b99, position: 4, permissions: "0", managed: false, mentionable: true, hoist: true },
    { id: "r-bot", name: "Bots", color: 0x6f8f72, position: 3, permissions: "0", managed: true, mentionable: false, hoist: true },
  ],
  [HP]: [
    { id: HP, name: "@everyone", color: 0, position: 0, permissions: "0", managed: false, mentionable: false, hoist: false },
    { id: "r-raid", name: "Raid lead", color: 0xc45c4a, position: 3, permissions: "0", managed: false, mentionable: true, hoist: true },
    { id: "r-member", name: "Member", color: 0x8a8c91, position: 1, permissions: "0", managed: false, mentionable: false, hoist: false },
  ],
  [SR]: [
    { id: SR, name: "@everyone", color: 0, position: 0, permissions: "0", managed: false, mentionable: false, hoist: false },
    { id: "r-ops", name: "Ops", color: 0xc9bfb0, position: 2, permissions: "8", managed: false, mentionable: true, hoist: true },
  ],
};

export const demoMembers: Record<string, DiscordMember[]> = {
  [NW]: [
    { user: demoBot, nick: null, roles: ["r-bot"], joined_at: ago(60 * 24 * 40) },
    { user: U.mara, nick: null, roles: ["r-core"], joined_at: ago(60 * 24 * 200) },
    { user: U.jules, nick: "jules.design", roles: ["r-core"], joined_at: ago(60 * 24 * 180) },
    { user: U.kenji, nick: null, roles: ["r-eng"], joined_at: ago(60 * 24 * 90) },
    { user: U.ada, nick: null, roles: ["r-eng"], joined_at: ago(60 * 24 * 70) },
    { user: U.rio, nick: null, roles: [], joined_at: ago(60 * 24 * 12) },
  ],
  [HP]: [
    { user: demoBot, nick: "park-bot", roles: [], joined_at: ago(60 * 24 * 20) },
    { user: U.nova, nick: null, roles: ["r-raid"], joined_at: ago(60 * 24 * 110) },
    { user: U.theo, nick: "Theo", roles: ["r-member"], joined_at: ago(60 * 24 * 40) },
    { user: U.iris, nick: null, roles: ["r-member"], joined_at: ago(60 * 24 * 9) },
  ],
  [SR]: [
    { user: demoBot, nick: null, roles: ["r-ops"], joined_at: ago(60 * 24 * 4) },
    { user: U.mara, nick: null, roles: ["r-ops"], joined_at: ago(60 * 24 * 4) },
  ],
};

function ch(
  id: string,
  guild_id: string,
  name: string,
  type: number,
  extra: Partial<DiscordChannel> = {},
): DiscordChannel {
  return { id, guild_id, name, type, position: 0, nsfw: false, ...extra };
}

export const demoChannels: Record<string, DiscordChannel[]> = {
  [NW]: [
    ch("c-nw-info", NW, "Information", 4, { position: 0 }),
    ch("c-nw-welcome", NW, "welcome", 0, { position: 1, parent_id: "c-nw-info", topic: "Start here. Read the house rules, then say hello in #studio." }),
    ch("c-nw-announce", NW, "announcements", 5, { position: 2, parent_id: "c-nw-info", topic: "Ship notes and quiet broadcasts." }),
    ch("c-nw-work", NW, "Work", 4, { position: 3 }),
    ch("c-nw-studio", NW, "studio", 0, { position: 4, parent_id: "c-nw-work", topic: "Day-to-day product talk." }),
    ch("c-nw-eng", NW, "engineering", 0, { position: 5, parent_id: "c-nw-work", topic: "Infra, reviews, incidents." }),
    ch("c-nw-design", NW, "design", 0, { position: 6, parent_id: "c-nw-work", topic: "Critique and files." }),
    ch("c-nw-voice", NW, "Voice", 4, { position: 7 }),
    ch("c-nw-lounge", NW, "Lounge", 2, { position: 8, parent_id: "c-nw-voice", bitrate: 64000, user_limit: 0 }),
    ch("c-nw-focus", NW, "Focus", 2, { position: 9, parent_id: "c-nw-voice", bitrate: 96000, user_limit: 4 }),
  ],
  [HP]: [
    ch("c-hp-town", HP, "Town", 4, { position: 0 }),
    ch("c-hp-general", HP, "general", 0, { position: 1, parent_id: "c-hp-town", topic: "Anything goes, keep it kind." }),
    ch("c-hp-lfg", HP, "looking-for-group", 0, { position: 2, parent_id: "c-hp-town", topic: "Post roles and start times." }),
    ch("c-hp-voice", HP, "Voice", 4, { position: 3 }),
    ch("c-hp-raid", HP, "Raid night", 2, { position: 4, parent_id: "c-hp-voice", bitrate: 128000, user_limit: 12 }),
    ch("c-hp-stage", HP, "Town hall", 13, { position: 5, parent_id: "c-hp-voice" }),
  ],
  [SR]: [
    ch("c-sr-ops", SR, "ops", 0, { position: 0, topic: "Internal bot operations." }),
    ch("c-sr-logs", SR, "logs", 0, { position: 1, topic: "Quiet log stream." }),
  ],
};

function msg(
  id: string,
  channel_id: string,
  author: DiscordUser,
  content: string,
  minutesAgo: number,
  extra: Partial<DiscordMessage> = {},
): DiscordMessage {
  return {
    id,
    channel_id,
    author,
    content,
    timestamp: ago(minutesAgo),
    edited_timestamp: null,
    embeds: [],
    pinned: false,
    type: 0,
    ...extra,
  };
}

export const demoMessages: Record<string, DiscordMessage[]> = {
  "c-nw-studio": [
    msg("m1", "c-nw-studio", U.mara, "Shipping the dashboard copy this afternoon. Anyone blocking on the empty states?", 210),
    msg("m2", "c-nw-studio", U.jules, "I can take the empty states. Keeping them quiet — no illustration, just a line of type and one action.", 188),
    msg("m3", "c-nw-studio", U.kenji, "API proxy is live. Tokens stay in the session, never hit the database.", 140),
    msg("m4", "c-nw-studio", demoBot, "Reminder: staging goes dark at 18:00 UTC for the cutover.", 95, {
      embeds: [
        {
          title: "Staging window",
          description: "The staging bot will be unreachable for twenty minutes while we rotate tokens.",
          color: 0xc9bfb0,
          footer: { text: "Relay · scheduled" },
        },
      ],
    }),
    msg("m5", "c-nw-studio", U.ada, "Noted. I'll freeze deploys until 18:30.", 80),
    msg("m6", "c-nw-studio", U.rio, "First day — where should I read before touching channels?", 22),
    msg("m7", "c-nw-studio", demoBot, "Start in #welcome, then this channel. Channel edits live under the Channels tab in Relay.", 18),
  ],
  "c-nw-welcome": [
    msg("w1", "c-nw-welcome", demoBot, "Welcome to Northwind Labs. Introduce yourself in #studio when you're ready.", 4000, {
      embeds: [
        {
          title: "House notes",
          description: "Be precise. Critique the work, not the person. Bots belong in the Bots role.",
          color: 0x7d8b99,
          fields: [
            { name: "Studio", value: "Product talk", inline: true },
            { name: "Engineering", value: "Infra and reviews", inline: true },
          ],
        },
      ],
    }),
    msg("w2", "c-nw-welcome", U.rio, "Hi — Rio, joining the design rotation this month.", 30),
  ],
  "c-nw-eng": [
    msg("e1", "c-nw-eng", U.kenji, "Rate limit handler maps Discord 429 onto a toast with retry_after. Looks clean.", 50),
    msg("e2", "c-nw-eng", U.ada, "I'll add the members intent note in bot settings so people know why the roster can be empty.", 41),
  ],
  "c-hp-general": [
    msg("h1", "c-hp-general", U.nova, "Raid night moved to 21:00. Bring a quiet mic.", 320),
    msg("h2", "c-hp-general", U.theo, "I'll be late — start without me on trash, I'll join for boss two.", 280),
    msg("h3", "c-hp-general", demoBot, "Event pinned: Hollow Park raid, tonight 21:00 server time.", 260),
    msg("h4", "c-hp-general", U.iris, "Anyone got a spare tank for the off-night dungeon?", 12),
  ],
  "c-hp-lfg": [
    msg("l1", "c-hp-lfg", U.iris, "Need 1 healer, 1 dps — dungeon queue in 10.", 15),
  ],
  "c-sr-ops": [
    msg("o1", "c-sr-ops", U.mara, "Sample bot is wired. Anyone with a real token can connect from the same page — sessions never mix.", 120),
    msg("o2", "c-sr-ops", demoBot, "Health check ok. 3 guilds visible.", 5),
  ],
  "c-sr-logs": [
    msg("lg1", "c-sr-logs", demoBot, "connected · sample session", 5),
  ],
};

export function cloneDemo() {
  return {
    bot: structuredClone(demoBot),
    application: structuredClone(demoApplication),
    guilds: structuredClone(demoGuilds),
    channels: structuredClone(demoChannels),
    messages: structuredClone(demoMessages),
    members: structuredClone(demoMembers),
    roles: structuredClone(demoRoles),
  };
}

export type DemoSnapshot = ReturnType<typeof cloneDemo>;
