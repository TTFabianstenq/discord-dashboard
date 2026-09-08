const API = "https://discord.com/api/v10";

export class DiscordApiError extends Error {
  status: number;
  code?: number;
  retryAfter?: number;

  constructor(message: string, status: number, code?: number, retryAfter?: number) {
    super(message);
    this.name = "DiscordApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

function assertSafePath(path: string) {
  if (!path.startsWith("/") || path.includes("..") || path.includes("://") || path.includes("\\")) {
    throw new Error("Invalid Discord path");
  }
  if (path.length > 700) throw new Error("Invalid Discord path");
}

export async function discordFetch(input: {
  token: string;
  method: string;
  path: string;
  body?: unknown;
}): Promise<unknown> {
  const token = input.token.trim();
  if (token.length < 20) throw new DiscordApiError("That token looks too short.", 400);

  assertSafePath(input.path);
  const method = input.method.toUpperCase();
  const url = `${API}${input.path}`;

  const headers: Record<string, string> = {
    Authorization: `Bot ${token}`,
    "User-Agent": "RelayBotConsole/1.0 (https://grok.x.ai, 1.0)",
  };
  if (input.body !== undefined && input.body !== null) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: input.body !== undefined && input.body !== null ? JSON.stringify(input.body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = { message: text };
    }
  }

  if (!res.ok) {
    const payload = (json ?? {}) as {
      message?: string;
      code?: number;
      retry_after?: number;
    };
    const retryAfter =
      typeof payload.retry_after === "number"
        ? payload.retry_after
        : Number(res.headers.get("retry-after") ?? 0) || undefined;
    const message =
      res.status === 401
        ? "Discord rejected this token. Check that you copied a bot token, not a user token."
        : res.status === 403
          ? payload.message || "The bot is missing permission for this action."
          : res.status === 429
            ? `Discord rate-limited this request. Retry in ${Math.ceil(retryAfter ?? 1)}s.`
            : payload.message || `Discord error ${res.status}`;
    throw new DiscordApiError(message, res.status, payload.code, retryAfter);
  }

  return json;
}
