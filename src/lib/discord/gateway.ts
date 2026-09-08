/**
 * Minimal Discord Gateway client for the browser.
 * Used only while the Relay tab is open: presence (op 3) and voice state (op 4).
 * Heartbeats keep the session alive; closing the tab disconnects the bot from gateway.
 */

export type PresenceStatus = "online" | "idle" | "dnd" | "invisible";

export type PresencePayload = {
  status: PresenceStatus;
  activities?: {
    name: string;
    type: number; // 0 Playing, 1 Streaming, 2 Listening, 3 Watching, 5 Competing
    url?: string;
  }[];
  afk?: boolean;
};

type GatewayHandlers = {
  onReady?: () => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (message: string) => void;
};

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const INTENTS = 0; // presence/voice state for *this* bot do not need privileged intents

export class DiscordGateway {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private sequence: number | null = null;
  private sessionId: string | null = null;
  private token: string;
  private handlers: GatewayHandlers;
  private lastPresence: PresencePayload | null = null;
  private intentionalClose = false;

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
            // Hello
            const d = packet.d as { heartbeat_interval: number };
            this.startHeartbeat(d.heartbeat_interval);
            this.identify();
            break;
          }
          case 11:
            // Heartbeat ACK
            break;
          case 0:
            if (packet.t === "READY") {
              const d = packet.d as { session_id: string };
              this.sessionId = d.session_id;
              if (this.lastPresence) this.updatePresence(this.lastPresence);
              this.handlers.onReady?.();
            }
            break;
          case 9:
            // Invalid session
            this.handlers.onError?.("Gateway session invalid. Reconnect from the dashboard.");
            this.disconnect();
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
      this.ws = null;
      if (!this.intentionalClose) {
        this.handlers.onClose?.(ev.code, ev.reason || "disconnected");
      }
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearHeartbeat();
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
    this.lastPresence = presence;
    if (!this.connected) {
      this.connect();
      return;
    }
    this.send(3, {
      since: presence.status === "idle" ? Date.now() : null,
      activities: presence.activities ?? [],
      status: presence.status,
      afk: presence.afk ?? false,
    });
  }

  /** Join, move, or leave a voice channel (channelId null = leave). */
  updateVoiceState(guildId: string, channelId: string | null, selfMute = false, selfDeaf = false): void {
    if (!this.connected) {
      this.connect();
      // Queue: send after READY — simple retry
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

  private identify(): void {
    this.send(2, {
      token: this.token,
      intents: INTENTS,
      properties: {
        os: "linux",
        browser: "relay",
        device: "relay",
      },
      presence: this.lastPresence
        ? {
            since: this.lastPresence.status === "idle" ? Date.now() : null,
            activities: this.lastPresence.activities ?? [],
            status: this.lastPresence.status,
            afk: this.lastPresence.afk ?? false,
          }
        : {
            since: null,
            activities: [],
            status: "online",
            afk: false,
          },
    });
  }

  private send(op: number, d: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ op, d }));
  }

  private startHeartbeat(interval: number): void {
    this.clearHeartbeat();
    // Jitter: first beat after interval * random
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
}

let singleton: DiscordGateway | null = null;

export function getGateway(): DiscordGateway | null {
  return singleton;
}

export function ensureGateway(token: string, handlers?: GatewayHandlers): DiscordGateway {
  if (singleton && singleton.connected) return singleton;
  singleton?.disconnect();
  singleton = new DiscordGateway(token, handlers);
  singleton.connect();
  return singleton;
}

export function destroyGateway(): void {
  singleton?.disconnect();
  singleton = null;
}
