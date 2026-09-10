/**
 * Discord Gateway client (browser).
 * Presence (op 3), voice state (op 4), and voice roster via GUILD_VOICE_STATES.
 */

export type PresenceStatus = "online" | "idle" | "dnd" | "invisible";

export type PresencePayload = {
  status: PresenceStatus;
  activities?: {
    name: string;
    type: number;
    url?: string;
    state?: string;
  }[];
  afk?: boolean;
};

export type GatewayVoiceState = {
  guild_id?: string;
  channel_id: string | null;
  user_id: string;
  session_id?: string;
  deaf?: boolean;
  mute?: boolean;
  self_deaf?: boolean;
  self_mute?: boolean;
  member?: {
    nick?: string | null;
    user?: {
      id: string;
      username: string;
      global_name?: string | null;
      avatar: string | null;
      bot?: boolean;
      discriminator?: string;
    };
  };
};

type GatewayHandlers = {
  onReady?: () => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (message: string) => void;
  onVoiceStateUpdate?: (state: GatewayVoiceState) => void;
  onGuildVoiceStates?: (guildId: string, states: GatewayVoiceState[]) => void;
};

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
/** GUILDS (1) + GUILD_VOICE_STATES (128) — required to list who is in VC */
const INTENTS = 1 | 128;

const DEFAULT_PRESENCE: PresencePayload = {
  status: "online",
  activities: [{ name: "Managed by BotDeck", type: 0 }],
  afk: false,
};

export class DiscordGateway {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private presenceTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private sequence: number | null = null;
  private sessionId: string | null = null;
  private token: string;
  private handlers: GatewayHandlers;
  private lastPresence: PresencePayload = {
    status: DEFAULT_PRESENCE.status,
    activities: [...(DEFAULT_PRESENCE.activities ?? [])],
    afk: false,
  };
  private intentionalClose = false;
  private reconnectAttempts = 0;

  constructor(token: string, handlers: GatewayHandlers = {}) {
    this.token = token;
    this.handlers = handlers;
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.intentionalClose = false;
    const ws = new WebSocket(GATEWAY_URL);
    this.ws = ws;

    ws.onmessage = (ev) => {
      try {
        const packet = JSON.parse(String(ev.data)) as {
          op: number;
          d: unknown;
          s: number | null;
          t: string | null;
        };
        if (packet.s != null) this.sequence = packet.s;

        switch (packet.op) {
          case 10: {
            const d = packet.d as { heartbeat_interval: number };
            this.startHeartbeat(d.heartbeat_interval);
            this.identify();
            break;
          }
          case 11:
            break;
          case 0:
            this.handleDispatch(packet.t, packet.d);
            break;
          case 9:
            this.handlers.onError?.("Gateway session invalid. Reconnecting…");
            this.scheduleReconnect(true);
            break;
          default:
            break;
        }
      } catch {
        this.handlers.onError?.("Bad gateway payload.");
      }
    };

    ws.onerror = () => {
      this.handlers.onError?.("Gateway connection error.");
    };

    ws.onclose = (ev) => {
      this.clearHeartbeat();
      this.clearPresenceRefresh();
      this.ws = null;
      if (!this.intentionalClose) {
        this.handlers.onClose?.(ev.code, ev.reason || "disconnected");
        this.scheduleReconnect(false);
      }
    };
  }

  private handleDispatch(t: string | null, d: unknown): void {
    if (t === "READY") {
      const data = d as { session_id: string };
      this.sessionId = data.session_id;
      this.reconnectAttempts = 0;
      this.pushPresence();
      this.startPresenceRefresh();
      this.handlers.onReady?.();
      return;
    }
    if (t === "GUILD_CREATE") {
      const guild = d as { id: string; voice_states?: GatewayVoiceState[] };
      if (guild?.id && Array.isArray(guild.voice_states)) {
        this.handlers.onGuildVoiceStates?.(guild.id, guild.voice_states);
      }
      return;
    }
    if (t === "VOICE_STATE_UPDATE") {
      this.handlers.onVoiceStateUpdate?.(d as GatewayVoiceState);
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearHeartbeat();
    this.clearPresenceRefresh();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close(1000, "client disconnect");
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
  }

  updatePresence(presence: PresencePayload): void {
    this.lastPresence = {
      status: presence.status || "online",
      activities: presence.activities ?? [],
      afk: presence.afk ?? false,
    };
    if (!this.connected) {
      this.connect();
      return;
    }
    this.pushPresence();
  }

  updateVoiceState(guildId: string, channelId: string | null, selfMute = false, selfDeaf = false): void {
    if (!this.connected) {
      this.connect();
      const trySend = () => {
        if (this.connected) {
          this.send(4, {
            guild_id: guildId,
            channel_id: channelId,
            self_mute: selfMute,
            self_deaf: selfDeaf,
          });
        } else {
          setTimeout(trySend, 400);
        }
      };
      setTimeout(trySend, 500);
      return;
    }
    this.send(4, {
      guild_id: guildId,
      channel_id: channelId,
      self_mute: selfMute,
      self_deaf: selfDeaf,
    });
  }

  private pushPresence(): void {
    const presence = this.lastPresence ?? DEFAULT_PRESENCE;
    this.send(3, {
      since: presence.status === "idle" ? Date.now() : null,
      activities: (presence.activities ?? []).map((a) => ({
        name: a.name,
        type: a.type,
        url: a.url,
        state: a.state,
      })),
      status: presence.status || "online",
      afk: presence.afk ?? false,
    });
  }

  private identify(): void {
    const presence = this.lastPresence ?? DEFAULT_PRESENCE;
    this.send(2, {
      token: this.token,
      intents: INTENTS,
      properties: {
        os: "linux",
        browser: "botdeck",
        device: "botdeck",
      },
      presence: {
        since: presence.status === "idle" ? Date.now() : null,
        activities: presence.activities ?? [],
        status: presence.status || "online",
        afk: presence.afk ?? false,
      },
    });
  }

  private send(op: number, d: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ op, d }));
  }

  private startHeartbeat(interval: number): void {
    this.clearHeartbeat();
    const delay = interval * Math.random();
    setTimeout(() => {
      this.beat();
      this.heartbeatTimer = setInterval(() => this.beat(), interval);
    }, delay);
  }

  private beat(): void {
    this.send(1, this.sequence);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private startPresenceRefresh(): void {
    this.clearPresenceRefresh();
    this.presenceTimer = setInterval(() => {
      if (this.connected) this.pushPresence();
    }, 5 * 60_000);
  }

  private clearPresenceRefresh(): void {
    if (this.presenceTimer) {
      clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }
  }

  private scheduleReconnect(resetSession: boolean): void {
    if (this.intentionalClose) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (resetSession) {
      this.sessionId = null;
      this.sequence = null;
    }
    const attempt = this.reconnectAttempts++;
    const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempt, 5));
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.intentionalClose) this.connect();
    }, delay);
  }
}

let singleton: DiscordGateway | null = null;

export function getGateway(): DiscordGateway | null {
  return singleton;
}

export function ensureGateway(token: string, handlers?: GatewayHandlers): DiscordGateway {
  if (singleton && singleton.connected) return singleton;
  singleton?.disconnect();
  singleton = new DiscordGateway(token, handlers ?? {});
  singleton.updatePresence({
    status: "online",
    activities: [{ name: "Managed by BotDeck", type: 0 }],
    afk: false,
  });
  return singleton;
}

export function destroyGateway(): void {
  singleton?.disconnect();
  singleton = null;
}
