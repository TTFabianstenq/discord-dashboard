//#region node_modules/.nitro/vite/services/ssr/assets/discord.server-en5CJ6ZB.js
var API = "https://discord.com/api/v10";
var DiscordApiError = class extends Error {
	status;
	code;
	retryAfter;
	constructor(message, status, code, retryAfter) {
		super(message);
		this.name = "DiscordApiError";
		this.status = status;
		this.code = code;
		this.retryAfter = retryAfter;
	}
};
function assertSafePath(path) {
	if (!path.startsWith("/") || path.includes("..") || path.includes("://") || path.includes("\\")) throw new Error("Invalid Discord path");
	if (path.length > 700) throw new Error("Invalid Discord path");
}
async function discordFetch(input) {
	const token = input.token.trim();
	if (token.length < 20) throw new DiscordApiError("That token looks too short.", 400);
	assertSafePath(input.path);
	const method = input.method.toUpperCase();
	const url = `${API}${input.path}`;
	const headers = {
		Authorization: `Bot ${token}`,
		"User-Agent": "RelayBotConsole/1.0 (https://grok.x.ai, 1.0)"
	};
	if (input.body !== void 0 && input.body !== null) headers["Content-Type"] = "application/json";
	const res = await fetch(url, {
		method,
		headers,
		body: input.body !== void 0 && input.body !== null ? JSON.stringify(input.body) : void 0
	});
	if (res.status === 204) return null;
	const text = await res.text();
	let json = null;
	if (text) try {
		json = JSON.parse(text);
	} catch {
		json = { message: text };
	}
	if (!res.ok) {
		const payload = json ?? {};
		const retryAfter = typeof payload.retry_after === "number" ? payload.retry_after : Number(res.headers.get("retry-after") ?? 0) || void 0;
		throw new DiscordApiError(res.status === 401 ? "Discord rejected this token. Check that you copied a bot token, not a user token." : res.status === 403 ? payload.message || "The bot is missing permission for this action." : res.status === 429 ? `Discord rate-limited this request. Retry in ${Math.ceil(retryAfter ?? 1)}s.` : payload.message || `Discord error ${res.status}`, res.status, payload.code, retryAfter);
	}
	return json;
}
//#endregion
export { discordFetch };
