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

export type DiscordUploadFile = {
  filename: string;
  contentType: string;
  /** raw base64 (no data: prefix) */
  dataBase64: string;
};

function assertSafePath(path: string) {
  if (!path.startsWith("/") || path.includes("..") || path.includes("://") || path.includes("\\")) {
    throw new Error("Invalid Discord path");
  }
  if (path.length > 700) throw new Error("Invalid Discord path");
}

function parseErrorMessage(res: Response, json: unknown, retryAfter?: number): string {
  const payload = (json ?? {}) as { message?: string; code?: number };
  if (res.status === 401) {
    return "Discord rejected this token. Check that you copied a bot token, not a user token.";
  }
  if (res.status === 403) return payload.message || "The bot is missing permission for this action.";
  if (res.status === 429) return `Discord rate-limited this request. Retry in ${Math.ceil(retryAfter ?? 1)}s.`;
  return payload.message || `Discord error ${res.status}`;
}

export async function discordFetch(input: {
  token: string;
  method: string;
  path: string;
  body?: unknown;
  files?: DiscordUploadFile[];
}): Promise<unknown> {
  const token = input.token.trim();
  if (token.length < 20) throw new DiscordApiError("That token looks too short.", 400);

  assertSafePath(input.path);
  const method = input.method.toUpperCase();
  const url = `${API}${input.path}`;

  const headers: Record<string, string> = {
    Authorization: `Bot ${token}`,
    "User-Agent": "BotDeck/1.0 (https://github.com/TTFabianstenq/discord-dashboard)",
  };

  let body: BodyInit | undefined;

  if (input.files && input.files.length > 0) {
    // Discord multipart: files[n] + payload_json
    const form = new FormData();
    const payload =
      input.body && typeof input.body === "object"
        ? { ...(input.body as Record<string, unknown>) }
        : {};

    // attachments metadata required when uploading files
    const attachments = input.files.map((f, i) => ({
      id: i,
      filename: f.filename,
    }));
    payload.attachments = attachments;

    form.append("payload_json", JSON.stringify(payload));

    for (let i = 0; i < input.files.length; i++) {
      const f = input.files[i];
      const bin = Buffer.from(f.dataBase64, "base64");
      if (bin.byteLength > 8 * 1024 * 1024) {
        throw new DiscordApiError("Each file must be under 8MB.", 400);
      }
      const blob = new Blob([bin], { type: f.contentType || "application/octet-stream" });
      form.append(`files[${i}]`, blob, f.filename);
    }

    body = form;
    // Content-Type set automatically with boundary — do not set manually
  } else if (input.body !== undefined && input.body !== null) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(input.body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
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
    const payload = (json ?? {}) as { retry_after?: number; code?: number };
    const retryAfter =
      typeof payload.retry_after === "number"
        ? payload.retry_after
        : Number(res.headers.get("retry-after") ?? 0) || undefined;
    throw new DiscordApiError(parseErrorMessage(res, json, retryAfter), res.status, payload.code, retryAfter);
  }

  return json;
}
