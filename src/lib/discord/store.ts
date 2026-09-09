import { create } from "zustand";
import { discordRequest } from "./api";
import { isTextLike } from "./format";
import { destroyGateway, ensureGateway, getGateway, type PresencePayload } from "./gateway";
import { cloneDemo, type DemoSnapshot } from "./mock";
import type {
  AppView,
  DiscordApplication,
  DiscordApplicationCommand,
  DiscordChannel,
  DiscordEmbed,
  DiscordGuild,
  DiscordMember,
  DiscordMessage,
  DiscordPresenceUpdate,
  DiscordRole,
  DiscordUser,
  DiscordWebhook,
} from "./types";

const TOKEN_KEY = "relay.token";
const MODE_KEY = "relay.mode";

type Mode = "demo" | "live" | null;

type RateLimitState = {
  until: number;
  message: string;
} | null;

type RelayState = {
  mode: Mode;
  token: string | null;
  bot: DiscordUser | null;
  application: DiscordApplication | null;
  guilds: DiscordGuild[];
  channels: Record<string, DiscordChannel[]>;
  messages: Record<string, DiscordMessage[]>;
  members: Record<string, DiscordMember[]>;
  roles: Record<string, DiscordRole[]>;
  webhooks: Record<string, DiscordWebhook[]>;
  commands: {
    global: DiscordApplicationCommand[];
    guild: Record<string, DiscordApplicationCommand[]>;
  };
  presence: DiscordPresenceUpdate | null;
  voiceChannelId: string | null;
  gatewayConnected: boolean;
  view: AppView;
  loading: boolean;
  connecting: boolean;
  error: string | null;
  rateLimit: RateLimitState;
  demo: DemoSnapshot | null;

  hydrate: () => void;
  connectLive: (token: string) => Promise<void>;
  connectDemo: () => void;
  disconnect: () => void;
  setView: (view: AppView) => void;
  clearError: () => void;
  clearRateLimit: () => void;

  openGuild: (guildId: string) => void;
  loadGuild: (guildId: string) => Promise<void>;
  loadMessages: (channelId: string, force?: boolean) => Promise<void>;
  sendMessage: (
    channelId: string,
    content: string,
    embeds?: DiscordEmbed[],
    opts?: { messageReferenceId?: string },
  ) => Promise<void>;
  editMember: (
    guildId: string,
    userId: string,
    data: { nick?: string | null; roles?: string[]; mute?: boolean; deaf?: boolean },
  ) => Promise<void>;
  sendWebhookMessage: (
    webhookId: string,
    webhookToken: string,
    content: string,
    embeds?: DiscordEmbed[],
  ) => Promise<void>;
  editMessage: (channelId: string, messageId: string, content: string, embeds?: DiscordEmbed[]) => Promise<void>;
  deleteMessage: (channelId: string, messageId: string) => Promise<void>;

  createChannel: (guildId: string, data: Partial<DiscordChannel> & { name: string; type: number }) => Promise<void>;
  editChannel: (guildId: string, channelId: string, data: Partial<DiscordChannel>) => Promise<void>;
  deleteChannel: (guildId: string, channelId: string) => Promise<void>;

  createRole: (guildId: string, data: { name: string; color?: number; hoist?: boolean; mentionable?: boolean; permissions?: string }) => Promise<void>;
  editRole: (guildId: string, roleId: string, data: Partial<DiscordRole>) => Promise<void>;
  deleteRole: (guildId: string, roleId: string) => Promise<void>;

  kickMember: (guildId: string, userId: string, reason?: string) => Promise<void>;
  banMember: (guildId: string, userId: string, opts?: { reason?: string; delete_message_seconds?: number }) => Promise<void>;
  unbanMember: (guildId: string, userId: string) => Promise<void>;
  timeoutMember: (guildId: string, userId: string, until: string | null, reason?: string) => Promise<void>;

  loadWebhooks: (guildId: string) => Promise<void>;
  createWebhook: (channelId: string, name: string, avatar?: string | null) => Promise<DiscordWebhook>;
  editWebhook: (webhookId: string, data: { name?: string; avatar?: string | null; channel_id?: string }) => Promise<void>;
  deleteWebhook: (webhookId: string, guildId: string) => Promise<void>;

  loadCommands: (guildId?: string) => Promise<void>;
  createCommand: (data: Partial<DiscordApplicationCommand> & { name: string; description: string; type?: number }, guildId?: string) => Promise<void>;
  editCommand: (commandId: string, data: Partial<DiscordApplicationCommand>, guildId?: string) => Promise<void>;
  deleteCommand: (commandId: string, guildId?: string) => Promise<void>;

  setPresence: (presence: DiscordPresenceUpdate) => Promise<void>;
  joinVoice: (guildId: string, channelId: string) => Promise<void>;
  leaveVoice: (guildId: string) => Promise<void>;

  editGuild: (guildId: string, data: { name?: string; description?: string | null; icon?: string | null }) => Promise<void>;
  editBot: (data: { username?: string; avatar?: string | null; banner?: string | null }) => Promise<void>;
  editApplication: (data: { description?: string }) => Promise<void>;
};

function persist(mode: Mode, token: string | null) {
  if (typeof window === "undefined") return;
  if (!mode) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(MODE_KEY);
    return;
  }
  sessionStorage.setItem(MODE_KEY, mode);
  if (mode === "live" && token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

function extractRateLimit(err: unknown): RateLimitState {
  if (!err || typeof err !== "object") return null;
  const e = err as { status?: number; retryAfter?: number; message?: string };
  if (e.status === 429 || (typeof e.message === "string" && e.message.toLowerCase().includes("rate-limit"))) {
    const seconds = typeof e.retryAfter === "number" ? e.retryAfter : 5;
    return { until: Date.now() + Math.ceil(seconds * 1000), message: e.message || `Rate limited. Retry in ${Math.ceil(seconds)}s.` };
  }
  return null;
}

async function live<T>(token: string, method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown): Promise<T> {
  try {
    return (await discordRequest({ data: { token, method, path, body } })) as T;
  } catch (err) {
    const rl = extractRateLimit(err);
    if (rl) useRelay.setState({ rateLimit: rl });
    throw err;
  }
}

function nid(): string {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

const MANAGED_ACTIVITY = { name: "Managed by BotDeck", type: 0 as const };

export const useRelay = create<RelayState>((set, get) => ({
  mode: null,
  token: null,
  bot: null,
  application: null,
  guilds: [],
  channels: {},
  messages: {},
  members: {},
  roles: {},
  webhooks: {},
  commands: { global: [], guild: {} },
  presence: null,
  voiceChannelId: null,
  gatewayConnected: false,
  view: { t: "overview" },
  loading: false,
  connecting: false,
  error: null,
  rateLimit: null,
  demo: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const mode = sessionStorage.getItem(MODE_KEY) as Mode | null;
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (mode === "demo") get().connectDemo();
    else if (mode === "live" && token) void get().connectLive(token);
  },

  connectLive: async (rawToken) => {
    const token = rawToken.trim();
    set({ connecting: true, error: null, rateLimit: null });
    try {
      const bot = await live<DiscordUser>(token, "GET", "/users/@me");
      if (!bot.bot) throw new Error("This token belongs to a user account. BotDeck only accepts bot tokens.");
      let application: DiscordApplication | null = null;
      try {
        application = await live<DiscordApplication>(token, "GET", "/applications/@me");
      } catch {
        try {
          application = await live<DiscordApplication>(token, "GET", "/oauth2/applications/@me");
        } catch {
          application = null;
        }
      }
      const guilds = await live<DiscordGuild[]>(token, "GET", "/users/@me/guilds?with_counts=true");
      persist("live", token);
      set({
        mode: "live",
        token,
        bot,
        application,
        guilds: Array.isArray(guilds) ? guilds : [],
        channels: {},
        messages: {},
        members: {},
        roles: {},
        webhooks: {},
        commands: { global: [], guild: {} },
        presence: { status: "online", activities: [MANAGED_ACTIVITY] },
        voiceChannelId: null,
        gatewayConnected: false,
        demo: null,
        view: { t: "overview" },
        connecting: false,
        error: null,
      });
      if (typeof window !== "undefined") {
        const gw = ensureGateway(token, {
          onReady: () => {
            useRelay.setState({
              gatewayConnected: true,
              presence: { status: "online", activities: [MANAGED_ACTIVITY] },
            });
            getGateway()?.updatePresence({
              status: "online",
              activities: [{ name: "Managed by BotDeck", type: 0 }],
              afk: false,
            });
          },
          onClose: () => useRelay.setState({ gatewayConnected: false }),
          onError: (message) => useRelay.setState({ error: message, gatewayConnected: false }),
        });
        gw.updatePresence({
          status: "online",
          activities: [{ name: "Managed by BotDeck", type: 0 }],
          afk: false,
        });
      }
    } catch (err) {
      persist(null, null);
      set({
        connecting: false,
        mode: null,
        token: null,
        error: err instanceof Error ? err.message : "Could not connect.",
      });
      throw err;
    }
  },

  connectDemo: () => {
    const demo = cloneDemo();
    persist("demo", null);
    set({
      mode: "demo",
      token: null,
      bot: demo.bot,
      application: demo.application,
      guilds: demo.guilds,
      channels: demo.channels,
      messages: demo.messages,
      members: demo.members,
      roles: demo.roles,
      webhooks: {},
      commands: { global: [], guild: {} },
      presence: { status: "online", activities: [{ name: "Managed by BotDeck", type: 0 }] },
      voiceChannelId: null,
      gatewayConnected: false,
      demo,
      view: { t: "overview" },
      connecting: false,
      error: null,
      rateLimit: null,
    });
  },

  disconnect: () => {
    if (typeof window !== "undefined") destroyGateway();
    persist(null, null);
    set({
      mode: null,
      token: null,
      bot: null,
      application: null,
      guilds: [],
      channels: {},
      messages: {},
      members: {},
      roles: {},
      webhooks: {},
      commands: { global: [], guild: {} },
      presence: null,
      voiceChannelId: null,
      gatewayConnected: false,
      demo: null,
      view: { t: "overview" },
      error: null,
      rateLimit: null,
    });
  },

  setView: (view) => set({ view }),
  clearError: () => set({ error: null }),
  clearRateLimit: () => set({ rateLimit: null }),

  openGuild: (guildId) => {
    const list = get().channels[guildId] ?? [];
    const first = list.find((c) => isTextLike(c.type));
    set({ view: { t: "guild", id: guildId, tab: "chat", channelId: first?.id } });
    void get().loadGuild(guildId);
  },

  loadGuild: async (guildId) => {
    const { mode, token, channels } = get();
    if (mode === "demo") {
      const list = channels[guildId] ?? [];
      const first = list.find((c) => isTextLike(c.type));
      const v = get().view;
      if (first && v.t === "guild" && v.id === guildId && !v.channelId) set({ view: { ...v, channelId: first.id } });
      return;
    }
    if (!token) return;
    if (channels[guildId]?.length) {
      const first = channels[guildId].find((c) => isTextLike(c.type));
      const v = get().view;
      if (first && v.t === "guild" && v.id === guildId && !v.channelId) set({ view: { ...v, channelId: first.id } });
      return;
    }
    set({ loading: true });
    try {
      const [ch, roles] = await Promise.all([
        live<DiscordChannel[]>(token, "GET", `/guilds/${guildId}/channels`),
        live<DiscordRole[]>(token, "GET", `/guilds/${guildId}/roles`).catch(() => [] as DiscordRole[]),
      ]);
      let members: DiscordMember[] = [];
      try {
        members = await live<DiscordMember[]>(token, "GET", `/guilds/${guildId}/members?limit=100`);
      } catch {
        members = [];
      }
      const list = Array.isArray(ch) ? ch : [];
      const first = list.find((c) => isTextLike(c.type));
      set((s) => {
        const shouldSelect = !!first && s.view.t === "guild" && s.view.id === guildId && !s.view.channelId;
        return {
          channels: { ...s.channels, [guildId]: list },
          roles: { ...s.roles, [guildId]: Array.isArray(roles) ? roles : [] },
          members: { ...s.members, [guildId]: Array.isArray(members) ? members : [] },
          view: shouldSelect && first ? { ...s.view, channelId: first.id } : s.view,
          loading: false,
        };
      });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Failed to load server." });
      throw err;
    }
  },

  loadMessages: async (channelId, force = false) => {
    const { mode, token, messages } = get();
    if (mode === "demo") return;
    if (!token) return;
    if (!force && messages[channelId]) return;
    if (!force) set({ loading: true });
    try {
      const list = await live<DiscordMessage[]>(token, "GET", `/channels/${channelId}/messages?limit=50`);
      const ordered = Array.isArray(list) ? [...list].reverse() : [];
      set((s) => ({ messages: { ...s.messages, [channelId]: ordered }, loading: force ? s.loading : false }));
    } catch (err) {
      if (force) return;
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load messages.",
        messages: { ...get().messages, [channelId]: [] },
      });
    }
  },

  sendMessage: async (channelId, content, embeds, opts) => {
    const { mode, token, bot } = get();
    const body: {
      content?: string;
      embeds?: DiscordEmbed[];
      message_reference?: { message_id: string; fail_if_not_exists?: boolean };
    } = {};
    if (content.trim()) body.content = content;
    if (embeds && embeds.length) body.embeds = embeds;
    if (opts?.messageReferenceId) {
      body.message_reference = { message_id: opts.messageReferenceId, fail_if_not_exists: false };
    }
    if (!body.content && !body.embeds?.length) throw new Error("Write a message or add an embed.");
    if (mode === "demo" && bot) {
      const created: DiscordMessage = {
        id: nid(),
        channel_id: channelId,
        author: bot,
        content: body.content ?? "",
        timestamp: new Date().toISOString(),
        edited_timestamp: null,
        embeds: body.embeds ?? [],
        pinned: false,
        type: 0,
      };
      set((s) => ({ messages: { ...s.messages, [channelId]: [...(s.messages[channelId] ?? []), created] } }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const created = await live<DiscordMessage>(token, "POST", `/channels/${channelId}/messages`, body);
    set((s) => ({ messages: { ...s.messages, [channelId]: [...(s.messages[channelId] ?? []), created] } }));
  },

  editMember: async (guildId, userId, data) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({
        members: {
          ...s.members,
          [guildId]: (s.members[guildId] ?? []).map((m) =>
            m.user?.id === userId
              ? {
                  ...m,
                  nick: data.nick !== undefined ? data.nick : m.nick,
                  roles: data.roles !== undefined ? data.roles : m.roles,
                }
              : m,
          ),
        },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const body: Record<string, unknown> = {};
    if (data.nick !== undefined) body.nick = data.nick;
    if (data.roles !== undefined) body.roles = data.roles;
    if (data.mute !== undefined) body.mute = data.mute;
    if (data.deaf !== undefined) body.deaf = data.deaf;
    await live(token, "PATCH", `/guilds/${guildId}/members/${userId}`, body);
    set((s) => ({
      members: {
        ...s.members,
        [guildId]: (s.members[guildId] ?? []).map((m) =>
          m.user?.id === userId
            ? {
                ...m,
                nick: data.nick !== undefined ? data.nick : m.nick,
                roles: data.roles !== undefined ? data.roles : m.roles,
              }
            : m,
        ),
      },
    }));
  },

  sendWebhookMessage: async (webhookId, webhookToken, content, embeds) => {
    const { mode, token } = get();
    const body: { content?: string; embeds?: DiscordEmbed[] } = {};
    if (content.trim()) body.content = content;
    if (embeds?.length) body.embeds = embeds;
    if (!body.content && !body.embeds?.length) throw new Error("Write a message or add an embed.");
    if (mode === "demo") return;
    if (!token) throw new Error("Not connected.");
    await live(token, "POST", `/webhooks/${webhookId}/${webhookToken}`, body);
  },

  editMessage: async (channelId, messageId, content, embeds) => {
    const { mode, token } = get();
    const body: { content?: string; embeds?: DiscordEmbed[] } = { content };
    if (embeds) body.embeds = embeds;
    if (mode === "demo") {
      set((s) => ({
        messages: {
          ...s.messages,
          [channelId]: (s.messages[channelId] ?? []).map((m) =>
            m.id === messageId
              ? { ...m, content, embeds: embeds ?? m.embeds, edited_timestamp: new Date().toISOString() }
              : m,
          ),
        },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const updated = await live<DiscordMessage>(token, "PATCH", `/channels/${channelId}/messages/${messageId}`, body);
    set((s) => ({
      messages: {
        ...s.messages,
        [channelId]: (s.messages[channelId] ?? []).map((m) => (m.id === messageId ? updated : m)),
      },
    }));
  },

  deleteMessage: async (channelId, messageId) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({
        messages: {
          ...s.messages,
          [channelId]: (s.messages[channelId] ?? []).filter((m) => m.id !== messageId),
        },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    await live(token, "DELETE", `/channels/${channelId}/messages/${messageId}`);
    set((s) => ({
      messages: {
        ...s.messages,
        [channelId]: (s.messages[channelId] ?? []).filter((m) => m.id !== messageId),
      },
    }));
  },

  createChannel: async (guildId, data) => {
    const { mode, token } = get();
    if (mode === "demo") {
      const created: DiscordChannel = {
        id: nid(),
        guild_id: guildId,
        name: data.name,
        type: data.type,
        topic: data.topic ?? null,
        nsfw: data.nsfw ?? false,
        position: (get().channels[guildId] ?? []).length,
        parent_id: data.parent_id ?? null,
        rate_limit_per_user: data.rate_limit_per_user ?? 0,
      };
      set((s) => ({ channels: { ...s.channels, [guildId]: [...(s.channels[guildId] ?? []), created] } }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const created = await live<DiscordChannel>(token, "POST", `/guilds/${guildId}/channels`, {
      name: data.name,
      type: data.type,
      topic: data.topic,
      parent_id: data.parent_id ?? undefined,
      nsfw: data.nsfw,
      rate_limit_per_user: data.rate_limit_per_user,
    });
    set((s) => ({ channels: { ...s.channels, [guildId]: [...(s.channels[guildId] ?? []), created] } }));
  },

  editChannel: async (guildId, channelId, data) => {
    const { mode, token } = get();
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.topic !== undefined) patch.topic = data.topic;
    if (data.nsfw !== undefined) patch.nsfw = data.nsfw;
    if (data.parent_id !== undefined) patch.parent_id = data.parent_id;
    if (data.rate_limit_per_user !== undefined) patch.rate_limit_per_user = data.rate_limit_per_user;
    if (data.position !== undefined) patch.position = data.position;
    if (data.bitrate !== undefined) patch.bitrate = data.bitrate;
    if (data.user_limit !== undefined) patch.user_limit = data.user_limit;
    if (mode === "demo") {
      set((s) => ({
        channels: {
          ...s.channels,
          [guildId]: (s.channels[guildId] ?? []).map((c) => (c.id === channelId ? { ...c, ...data } : c)),
        },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const updated = await live<DiscordChannel>(token, "PATCH", `/channels/${channelId}`, patch);
    set((s) => ({
      channels: {
        ...s.channels,
        [guildId]: (s.channels[guildId] ?? []).map((c) => (c.id === channelId ? updated : c)),
      },
    }));
  },

  deleteChannel: async (guildId, channelId) => {
    const { mode, token, view } = get();
    if (mode === "demo") {
      set((s) => ({
        channels: {
          ...s.channels,
          [guildId]: (s.channels[guildId] ?? []).filter((c) => c.id !== channelId && c.parent_id !== channelId),
        },
      }));
    } else {
      if (!token) throw new Error("Not connected.");
      await live(token, "DELETE", `/channels/${channelId}`);
      set((s) => ({
        channels: {
          ...s.channels,
          [guildId]: (s.channels[guildId] ?? []).filter((c) => c.id !== channelId),
        },
      }));
    }
    if (view.t === "guild" && view.channelId === channelId) {
      set({ view: { ...view, channelId: undefined } });
    }
  },

  createRole: async (guildId, data) => {
    const { mode, token } = get();
    if (mode === "demo") {
      const created: DiscordRole = {
        id: nid(),
        name: data.name,
        color: data.color ?? 0,
        position: (get().roles[guildId] ?? []).length,
        permissions: data.permissions ?? "0",
        managed: false,
        mentionable: data.mentionable ?? false,
        hoist: data.hoist ?? false,
      };
      set((s) => ({ roles: { ...s.roles, [guildId]: [...(s.roles[guildId] ?? []), created] } }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const created = await live<DiscordRole>(token, "POST", `/guilds/${guildId}/roles`, data);
    set((s) => ({ roles: { ...s.roles, [guildId]: [...(s.roles[guildId] ?? []), created] } }));
  },

  editRole: async (guildId, roleId, data) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({
        roles: {
          ...s.roles,
          [guildId]: (s.roles[guildId] ?? []).map((r) => (r.id === roleId ? { ...r, ...data } : r)),
        },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const updated = await live<DiscordRole>(token, "PATCH", `/guilds/${guildId}/roles/${roleId}`, data);
    set((s) => ({
      roles: {
        ...s.roles,
        [guildId]: (s.roles[guildId] ?? []).map((r) => (r.id === roleId ? updated : r)),
      },
    }));
  },

  deleteRole: async (guildId, roleId) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({ roles: { ...s.roles, [guildId]: (s.roles[guildId] ?? []).filter((r) => r.id !== roleId) } }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    await live(token, "DELETE", `/guilds/${guildId}/roles/${roleId}`);
    set((s) => ({ roles: { ...s.roles, [guildId]: (s.roles[guildId] ?? []).filter((r) => r.id !== roleId) } }));
  },

  kickMember: async (guildId, userId, reason) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({
        members: { ...s.members, [guildId]: (s.members[guildId] ?? []).filter((m) => m.user?.id !== userId) },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    await live(token, "DELETE", `/guilds/${guildId}/members/${userId}`, reason ? { reason } : undefined);
    set((s) => ({
      members: { ...s.members, [guildId]: (s.members[guildId] ?? []).filter((m) => m.user?.id !== userId) },
    }));
  },

  banMember: async (guildId, userId, opts) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({
        members: { ...s.members, [guildId]: (s.members[guildId] ?? []).filter((m) => m.user?.id !== userId) },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    await live(token, "PUT", `/guilds/${guildId}/bans/${userId}`, {
      reason: opts?.reason,
      delete_message_seconds: opts?.delete_message_seconds ?? 0,
    });
    set((s) => ({
      members: { ...s.members, [guildId]: (s.members[guildId] ?? []).filter((m) => m.user?.id !== userId) },
    }));
  },

  unbanMember: async (guildId, userId) => {
    const { mode, token } = get();
    if (mode === "demo") return;
    if (!token) throw new Error("Not connected.");
    await live(token, "DELETE", `/guilds/${guildId}/bans/${userId}`);
  },

  timeoutMember: async (guildId, userId, until, reason) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({
        members: {
          ...s.members,
          [guildId]: (s.members[guildId] ?? []).map((m) =>
            m.user?.id === userId ? { ...m, communication_disabled_until: until } : m,
          ),
        },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    await live(token, "PATCH", `/guilds/${guildId}/members/${userId}`, {
      communication_disabled_until: until,
      reason,
    });
    set((s) => ({
      members: {
        ...s.members,
        [guildId]: (s.members[guildId] ?? []).map((m) =>
          m.user?.id === userId ? { ...m, communication_disabled_until: until } : m,
        ),
      },
    }));
  },

  loadWebhooks: async (guildId) => {
    const { mode, token } = get();
    if (mode === "demo" || !token) return;
    try {
      const list = await live<DiscordWebhook[]>(token, "GET", `/guilds/${guildId}/webhooks`);
      set((s) => ({ webhooks: { ...s.webhooks, [guildId]: Array.isArray(list) ? list : [] } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load webhooks." });
    }
  },

  createWebhook: async (channelId, name, avatar) => {
    const { mode, token } = get();
    if (mode === "demo") {
      return {
        id: nid(),
        type: 1,
        channel_id: channelId,
        name,
        avatar: avatar ?? null,
        token: "demo",
        url: "https://discord.com/api/webhooks/demo",
      } as DiscordWebhook;
    }
    if (!token) throw new Error("Not connected.");
    return live<DiscordWebhook>(token, "POST", `/channels/${channelId}/webhooks`, { name, avatar });
  },

  editWebhook: async (webhookId, data) => {
    const { mode, token } = get();
    if (mode === "demo") return;
    if (!token) throw new Error("Not connected.");
    await live(token, "PATCH", `/webhooks/${webhookId}`, data);
  },

  deleteWebhook: async (webhookId, guildId) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({
        webhooks: { ...s.webhooks, [guildId]: (s.webhooks[guildId] ?? []).filter((w) => w.id !== webhookId) },
      }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    await live(token, "DELETE", `/webhooks/${webhookId}`);
    set((s) => ({
      webhooks: { ...s.webhooks, [guildId]: (s.webhooks[guildId] ?? []).filter((w) => w.id !== webhookId) },
    }));
  },

  loadCommands: async (guildId) => {
    const { mode, token, application } = get();
    if (mode === "demo" || !token || !application) return;
    try {
      if (guildId) {
        const list = await live<DiscordApplicationCommand[]>(
          token,
          "GET",
          `/applications/${application.id}/guilds/${guildId}/commands`,
        );
        set((s) => ({
          commands: { ...s.commands, guild: { ...s.commands.guild, [guildId]: Array.isArray(list) ? list : [] } },
        }));
      } else {
        const list = await live<DiscordApplicationCommand[]>(token, "GET", `/applications/${application.id}/commands`);
        set((s) => ({ commands: { ...s.commands, global: Array.isArray(list) ? list : [] } }));
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load commands." });
    }
  },

  createCommand: async (data, guildId) => {
    const { mode, token, application } = get();
    if (mode === "demo" || !token || !application) throw new Error("Not connected.");
    const path = guildId
      ? `/applications/${application.id}/guilds/${guildId}/commands`
      : `/applications/${application.id}/commands`;
    const created = await live<DiscordApplicationCommand>(token, "POST", path, {
      name: data.name,
      description: data.description,
      type: data.type ?? 1,
      options: data.options,
    });
    if (guildId) {
      set((s) => ({
        commands: {
          ...s.commands,
          guild: { ...s.commands.guild, [guildId]: [...(s.commands.guild[guildId] ?? []), created] },
        },
      }));
    } else {
      set((s) => ({ commands: { ...s.commands, global: [...s.commands.global, created] } }));
    }
  },

  editCommand: async (commandId, data, guildId) => {
    const { mode, token, application } = get();
    if (mode === "demo" || !token || !application) throw new Error("Not connected.");
    const path = guildId
      ? `/applications/${application.id}/guilds/${guildId}/commands/${commandId}`
      : `/applications/${application.id}/commands/${commandId}`;
    const updated = await live<DiscordApplicationCommand>(token, "PATCH", path, data);
    if (guildId) {
      set((s) => ({
        commands: {
          ...s.commands,
          guild: {
            ...s.commands.guild,
            [guildId]: (s.commands.guild[guildId] ?? []).map((c) => (c.id === commandId ? updated : c)),
          },
        },
      }));
    } else {
      set((s) => ({
        commands: { ...s.commands, global: s.commands.global.map((c) => (c.id === commandId ? updated : c)) },
      }));
    }
  },

  deleteCommand: async (commandId, guildId) => {
    const { mode, token, application } = get();
    if (mode === "demo" || !token || !application) throw new Error("Not connected.");
    const path = guildId
      ? `/applications/${application.id}/guilds/${guildId}/commands/${commandId}`
      : `/applications/${application.id}/commands/${commandId}`;
    await live(token, "DELETE", path);
    if (guildId) {
      set((s) => ({
        commands: {
          ...s.commands,
          guild: {
            ...s.commands.guild,
            [guildId]: (s.commands.guild[guildId] ?? []).filter((c) => c.id !== commandId),
          },
        },
      }));
    } else {
      set((s) => ({
        commands: { ...s.commands, global: s.commands.global.filter((c) => c.id !== commandId) },
      }));
    }
  },

  setPresence: async (presence) => {
    const { mode, token } = get();
    set({ presence });
    if (mode === "demo") return;
    if (!token) throw new Error("Not connected.");
    if (typeof window === "undefined") return;
    const gw = ensureGateway(token, {
      onReady: () => useRelay.setState({ gatewayConnected: true }),
      onClose: () => useRelay.setState({ gatewayConnected: false }),
      onError: (message) => useRelay.setState({ error: message, gatewayConnected: false }),
    });
    gw.updatePresence({
      status: presence.status,
      activities: presence.activities?.map((a) => ({
        name: a.name,
        type: a.type,
        url: a.url,
        state: a.state,
      })),
      afk: false,
    });
  },

  joinVoice: async (guildId, channelId) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set({ voiceChannelId: channelId });
      return;
    }
    if (!token) throw new Error("Not connected.");
    if (typeof window === "undefined") throw new Error("Voice join needs the browser.");
    const gw = ensureGateway(token, {
      onReady: () => useRelay.setState({ gatewayConnected: true }),
      onClose: () => useRelay.setState({ gatewayConnected: false }),
      onError: (message) => useRelay.setState({ error: message, gatewayConnected: false }),
    });
    gw.updateVoiceState(guildId, channelId, false, false);
    set({ voiceChannelId: channelId });
  },

  leaveVoice: async (guildId) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set({ voiceChannelId: null });
      return;
    }
    if (!token) throw new Error("Not connected.");
    if (typeof window === "undefined") return;
    const gw = ensureGateway(token);
    gw.updateVoiceState(guildId, null, false, false);
    set({ voiceChannelId: null });
  },

  editGuild: async (guildId, data) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({ guilds: s.guilds.map((g) => (g.id === guildId ? { ...g, ...data } : g)) }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const updated = await live<DiscordGuild>(token, "PATCH", `/guilds/${guildId}`, data);
    set((s) => ({ guilds: s.guilds.map((g) => (g.id === guildId ? { ...g, ...updated } : g)) }));
  },

  editBot: async (data) => {
    const { mode, token } = get();
    if (mode === "demo") {
      set((s) => ({ bot: s.bot ? { ...s.bot, ...data } : s.bot }));
      return;
    }
    if (!token) throw new Error("Not connected.");
    const updated = await live<DiscordUser>(token, "PATCH", "/users/@me", data);
    set({ bot: updated });
  },

  editApplication: async (data) => {
    const { mode, token, application } = get();
    if (mode === "demo") {
      set((s) => ({ application: s.application ? { ...s.application, ...data } : s.application }));
      return;
    }
    if (!token || !application) throw new Error("Application profile is not available for this bot.");
    const updated = await live<DiscordApplication>(token, "PATCH", "/applications/@me", data);
    set({ application: updated });
  },
}));
