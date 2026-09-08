import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, k as Slot, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as object, n as any, o as string, t as _enum } from "../_libs/zod.mjs";
import { C as Copy, S as Ellipsis, T as Check, _ as KeyRound, a as Trash2, b as Eye, c as Server, d as Pencil, f as MessagesSquare, g as LayoutGrid, h as LogOut, l as Send, m as Megaphone, n as Volume2, o as Shield, p as Menu, r as Users, s as Settings2, t as X, u as Plus, v as Hash, w as ChevronDown, x as EyeOff, y as Folder } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Trigger, i as Root2$1, n as Item2, r as Portal2$1, t as Content2$1 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as format, n as isToday, r as formatDistanceToNow, t as isYesterday } from "../_libs/date-fns.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C_0FVnZd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,opacity,transform,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline: "border border-border bg-transparent hover:bg-secondary",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-secondary",
			link: "text-stone underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-lg px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var Sheet = Dialog$1;
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function SheetContent({ className, children, side = "left", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed z-50 flex flex-col bg-card shadow-soft transition data-[state=open]:animate-in data-[state=closed]:animate-out", side === "left" && "inset-y-0 left-0 h-full w-[min(20rem,88vw)] border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left", side === "right" && "inset-y-0 right-0 h-full w-[min(20rem,88vw)] border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right", side === "bottom" && "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute right-3 top-3 rounded-sm p-1 text-muted-foreground hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function userAvatarUrl(user, size = 128) {
	if (!user.avatar) return null;
	if (user.avatar.startsWith("data:") || user.avatar.startsWith("http")) return user.avatar;
	const ext = user.avatar.startsWith("a_") ? "gif" : "png";
	return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
}
function guildIconUrl(guild, size = 128) {
	if (!guild.icon) return null;
	if (guild.icon.startsWith("data:") || guild.icon.startsWith("http")) return guild.icon;
	const ext = guild.icon.startsWith("a_") ? "gif" : "png";
	return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=${size}`;
}
function initialsOf(name) {
	const parts = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}
function hueFromId(id) {
	let h = 0;
	for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) >>> 0;
	return h % 360;
}
var CHANNEL_TYPES = {
	GUILD_TEXT: 0,
	DM: 1,
	GUILD_VOICE: 2,
	GROUP_DM: 3,
	GUILD_CATEGORY: 4,
	GUILD_ANNOUNCEMENT: 5,
	GUILD_STAGE_VOICE: 13,
	GUILD_FORUM: 15,
	GUILD_MEDIA: 16
};
function formatStamp(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	if (isToday(d)) return format(d, "HH:mm");
	if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`;
	return format(d, "d MMM HH:mm");
}
function formatRelative(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return formatDistanceToNow(d, { addSuffix: true });
}
function channelKindLabel(type) {
	switch (type) {
		case CHANNEL_TYPES.GUILD_TEXT: return "Text";
		case CHANNEL_TYPES.GUILD_VOICE: return "Voice";
		case CHANNEL_TYPES.GUILD_CATEGORY: return "Category";
		case CHANNEL_TYPES.GUILD_ANNOUNCEMENT: return "Announcement";
		case CHANNEL_TYPES.GUILD_STAGE_VOICE: return "Stage";
		case CHANNEL_TYPES.GUILD_FORUM: return "Forum";
		default: return "Channel";
	}
}
function isTextLike(type) {
	return type === CHANNEL_TYPES.GUILD_TEXT || type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT || type === CHANNEL_TYPES.GUILD_FORUM;
}
function hexToInt(hex) {
	const clean = hex.replace("#", "").trim();
	const n = Number.parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
	return Number.isFinite(n) ? n : 13221808;
}
async function fileToDataUri(file) {
	if (file.size > 2e6) throw new Error("Keep images under 2 MB.");
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that file."));
		reader.readAsDataURL(file);
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var RequestSchema = object({
	token: string().min(20).max(200),
	method: _enum([
		"GET",
		"POST",
		"PATCH",
		"PUT",
		"DELETE"
	]),
	path: string().min(1).max(700),
	body: any().optional()
});
var discordRequest = createServerFn({ method: "POST" }).validator(RequestSchema).handler(createSsrRpc("650857b983da88e4bb7c70c785e32dbb29ea4ff05818a33ce8be5b35e0e4696f"));
var BOT_ID = "128490120938475521";
var demoBot = {
	id: BOT_ID,
	username: "Relay",
	discriminator: "0",
	global_name: "Relay",
	avatar: null,
	bot: true
};
var demoApplication = {
	id: BOT_ID,
	name: "Relay",
	icon: null,
	description: "A calm console for operating Discord bots — messages, channels, and server tools in one place.",
	bot_public: true,
	approximate_guild_count: 3,
	tags: ["moderation", "utility"]
};
function ago(minutes) {
	return (/* @__PURE__ */ new Date(Date.now() - minutes * 6e4)).toISOString();
}
function user(id, username, bot = false) {
	return {
		id,
		username,
		discriminator: "0",
		global_name: username,
		avatar: null,
		bot
	};
}
var U = {
	mara: user("301", "mara"),
	jules: user("302", "jules"),
	kenji: user("303", "kenji"),
	ada: user("304", "ada"),
	rio: user("305", "rio"),
	nova: user("306", "nova"),
	theo: user("307", "theo"),
	iris: user("308", "iris")
};
var NW = "210000000000000001";
var HP = "210000000000000002";
var SR = "210000000000000003";
var demoGuilds = [
	{
		id: NW,
		name: "Northwind Labs",
		icon: null,
		owner: false,
		permissions: "8",
		approximate_member_count: 1284,
		approximate_presence_count: 186,
		description: "A working studio for product, design, and infra."
	},
	{
		id: HP,
		name: "Hollow Park",
		icon: null,
		owner: false,
		permissions: String(1n << 4n | 1n << 10n | 1n << 11n | 1n << 13n | 1n << 14n | 1n << 16n),
		approximate_member_count: 412,
		approximate_presence_count: 67,
		description: "Evening raids, voice nights, and quiet off-topic."
	},
	{
		id: SR,
		name: "Signal Room",
		icon: null,
		owner: true,
		permissions: "8",
		approximate_member_count: 38,
		approximate_presence_count: 9,
		description: "Private ops channel for the bot itself."
	}
];
var demoRoles = {
	[NW]: [
		{
			id: NW,
			name: "@everyone",
			color: 0,
			position: 0,
			permissions: "0",
			managed: false,
			mentionable: false,
			hoist: false
		},
		{
			id: "r-core",
			name: "Core",
			color: 12035469,
			position: 5,
			permissions: "8",
			managed: false,
			mentionable: true,
			hoist: true
		},
		{
			id: "r-eng",
			name: "Engineering",
			color: 8227737,
			position: 4,
			permissions: "0",
			managed: false,
			mentionable: true,
			hoist: true
		},
		{
			id: "r-bot",
			name: "Bots",
			color: 7311218,
			position: 3,
			permissions: "0",
			managed: true,
			mentionable: false,
			hoist: true
		}
	],
	[HP]: [
		{
			id: HP,
			name: "@everyone",
			color: 0,
			position: 0,
			permissions: "0",
			managed: false,
			mentionable: false,
			hoist: false
		},
		{
			id: "r-raid",
			name: "Raid lead",
			color: 12868682,
			position: 3,
			permissions: "0",
			managed: false,
			mentionable: true,
			hoist: true
		},
		{
			id: "r-member",
			name: "Member",
			color: 9079953,
			position: 1,
			permissions: "0",
			managed: false,
			mentionable: false,
			hoist: false
		}
	],
	[SR]: [{
		id: SR,
		name: "@everyone",
		color: 0,
		position: 0,
		permissions: "0",
		managed: false,
		mentionable: false,
		hoist: false
	}, {
		id: "r-ops",
		name: "Ops",
		color: 13221808,
		position: 2,
		permissions: "8",
		managed: false,
		mentionable: true,
		hoist: true
	}]
};
var demoMembers = {
	[NW]: [
		{
			user: demoBot,
			nick: null,
			roles: ["r-bot"],
			joined_at: ago(57600)
		},
		{
			user: U.mara,
			nick: null,
			roles: ["r-core"],
			joined_at: ago(288e3)
		},
		{
			user: U.jules,
			nick: "jules.design",
			roles: ["r-core"],
			joined_at: ago(259200)
		},
		{
			user: U.kenji,
			nick: null,
			roles: ["r-eng"],
			joined_at: ago(129600)
		},
		{
			user: U.ada,
			nick: null,
			roles: ["r-eng"],
			joined_at: ago(100800)
		},
		{
			user: U.rio,
			nick: null,
			roles: [],
			joined_at: ago(17280)
		}
	],
	[HP]: [
		{
			user: demoBot,
			nick: "park-bot",
			roles: [],
			joined_at: ago(28800)
		},
		{
			user: U.nova,
			nick: null,
			roles: ["r-raid"],
			joined_at: ago(158400)
		},
		{
			user: U.theo,
			nick: "Theo",
			roles: ["r-member"],
			joined_at: ago(57600)
		},
		{
			user: U.iris,
			nick: null,
			roles: ["r-member"],
			joined_at: ago(12960)
		}
	],
	[SR]: [{
		user: demoBot,
		nick: null,
		roles: ["r-ops"],
		joined_at: ago(5760)
	}, {
		user: U.mara,
		nick: null,
		roles: ["r-ops"],
		joined_at: ago(5760)
	}]
};
function ch(id, guild_id, name, type, extra = {}) {
	return {
		id,
		guild_id,
		name,
		type,
		position: 0,
		nsfw: false,
		...extra
	};
}
var demoChannels = {
	[NW]: [
		ch("c-nw-info", NW, "Information", 4, { position: 0 }),
		ch("c-nw-welcome", NW, "welcome", 0, {
			position: 1,
			parent_id: "c-nw-info",
			topic: "Start here. Read the house rules, then say hello in #studio."
		}),
		ch("c-nw-announce", NW, "announcements", 5, {
			position: 2,
			parent_id: "c-nw-info",
			topic: "Ship notes and quiet broadcasts."
		}),
		ch("c-nw-work", NW, "Work", 4, { position: 3 }),
		ch("c-nw-studio", NW, "studio", 0, {
			position: 4,
			parent_id: "c-nw-work",
			topic: "Day-to-day product talk."
		}),
		ch("c-nw-eng", NW, "engineering", 0, {
			position: 5,
			parent_id: "c-nw-work",
			topic: "Infra, reviews, incidents."
		}),
		ch("c-nw-design", NW, "design", 0, {
			position: 6,
			parent_id: "c-nw-work",
			topic: "Critique and files."
		}),
		ch("c-nw-voice", NW, "Voice", 4, { position: 7 }),
		ch("c-nw-lounge", NW, "Lounge", 2, {
			position: 8,
			parent_id: "c-nw-voice",
			bitrate: 64e3,
			user_limit: 0
		}),
		ch("c-nw-focus", NW, "Focus", 2, {
			position: 9,
			parent_id: "c-nw-voice",
			bitrate: 96e3,
			user_limit: 4
		})
	],
	[HP]: [
		ch("c-hp-town", HP, "Town", 4, { position: 0 }),
		ch("c-hp-general", HP, "general", 0, {
			position: 1,
			parent_id: "c-hp-town",
			topic: "Anything goes, keep it kind."
		}),
		ch("c-hp-lfg", HP, "looking-for-group", 0, {
			position: 2,
			parent_id: "c-hp-town",
			topic: "Post roles and start times."
		}),
		ch("c-hp-voice", HP, "Voice", 4, { position: 3 }),
		ch("c-hp-raid", HP, "Raid night", 2, {
			position: 4,
			parent_id: "c-hp-voice",
			bitrate: 128e3,
			user_limit: 12
		}),
		ch("c-hp-stage", HP, "Town hall", 13, {
			position: 5,
			parent_id: "c-hp-voice"
		})
	],
	[SR]: [ch("c-sr-ops", SR, "ops", 0, {
		position: 0,
		topic: "Internal bot operations."
	}), ch("c-sr-logs", SR, "logs", 0, {
		position: 1,
		topic: "Quiet log stream."
	})]
};
function msg(id, channel_id, author, content, minutesAgo, extra = {}) {
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
		...extra
	};
}
var demoMessages = {
	"c-nw-studio": [
		msg("m1", "c-nw-studio", U.mara, "Shipping the dashboard copy this afternoon. Anyone blocking on the empty states?", 210),
		msg("m2", "c-nw-studio", U.jules, "I can take the empty states. Keeping them quiet — no illustration, just a line of type and one action.", 188),
		msg("m3", "c-nw-studio", U.kenji, "API proxy is live. Tokens stay in the session, never hit the database.", 140),
		msg("m4", "c-nw-studio", demoBot, "Reminder: staging goes dark at 18:00 UTC for the cutover.", 95, { embeds: [{
			title: "Staging window",
			description: "The staging bot will be unreachable for twenty minutes while we rotate tokens.",
			color: 13221808,
			footer: { text: "Relay · scheduled" }
		}] }),
		msg("m5", "c-nw-studio", U.ada, "Noted. I'll freeze deploys until 18:30.", 80),
		msg("m6", "c-nw-studio", U.rio, "First day — where should I read before touching channels?", 22),
		msg("m7", "c-nw-studio", demoBot, "Start in #welcome, then this channel. Channel edits live under the Channels tab in Relay.", 18)
	],
	"c-nw-welcome": [msg("w1", "c-nw-welcome", demoBot, "Welcome to Northwind Labs. Introduce yourself in #studio when you're ready.", 4e3, { embeds: [{
		title: "House notes",
		description: "Be precise. Critique the work, not the person. Bots belong in the Bots role.",
		color: 8227737,
		fields: [{
			name: "Studio",
			value: "Product talk",
			inline: true
		}, {
			name: "Engineering",
			value: "Infra and reviews",
			inline: true
		}]
	}] }), msg("w2", "c-nw-welcome", U.rio, "Hi — Rio, joining the design rotation this month.", 30)],
	"c-nw-eng": [msg("e1", "c-nw-eng", U.kenji, "Rate limit handler maps Discord 429 onto a toast with retry_after. Looks clean.", 50), msg("e2", "c-nw-eng", U.ada, "I'll add the members intent note in bot settings so people know why the roster can be empty.", 41)],
	"c-hp-general": [
		msg("h1", "c-hp-general", U.nova, "Raid night moved to 21:00. Bring a quiet mic.", 320),
		msg("h2", "c-hp-general", U.theo, "I'll be late — start without me on trash, I'll join for boss two.", 280),
		msg("h3", "c-hp-general", demoBot, "Event pinned: Hollow Park raid, tonight 21:00 server time.", 260),
		msg("h4", "c-hp-general", U.iris, "Anyone got a spare tank for the off-night dungeon?", 12)
	],
	"c-hp-lfg": [msg("l1", "c-hp-lfg", U.iris, "Need 1 healer, 1 dps — dungeon queue in 10.", 15)],
	"c-sr-ops": [msg("o1", "c-sr-ops", U.mara, "Sample bot is wired. Anyone with a real token can connect from the same page — sessions never mix.", 120), msg("o2", "c-sr-ops", demoBot, "Health check ok. 3 guilds visible.", 5)],
	"c-sr-logs": [msg("lg1", "c-sr-logs", demoBot, "connected · sample session", 5)]
};
function cloneDemo() {
	return {
		bot: structuredClone(demoBot),
		application: structuredClone(demoApplication),
		guilds: structuredClone(demoGuilds),
		channels: structuredClone(demoChannels),
		messages: structuredClone(demoMessages),
		members: structuredClone(demoMembers),
		roles: structuredClone(demoRoles)
	};
}
var TOKEN_KEY = "relay.token";
var MODE_KEY = "relay.mode";
function persist(mode, token) {
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
async function live(token, method, path, body) {
	return await discordRequest({ data: {
		token,
		method,
		path,
		body
	} });
}
function nid() {
	return `${Date.now()}${Math.floor(Math.random() * 1e4)}`;
}
var useRelay = create((set, get) => ({
	mode: null,
	token: null,
	bot: null,
	application: null,
	guilds: [],
	channels: {},
	messages: {},
	members: {},
	roles: {},
	view: { t: "overview" },
	loading: false,
	connecting: false,
	error: null,
	demo: null,
	hydrate: () => {
		if (typeof window === "undefined") return;
		const mode = sessionStorage.getItem(MODE_KEY);
		const token = sessionStorage.getItem(TOKEN_KEY);
		if (mode === "demo") {
			get().connectDemo();
			return;
		}
		if (mode === "live" && token) get().connectLive(token);
	},
	connectLive: async (rawToken) => {
		const token = rawToken.trim();
		set({
			connecting: true,
			error: null
		});
		try {
			const bot = await live(token, "GET", "/users/@me");
			if (!bot.bot) throw new Error("This token belongs to a user account. Relay only accepts bot tokens.");
			let application = null;
			try {
				application = await live(token, "GET", "/applications/@me");
			} catch {
				try {
					application = await live(token, "GET", "/oauth2/applications/@me");
				} catch {
					application = null;
				}
			}
			const guilds = await live(token, "GET", "/users/@me/guilds?with_counts=true");
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
				demo: null,
				view: { t: "overview" },
				connecting: false,
				error: null
			});
		} catch (err) {
			persist(null, null);
			set({
				connecting: false,
				mode: null,
				token: null,
				error: err instanceof Error ? err.message : "Could not connect."
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
			demo,
			view: { t: "overview" },
			connecting: false,
			error: null
		});
	},
	disconnect: () => {
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
			demo: null,
			view: { t: "overview" },
			error: null
		});
	},
	setView: (view) => set({ view }),
	loadGuild: async (guildId) => {
		const { mode, token, channels } = get();
		if (mode === "demo") return;
		if (!token) return;
		if (channels[guildId]?.length) return;
		set({ loading: true });
		try {
			const [ch, roles] = await Promise.all([live(token, "GET", `/guilds/${guildId}/channels`), live(token, "GET", `/guilds/${guildId}/roles`).catch(() => [])]);
			let members = [];
			try {
				members = await live(token, "GET", `/guilds/${guildId}/members?limit=100`);
			} catch {
				members = [];
			}
			set((s) => ({
				channels: {
					...s.channels,
					[guildId]: Array.isArray(ch) ? ch : []
				},
				roles: {
					...s.roles,
					[guildId]: Array.isArray(roles) ? roles : []
				},
				members: {
					...s.members,
					[guildId]: Array.isArray(members) ? members : []
				},
				loading: false
			}));
		} catch (err) {
			set({
				loading: false,
				error: err instanceof Error ? err.message : "Failed to load server."
			});
			throw err;
		}
	},
	loadMessages: async (channelId) => {
		const { mode, token, messages } = get();
		if (mode === "demo") return;
		if (!token) return;
		if (messages[channelId]) return;
		set({ loading: true });
		try {
			const list = await live(token, "GET", `/channels/${channelId}/messages?limit=50`);
			const ordered = Array.isArray(list) ? [...list].reverse() : [];
			set((s) => ({
				messages: {
					...s.messages,
					[channelId]: ordered
				},
				loading: false
			}));
		} catch (err) {
			set({
				loading: false,
				error: err instanceof Error ? err.message : "Failed to load messages.",
				messages: {
					...get().messages,
					[channelId]: []
				}
			});
		}
	},
	sendMessage: async (channelId, content, embeds) => {
		const { mode, token, bot } = get();
		const body = {};
		if (content.trim()) body.content = content;
		if (embeds && embeds.length) body.embeds = embeds;
		if (!body.content && !body.embeds?.length) throw new Error("Write a message or add an embed.");
		if (mode === "demo" && bot) {
			const created = {
				id: nid(),
				channel_id: channelId,
				author: bot,
				content: body.content ?? "",
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				edited_timestamp: null,
				embeds: body.embeds ?? [],
				pinned: false,
				type: 0
			};
			set((s) => ({ messages: {
				...s.messages,
				[channelId]: [...s.messages[channelId] ?? [], created]
			} }));
			return;
		}
		if (!token) throw new Error("Not connected.");
		const created = await live(token, "POST", `/channels/${channelId}/messages`, body);
		set((s) => ({ messages: {
			...s.messages,
			[channelId]: [...s.messages[channelId] ?? [], created]
		} }));
	},
	editMessage: async (channelId, messageId, content) => {
		const { mode, token } = get();
		if (mode === "demo") {
			set((s) => ({ messages: {
				...s.messages,
				[channelId]: (s.messages[channelId] ?? []).map((m) => m.id === messageId ? {
					...m,
					content,
					edited_timestamp: (/* @__PURE__ */ new Date()).toISOString()
				} : m)
			} }));
			return;
		}
		if (!token) throw new Error("Not connected.");
		const updated = await live(token, "PATCH", `/channels/${channelId}/messages/${messageId}`, { content });
		set((s) => ({ messages: {
			...s.messages,
			[channelId]: (s.messages[channelId] ?? []).map((m) => m.id === messageId ? updated : m)
		} }));
	},
	deleteMessage: async (channelId, messageId) => {
		const { mode, token } = get();
		if (mode === "demo") {
			set((s) => ({ messages: {
				...s.messages,
				[channelId]: (s.messages[channelId] ?? []).filter((m) => m.id !== messageId)
			} }));
			return;
		}
		if (!token) throw new Error("Not connected.");
		await live(token, "DELETE", `/channels/${channelId}/messages/${messageId}`);
		set((s) => ({ messages: {
			...s.messages,
			[channelId]: (s.messages[channelId] ?? []).filter((m) => m.id !== messageId)
		} }));
	},
	createChannel: async (guildId, data) => {
		const { mode, token } = get();
		if (mode === "demo") {
			const created = {
				id: nid(),
				guild_id: guildId,
				name: data.name,
				type: data.type,
				topic: data.topic ?? null,
				nsfw: data.nsfw ?? false,
				position: (get().channels[guildId] ?? []).length,
				parent_id: data.parent_id ?? null,
				rate_limit_per_user: data.rate_limit_per_user ?? 0
			};
			set((s) => ({ channels: {
				...s.channels,
				[guildId]: [...s.channels[guildId] ?? [], created]
			} }));
			return;
		}
		if (!token) throw new Error("Not connected.");
		const created = await live(token, "POST", `/guilds/${guildId}/channels`, {
			name: data.name,
			type: data.type,
			topic: data.topic,
			parent_id: data.parent_id ?? void 0,
			nsfw: data.nsfw,
			rate_limit_per_user: data.rate_limit_per_user
		});
		set((s) => ({ channels: {
			...s.channels,
			[guildId]: [...s.channels[guildId] ?? [], created]
		} }));
	},
	editChannel: async (guildId, channelId, data) => {
		const { mode, token } = get();
		const patch = {};
		if (data.name !== void 0) patch.name = data.name;
		if (data.topic !== void 0) patch.topic = data.topic;
		if (data.nsfw !== void 0) patch.nsfw = data.nsfw;
		if (data.parent_id !== void 0) patch.parent_id = data.parent_id;
		if (data.rate_limit_per_user !== void 0) patch.rate_limit_per_user = data.rate_limit_per_user;
		if (data.position !== void 0) patch.position = data.position;
		if (data.bitrate !== void 0) patch.bitrate = data.bitrate;
		if (data.user_limit !== void 0) patch.user_limit = data.user_limit;
		if (mode === "demo") {
			set((s) => ({ channels: {
				...s.channels,
				[guildId]: (s.channels[guildId] ?? []).map((c) => c.id === channelId ? {
					...c,
					...data
				} : c)
			} }));
			return;
		}
		if (!token) throw new Error("Not connected.");
		const updated = await live(token, "PATCH", `/channels/${channelId}`, patch);
		set((s) => ({ channels: {
			...s.channels,
			[guildId]: (s.channels[guildId] ?? []).map((c) => c.id === channelId ? updated : c)
		} }));
	},
	deleteChannel: async (guildId, channelId) => {
		const { mode, token, view } = get();
		if (mode === "demo") set((s) => ({ channels: {
			...s.channels,
			[guildId]: (s.channels[guildId] ?? []).filter((c) => c.id !== channelId && c.parent_id !== channelId)
		} }));
		else {
			if (!token) throw new Error("Not connected.");
			await live(token, "DELETE", `/channels/${channelId}`);
			set((s) => ({ channels: {
				...s.channels,
				[guildId]: (s.channels[guildId] ?? []).filter((c) => c.id !== channelId)
			} }));
		}
		if (view.t === "guild" && view.channelId === channelId) set({ view: {
			...view,
			channelId: void 0
		} });
	},
	editGuild: async (guildId, data) => {
		const { mode, token } = get();
		if (mode === "demo") {
			set((s) => ({ guilds: s.guilds.map((g) => g.id === guildId ? {
				...g,
				...data
			} : g) }));
			return;
		}
		if (!token) throw new Error("Not connected.");
		const updated = await live(token, "PATCH", `/guilds/${guildId}`, data);
		set((s) => ({ guilds: s.guilds.map((g) => g.id === guildId ? {
			...g,
			...updated
		} : g) }));
	},
	editBot: async (data) => {
		const { mode, token } = get();
		if (mode === "demo") {
			set((s) => ({ bot: s.bot ? {
				...s.bot,
				...data,
				username: data.username ?? s.bot.username
			} : s.bot }));
			return;
		}
		if (!token) throw new Error("Not connected.");
		set({ bot: await live(token, "PATCH", "/users/@me", data) });
	},
	editApplication: async (data) => {
		const { mode, token, application } = get();
		if (mode === "demo") {
			set((s) => ({ application: s.application ? {
				...s.application,
				...data
			} : s.application }));
			return;
		}
		if (!token || !application) throw new Error("Application profile is not available for this bot.");
		set({ application: await live(token, "PATCH", "/applications/@me", data) });
	}
}));
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		suppressHydrationWarning: type === "password",
		className: cn("flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground/70 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		className: cn("text-sm font-medium text-foreground/90 leading-none", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
var PERMISSIONS = [
	{
		key: "view",
		bit: 1n << 10n,
		label: "View channels",
		hint: "See channels in the server"
	},
	{
		key: "send",
		bit: 1n << 11n,
		label: "Send messages",
		hint: "Post in text channels"
	},
	{
		key: "embed",
		bit: 1n << 14n,
		label: "Embed links",
		hint: "Send rich embeds"
	},
	{
		key: "attach",
		bit: 1n << 15n,
		label: "Attach files",
		hint: "Upload files and images"
	},
	{
		key: "history",
		bit: 1n << 16n,
		label: "Read history",
		hint: "Read past messages"
	},
	{
		key: "manageMessages",
		bit: 1n << 13n,
		label: "Manage messages",
		hint: "Delete and pin others' messages"
	},
	{
		key: "manageChannels",
		bit: 1n << 4n,
		label: "Manage channels",
		hint: "Create, edit, and delete channels"
	},
	{
		key: "manageNick",
		bit: 1n << 27n,
		label: "Manage nicknames",
		hint: "Change other members' nicknames"
	},
	{
		key: "moderate",
		bit: 1n << 40n,
		label: "Moderate members",
		hint: "Timeout members"
	},
	{
		key: "connect",
		bit: 1n << 20n,
		label: "Connect",
		hint: "Join voice channels"
	},
	{
		key: "speak",
		bit: 1n << 21n,
		label: "Speak",
		hint: "Talk in voice channels"
	},
	{
		key: "admin",
		bit: 8n,
		label: "Administrator",
		hint: "Every permission, including destructive ones"
	}
];
function permissionsToBits(keys) {
	return PERMISSIONS.reduce((acc, p) => keys.includes(p.key) ? acc | p.bit : acc, 0n);
}
function inviteUrl(clientId, bits) {
	return `https://discord.com/oauth2/authorize?${new URLSearchParams({
		client_id: clientId,
		permissions: bits.toString(),
		scope: "bot applications.commands"
	}).toString()}`;
}
function parsePermissionString(raw) {
	if (!raw) return 0n;
	try {
		return BigInt(raw);
	} catch {
		return 0n;
	}
}
function hasPerm(raw, bit) {
	const n = parsePermissionString(raw);
	if ((n & 8n) === 8n) return true;
	return (n & bit) === bit;
}
function EntityAvatar({ name, id, src, size = "md", rounded = "full" }) {
	const dim = size === "sm" ? "size-7 text-[10px]" : size === "lg" ? "size-12 text-sm" : size === "xl" ? "size-16 text-lg" : "size-9 text-xs";
	const radius = rounded === "lg" ? "rounded-lg" : "rounded-full";
	const hue = hueFromId(id);
	if (src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		className: cn("shrink-0 object-cover", dim, radius),
		crossOrigin: "anonymous"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex shrink-0 items-center justify-center font-medium tracking-wide text-foreground/90", dim, radius),
		style: { background: `hsl(${hue} 12% 22%)` },
		"aria-hidden": true,
		children: initialsOf(name)
	});
}
var DEFAULT_PERMS = [
	"view",
	"send",
	"embed",
	"attach",
	"history",
	"manageMessages",
	"manageChannels"
];
function BotSettings() {
	const bot = useRelay((s) => s.bot);
	const application = useRelay((s) => s.application);
	const editBot = useRelay((s) => s.editBot);
	const editApplication = useRelay((s) => s.editApplication);
	const mode = useRelay((s) => s.mode);
	const [username, setUsername] = (0, import_react.useState)(bot?.username ?? "");
	const [description, setDescription] = (0, import_react.useState)(application?.description ?? "");
	const [avatar, setAvatar] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [perms, setPerms] = (0, import_react.useState)(DEFAULT_PERMS);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setUsername(bot?.username ?? "");
		setDescription(application?.description ?? "");
		setAvatar(null);
	}, [
		bot?.id,
		bot?.username,
		application?.description
	]);
	const clientId = application?.id || bot?.id || "";
	const url = (0, import_react.useMemo)(() => clientId ? inviteUrl(clientId, permissionsToBits(perms)) : "", [clientId, perms]);
	if (!bot) return null;
	async function onSave() {
		setSaving(true);
		try {
			await editBot({
				username: username.trim(),
				...avatar ? { avatar } : {}
			});
			if (application) try {
				await editApplication({ description: description.trim() });
			} catch {}
			toast.success("Bot updated");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not update bot");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-stone",
					children: mode === "demo" ? "Sample bot" : "Live bot"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-serif text-3xl tracking-tight",
					children: "Bot profile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Username changes can take a few minutes to show in Discord. Avatars apply immediately."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
					name: username || bot.username,
					id: bot.id,
					src: avatar ?? userAvatarUrl(bot, 256),
					size: "xl"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "bot-avatar",
						className: "cursor-pointer text-sm text-stone hover:underline",
						children: "Change avatar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "bot-avatar",
						type: "file",
						accept: "image/png,image/jpeg,image/gif,image/webp",
						className: "hidden",
						onChange: async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							try {
								setAvatar(await fileToDataUri(file));
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Could not read image");
							}
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-xs text-muted-foreground",
						children: bot.id
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "bot-name",
					children: "Username"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "bot-name",
					value: username,
					onChange: (e) => setUsername(e.target.value),
					maxLength: 32
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "bot-desc",
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "bot-desc",
					value: description,
					onChange: (e) => setDescription(e.target.value),
					maxLength: 400
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => void onSave(),
				disabled: saving || !username.trim(),
				children: saving ? "Saving…" : "Save profile"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "border-t border-border pt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl tracking-tight",
						children: "Invite link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Share this with anyone who should add the bot to a server. Permissions below are encoded in the URL."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-2 sm:grid-cols-2",
						children: PERMISSIONS.map((p) => {
							const on = perms.includes(p.key);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPerms((cur) => cur.includes(p.key) ? cur.filter((k) => k !== p.key) : [...cur, p.key]),
								className: `flex h-full w-full flex-col rounded-lg border px-3 py-2.5 text-left text-sm ${on ? "border-stone/50 bg-stone/10" : "border-border hover:bg-secondary/60"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: p.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: p.hint
								})]
							}) }, p.key);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							readOnly: true,
							value: url,
							className: "font-mono text-xs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon",
							"aria-label": "Copy invite link",
							onClick: async () => {
								try {
									await navigator.clipboard.writeText(url);
									setCopied(true);
									toast.success("Invite link copied");
									setTimeout(() => setCopied(false), 1500);
								} catch {
									toast.error("Could not copy");
								}
							},
							children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
						})]
					})
				]
			})
		]
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors data-[state=checked]:bg-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-foreground shadow-sm transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-primary-foreground" })
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 shadow-soft duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute right-4 top-4 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-serif text-xl text-foreground", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
function AlertDialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
		className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function AlertDialogContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 shadow-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	})] });
}
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("font-serif text-xl", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants(), className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "outline" }), className),
		...props
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
function SelectTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
		className: cn("flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted-foreground" })
		})]
	});
}
function SelectContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
		className: cn("relative z-50 max-h-72 min-w-32 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		position: "popper",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: "p-1",
			children
		})
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
		className: cn("relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute left-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
	});
}
function ChannelIcon({ type, className }) {
	const cls = cn("size-4 shrink-0", className);
	switch (type) {
		case CHANNEL_TYPES.GUILD_VOICE: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: cls });
		case CHANNEL_TYPES.GUILD_ANNOUNCEMENT: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: cls });
		case CHANNEL_TYPES.GUILD_CATEGORY: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: cls });
		case CHANNEL_TYPES.GUILD_FORUM: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesSquare, { className: cls });
		case CHANNEL_TYPES.GUILD_STAGE_VOICE: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: cls });
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: cls });
	}
}
function sortChannels(channels) {
	return [...channels].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || (a.name ?? "").localeCompare(b.name ?? ""));
}
function ChannelTree({ channels, activeId, onSelect }) {
	const sorted = sortChannels(channels);
	const categories = sorted.filter((c) => c.type === CHANNEL_TYPES.GUILD_CATEGORY);
	const rest = sorted.filter((c) => c.type !== CHANNEL_TYPES.GUILD_CATEGORY);
	const grouped = categories.map((cat) => ({
		cat,
		children: rest.filter((c) => c.parent_id === cat.id)
	}));
	const orphans = rest.filter((c) => !c.parent_id || !categories.some((cat) => cat.id === c.parent_id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "flex flex-col gap-4",
		children: [orphans.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-0.5",
			children: orphans.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelRow, {
				channel: c,
				active: activeId === c.id,
				onSelect
			}, c.id))
		}) : null, grouped.map(({ cat, children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
			children: cat.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-0.5",
			children: children.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelRow, {
				channel: c,
				active: activeId === c.id,
				onSelect
			}, c.id))
		})] }, cat.id))]
	});
}
function ChannelRow({ channel, active, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onSelect(channel),
		className: cn("flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelIcon, {
			type: channel.type,
			className: "text-muted-foreground"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: channel.name
		})]
	}) });
}
var CREATE_TYPES = [
	{
		value: String(CHANNEL_TYPES.GUILD_TEXT),
		label: "Text"
	},
	{
		value: String(CHANNEL_TYPES.GUILD_VOICE),
		label: "Voice"
	},
	{
		value: String(CHANNEL_TYPES.GUILD_CATEGORY),
		label: "Category"
	},
	{
		value: String(CHANNEL_TYPES.GUILD_ANNOUNCEMENT),
		label: "Announcement"
	},
	{
		value: String(CHANNEL_TYPES.GUILD_STAGE_VOICE),
		label: "Stage"
	}
];
var emptyDraft = {
	name: "",
	type: CHANNEL_TYPES.GUILD_TEXT,
	topic: "",
	parent_id: "",
	nsfw: false,
	rate_limit_per_user: 0
};
function ChannelManager({ guildId }) {
	const channels = useRelay((s) => s.channels[guildId] ?? []);
	const createChannel = useRelay((s) => s.createChannel);
	const editChannel = useRelay((s) => s.editChannel);
	const deleteChannel = useRelay((s) => s.deleteChannel);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const categories = sortChannels(channels).filter((c) => c.type === CHANNEL_TYPES.GUILD_CATEGORY);
	const sorted = sortChannels(channels);
	function startCreate() {
		setEditing(null);
		setDraft(emptyDraft);
		setOpen(true);
	}
	function startEdit(ch) {
		setEditing(ch);
		setDraft({
			name: ch.name ?? "",
			type: ch.type,
			topic: ch.topic ?? "",
			parent_id: ch.parent_id ?? "",
			nsfw: ch.nsfw ?? false,
			rate_limit_per_user: ch.rate_limit_per_user ?? 0
		});
		setOpen(true);
	}
	async function save() {
		try {
			if (!draft.name.trim()) throw new Error("Name is required.");
			const payload = {
				name: (editing ? editing.type : draft.type) === CHANNEL_TYPES.GUILD_CATEGORY ? draft.name.trim() : draft.name.trim().toLowerCase().replace(/\s+/g, "-"),
				type: editing ? editing.type : draft.type,
				topic: draft.topic || null,
				parent_id: draft.parent_id || null,
				nsfw: draft.nsfw,
				rate_limit_per_user: Number(draft.rate_limit_per_user) || 0
			};
			if (editing) {
				await editChannel(guildId, editing.id, payload);
				toast.success("Channel updated");
			} else {
				await createChannel(guildId, payload);
				toast.success("Channel created");
			}
			setOpen(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save channel");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl tracking-tight",
					children: "Channels"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Create, rename, move, or delete channels in this server."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: startCreate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New channel"]
				})]
			}),
			sorted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground",
				children: "No channels loaded. If this is a live bot, it may lack View Channel permission."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "overflow-hidden rounded-xl border border-border",
				children: sorted.map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelIcon, {
							type: ch.type,
							className: "text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: ch.type === CHANNEL_TYPES.GUILD_CATEGORY ? ch.name?.toUpperCase() : ch.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									channelKindLabel(ch.type),
									ch.parent_id ? ` · ${categories.find((c) => c.id === ch.parent_id)?.name ?? "category"}` : "",
									ch.nsfw ? " · age-restricted" : "",
									ch.rate_limit_per_user ? ` · slowmode ${ch.rate_limit_per_user}s` : ""
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							onClick: () => startEdit(ch),
							"aria-label": "Edit channel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							onClick: () => setPendingDelete(ch),
							"aria-label": "Delete channel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, ch.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit channel" : "New channel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: editing ? "Changes apply immediately on the live server." : "The bot needs Manage Channels to create this." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "ch-name",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "ch-name",
									value: draft.name,
									onChange: (e) => setDraft({
										...draft,
										name: e.target.value
									}),
									placeholder: "general"
								})]
							}),
							!editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: String(draft.type),
									onValueChange: (v) => setDraft({
										...draft,
										type: Number(v)
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CREATE_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: t.value,
										children: t.label
									}, t.value)) })]
								})]
							}) : null,
							draft.type !== CHANNEL_TYPES.GUILD_CATEGORY ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: draft.parent_id || "none",
									onValueChange: (v) => setDraft({
										...draft,
										parent_id: v === "none" ? "" : v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "None" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "none",
										children: "No category"
									}), categories.filter((c) => c.id !== editing?.id).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: c.id,
										children: c.name
									}, c.id))] })]
								})]
							}) : null,
							draft.type === CHANNEL_TYPES.GUILD_TEXT || draft.type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT || editing?.type === CHANNEL_TYPES.GUILD_TEXT || editing?.type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ch-topic",
										children: "Topic"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "ch-topic",
										value: draft.topic,
										onChange: (e) => setDraft({
											...draft,
											topic: e.target.value
										}),
										className: "min-h-16"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between rounded-md border border-border px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ch-nsfw",
										children: "Age-restricted"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										id: "ch-nsfw",
										checked: draft.nsfw,
										onCheckedChange: (v) => setDraft({
											...draft,
											nsfw: v
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ch-slow",
										children: "Slowmode (seconds)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "ch-slow",
										type: "number",
										min: 0,
										max: 21600,
										value: draft.rate_limit_per_user,
										onChange: (e) => setDraft({
											...draft,
											rate_limit_per_user: Number(e.target.value)
										})
									})]
								})
							] }) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => void save(),
						children: editing ? "Save" : "Create"
					})] })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!pendingDelete,
				onOpenChange: (o) => !o && setPendingDelete(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Delete #",
					pendingDelete?.name,
					"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This cannot be undone. Messages in this channel will be gone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: async () => {
						if (!pendingDelete) return;
						try {
							await deleteChannel(guildId, pendingDelete.id);
							toast.success("Channel deleted");
						} catch (err) {
							toast.error(err instanceof Error ? err.message : "Could not delete");
						}
					},
					children: "Delete"
				})] })] })
			})
		]
	});
}
var DropdownMenu = Root2$1;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
		sideOffset,
		className: cn("z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
function DropdownMenuItem({ className, inset, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className),
		...props
	});
}
function Chat({ guildId, channelId }) {
	const channels = useRelay((s) => s.channels[guildId] ?? []);
	const loadMessages = useRelay((s) => s.loadMessages);
	const setView = useRelay((s) => s.setView);
	const textChannels = channels.filter((c) => isTextLike(c.type));
	const channel = channels.find((c) => c.id === channelId) ?? textChannels[0];
	(0, import_react.useEffect)(() => {
		if (channel && isTextLike(channel.type)) loadMessages(channel.id);
	}, [channel?.id, loadMessages]);
	if (!channel) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "No text channel",
		body: "Create a text channel in the Channels tab, then come back to chat."
	});
	if (!isTextLike(channel.type)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: channel.name ?? "Voice",
		body: "Voice and stage channels cannot carry text here. Pick a text channel, or edit this one under Channels."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelIcon, {
					type: channel.type,
					className: "text-muted-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: channel.id,
						onValueChange: (id) => setView({
							t: "guild",
							id: guildId,
							tab: "chat",
							channelId: id
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-9 w-full max-w-xs border-0 bg-transparent px-1 shadow-none focus:ring-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: textChannels.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c.id,
							children: c.name
						}, c.id)) })]
					}), channel.topic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "hidden truncate px-1 text-xs text-muted-foreground sm:block",
						children: channel.topic
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageList, { channelId: channel.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, { channelId: channel.id })
		]
	});
}
function Empty({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col items-center justify-center px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-serif text-2xl",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-sm text-sm text-muted-foreground",
			children: body
		})]
	});
}
function MessageList({ channelId }) {
	const messages = useRelay((s) => s.messages[channelId] ?? []);
	const botId = useRelay((s) => s.bot?.id);
	const bottom = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		bottom.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length, channelId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-4",
		children: [messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "No messages in this channel yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-4",
			children: messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageRow, {
				message: m,
				mine: m.author.id === botId
			}, m.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottom })]
	});
}
function MessageRow({ message, mine }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(message.content);
	const editMessage = useRelay((s) => s.editMessage);
	const deleteMessage = useRelay((s) => s.deleteMessage);
	async function save() {
		try {
			await editMessage(message.channel_id, message.id, draft);
			setEditing(false);
			toast.success("Message updated");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not edit");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "group flex gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
			name: message.author.global_name || message.author.username,
			id: message.author.id,
			src: userAvatarUrl(message.author),
			size: "md"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: message.author.global_name || message.author.username
					}),
					message.author.bot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-sm bg-stone/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-stone",
						children: "Bot"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground",
						children: formatStamp(message.timestamp)
					}),
					message.edited_timestamp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground",
						children: "(edited)"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-auto opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-sm p-1 text-muted-foreground hover:bg-secondary",
								"aria-label": "Message actions",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							children: [mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => {
									setDraft(message.content);
									setEditing(true);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								className: "text-destructive",
								onClick: async () => {
									try {
										await deleteMessage(message.channel_id, message.id);
										toast.success("Message deleted");
									} catch (err) {
										toast.error(err instanceof Error ? err.message : "Could not delete");
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
							})]
						})] })
					})
				]
			}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					className: "min-h-20"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => void save(),
						children: "Save"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setEditing(false),
						children: "Cancel"
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [message.content ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 whitespace-pre-wrap text-sm leading-relaxed",
				children: message.content
			}) : null, message.embeds.map((embed, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmbedCard, { embed }, i))] })]
		})]
	});
}
function EmbedCard({ embed }) {
	const color = embed.color ? `#${embed.color.toString(16).padStart(6, "0")}` : "var(--color-stone)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 max-w-lg overflow-hidden rounded-md border border-border bg-secondary/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-1 shrink-0",
				style: { background: color }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 px-3 py-2.5",
				children: [
					embed.author?.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: embed.author.name
					}) : null,
					embed.title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: embed.title
					}) : null,
					embed.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 whitespace-pre-wrap text-sm text-muted-foreground",
						children: embed.description
					}) : null,
					embed.fields && embed.fields.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-2 grid gap-2 sm:grid-cols-2",
						children: embed.fields.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: f.inline ? "" : "sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[11px] font-medium text-muted-foreground",
								children: f.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-sm",
								children: f.value
							})]
						}, f.name))
					}) : null,
					embed.footer?.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-muted-foreground",
						children: embed.footer.text
					}) : null
				]
			})]
		})
	});
}
function Composer({ channelId }) {
	const sendMessage = useRelay((s) => s.sendMessage);
	const [content, setContent] = (0, import_react.useState)("");
	const [embedOn, setEmbedOn] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [color, setColor] = (0, import_react.useState)("#c9bfb0");
	const [sending, setSending] = (0, import_react.useState)(false);
	const embeds = (0, import_react.useMemo)(() => {
		if (!embedOn || !title.trim() && !description.trim()) return void 0;
		return [{
			title: title.trim() || void 0,
			description: description.trim() || void 0,
			color: hexToInt(color)
		}];
	}, [
		embedOn,
		title,
		description,
		color
	]);
	async function send() {
		setSending(true);
		try {
			await sendMessage(channelId, content, embeds);
			setContent("");
			setTitle("");
			setDescription("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not send");
		} finally {
			setSending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shrink-0 border-t border-border p-3 sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card p-2 sm:p-3",
			children: [
				embedOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 grid gap-2 rounded-md bg-secondary/50 p-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "embed-title",
								children: "Embed title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "embed-title",
								value: title,
								onChange: (e) => setTitle(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "embed-body",
								children: "Embed body"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "embed-body",
								value: description,
								onChange: (e) => setDescription(e.target.value),
								className: "min-h-16"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "embed-color",
								children: "Color"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "embed-color",
								type: "color",
								value: color,
								onChange: (e) => setColor(e.target.value),
								className: "h-11 w-20 p-1"
							})]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: content,
					onChange: (e) => setContent(e.target.value),
					placeholder: "Message as the bot",
					className: "min-h-[52px] resize-none border-0 bg-transparent focus-visible:ring-0",
					onKeyDown: (e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							send();
						}
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: embedOn,
							onCheckedChange: setEmbedOn
						}), "Embed"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => void send(),
						disabled: sending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Send"]
					})]
				})
			]
		})
	});
}
function MembersPanel({ guildId }) {
	const members = useRelay((s) => s.members[guildId] ?? []);
	const roles = useRelay((s) => s.roles[guildId] ?? []);
	const mode = useRelay((s) => s.mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-serif text-2xl tracking-tight",
			children: "Members"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: members.length > 0 ? `${members.length} loaded` : mode === "live" ? "The Server Members Intent must be enabled on this bot to list people." : "No members in this sample roster."
		})] }), members.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground",
			children: "Nothing to show here yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "overflow-hidden rounded-xl border border-border",
			children: members.map((m) => {
				const u = m.user;
				if (!u) return null;
				const roleNames = m.roles.map((id) => roles.find((r) => r.id === id)?.name).filter((n) => !!n && n !== "@everyone");
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
						name: m.nick || u.username,
						id: u.id,
						src: userAvatarUrl(u)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-sm font-medium",
							children: [m.nick || u.global_name || u.username, u.bot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-[10px] uppercase tracking-wide text-stone",
								children: "Bot"
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								"@",
								u.username,
								roleNames.length ? ` · ${roleNames.join(", ")}` : "",
								m.joined_at ? ` · joined ${formatRelative(m.joined_at)}` : ""
							]
						})]
					})]
				}, u.id);
			})
		})]
	});
}
function RelayMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		fill: "none",
		className: cn("text-stone", className),
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M8 16c0-2.8 1.4-5.4 3.7-7M24 16c0 2.8-1.4 5.4-3.7 7M5 16c0-4.4 2.3-8.4 6-10.6M27 16c0 4.4-2.3 8.4-6 10.6",
			stroke: "currentColor",
			strokeWidth: "1.6",
			strokeLinecap: "round"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "16",
			cy: "16",
			r: "2.2",
			fill: "currentColor"
		})]
	});
}
function Overview() {
	const bot = useRelay((s) => s.bot);
	const application = useRelay((s) => s.application);
	const guilds = useRelay((s) => s.guilds);
	const mode = useRelay((s) => s.mode);
	const setView = useRelay((s) => s.setView);
	const loadGuild = useRelay((s) => s.loadGuild);
	if (!bot) return null;
	const members = guilds.reduce((n, g) => n + (g.approximate_member_count ?? 0), 0);
	const managed = guilds.filter((g) => hasPerm(g.permissions, 1n << 4n)).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
						name: bot.username,
						id: bot.id,
						src: userAvatarUrl(bot, 256),
						size: "xl"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-[0.16em] text-stone",
							children: mode === "demo" ? "Sample session" : "Live bot"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-serif text-3xl tracking-tight sm:text-4xl",
							children: bot.username
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xs text-muted-foreground",
							children: bot.id
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setView({ t: "bot" }),
					className: "h-11 rounded-md border border-border px-4 text-sm hover:bg-secondary",
					children: "Edit bot"
				})]
			}),
			application?.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
				children: application.description
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: Server,
						label: "Servers",
						value: guilds.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: Users,
						label: "Members",
						value: members
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: Hash,
						label: "Can manage",
						value: managed
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: MessagesSquare,
						label: "Public",
						value: application?.bot_public ? "Yes" : "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-xl",
					children: "Servers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Select one to chat, edit channels, or change settings"
				})]
			}), guilds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-dashed border-border px-5 py-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-serif text-lg",
					children: "No servers yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Invite this bot from the Bot tab, then reconnect."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-3 sm:grid-cols-2",
				children: guilds.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setView({
							t: "guild",
							id: g.id,
							tab: "chat"
						});
						loadGuild(g.id);
					},
					className: "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-stone/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
						name: g.name,
						id: g.id,
						src: guildIconUrl(g),
						size: "lg",
						rounded: "lg"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-medium",
							children: g.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-0.5 block text-xs text-muted-foreground",
							children: [
								(g.approximate_member_count ?? 0).toLocaleString(),
								" members",
								hasPerm(g.permissions, 8n) ? " · administrator" : hasPerm(g.permissions, 1n << 4n) ? " · manage channels" : ""
							]
						})]
					})]
				}) }, g.id))
			})] })
		]
	});
}
function Stat({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card px-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-stone" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-serif text-2xl tabular-nums tracking-tight",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: label
			})
		]
	});
}
function ServerSettings({ guildId }) {
	const guild = useRelay((s) => s.guilds.find((g) => g.id === guildId));
	const editGuild = useRelay((s) => s.editGuild);
	const [name, setName] = (0, import_react.useState)(guild?.name ?? "");
	const [description, setDescription] = (0, import_react.useState)(guild?.description ?? "");
	const [icon, setIcon] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setName(guild?.name ?? "");
		setDescription(guild?.description ?? "");
		setIcon(null);
	}, [
		guild?.id,
		guild?.name,
		guild?.description
	]);
	if (!guild) return null;
	async function onSave() {
		setSaving(true);
		try {
			await editGuild(guildId, {
				name: name.trim(),
				description: description.trim() || null,
				...icon ? { icon } : {}
			});
			toast.success("Server updated");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not update server");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl tracking-tight",
				children: "Server"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Rename this server, change its icon, or update the description."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
					name: name || guild.name,
					id: guild.id,
					src: icon ?? guildIconUrl(guild, 256),
					size: "xl",
					rounded: "lg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "guild-icon",
						className: "cursor-pointer text-sm text-stone hover:underline",
						children: "Change icon"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "guild-icon",
						type: "file",
						accept: "image/png,image/jpeg,image/gif,image/webp",
						className: "hidden",
						onChange: async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							try {
								setIcon(await fileToDataUri(file));
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Could not read image");
							}
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "PNG, JPG, GIF, or WebP. Under 2 MB."
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "guild-name",
					children: "Name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "guild-name",
					value: name,
					onChange: (e) => setName(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "guild-desc",
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "guild-desc",
					value: description,
					onChange: (e) => setDescription(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => void onSave(),
				disabled: saving || !name.trim(),
				children: saving ? "Saving…" : "Save server"
			})
		]
	});
}
var TABS = [
	{
		id: "chat",
		label: "Chat"
	},
	{
		id: "channels",
		label: "Channels"
	},
	{
		id: "members",
		label: "Members"
	},
	{
		id: "server",
		label: "Server"
	}
];
function Console() {
	const view = useRelay((s) => s.view);
	const setView = useRelay((s) => s.setView);
	const bot = useRelay((s) => s.bot);
	const guilds = useRelay((s) => s.guilds);
	const mode = useRelay((s) => s.mode);
	const disconnect = useRelay((s) => s.disconnect);
	const loadGuild = useRelay((s) => s.loadGuild);
	const [navOpen, setNavOpen] = (0, import_react.useState)(false);
	const guild = view.t === "guild" ? guilds.find((g) => g.id === view.id) : void 0;
	(0, import_react.useEffect)(() => {
		if (view.t !== "guild") return;
		const guildId = view.id;
		const tab = view.tab;
		const selected = view.channelId;
		loadGuild(guildId).then(() => {
			if (selected) return;
			const first = (useRelay.getState().channels[guildId] ?? []).find((c) => isTextLike(c.type));
			if (first) setView({
				t: "guild",
				id: guildId,
				tab,
				channelId: first.id
			});
		});
	}, [
		view,
		loadGuild,
		setView
	]);
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, { onNavigate: () => setNavOpen(false) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						className: "lg:hidden",
						onClick: () => setNavOpen(true),
						"aria-label": "Open menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelayMark, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-serif text-base",
							children: "Relay"
						})]
					}),
					mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden rounded-full bg-stone/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone sm:inline",
						children: "Sample"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-success sm:inline",
						children: "Live"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2",
						children: [bot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setView({ t: "bot" }),
							className: "hidden items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm hover:bg-secondary sm:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
								name: bot.username,
								id: bot.id,
								src: userAvatarUrl(bot),
								size: "sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-32 truncate",
								children: bot.username
							})]
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								disconnect();
								toast.message("Disconnected");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Disconnect"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden w-60 shrink-0 overflow-hidden border-r border-border bg-background lg:flex",
						children: nav
					}),
					view.t === "guild" && view.tab === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden w-56 shrink-0 overflow-hidden border-r border-border bg-background md:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuildRail, {
							guildId: view.id,
							channelId: view.channelId,
							tab: view.tab
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: cn("flex min-w-0 flex-1 flex-col bg-background", view.t === "guild" && view.tab === "chat" ? "min-h-0 overflow-hidden" : "scroll-thin overflow-y-auto"),
						children: [
							view.t === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {}) : null,
							view.t === "bot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BotSettings, {}) : null,
							view.t === "guild" && guild ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2 md:px-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 hidden truncate text-sm font-medium md:inline",
										children: guild.name
									}), TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setView({
											t: "guild",
											id: guild.id,
											tab: tab.id,
											channelId: view.t === "guild" ? view.channelId : void 0
										}),
										className: cn("h-8 shrink-0 rounded-md px-3 text-sm", view.tab === tab.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"),
										children: tab.label
									}, tab.id))]
								}),
								view.tab === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chat, {
									guildId: guild.id,
									channelId: view.channelId
								}) : null,
								view.tab === "channels" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelManager, { guildId: guild.id }) : null,
								view.tab === "members" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MembersPanel, { guildId: guild.id }) : null,
								view.tab === "server" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServerSettings, { guildId: guild.id }) : null
							] }) : null
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: navOpen,
				onOpenChange: setNavOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "left",
					className: "p-0",
					children: nav
				})
			})
		]
	});
}
function Sidebar({ onNavigate }) {
	const view = useRelay((s) => s.view);
	const setView = useRelay((s) => s.setView);
	const guilds = useRelay((s) => s.guilds);
	const loadGuild = useRelay((s) => s.loadGuild);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full w-full flex-col",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "scroll-thin flex-1 overflow-y-auto p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
					children: "Console"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" }),
					label: "Overview",
					active: view.t === "overview",
					onClick: () => {
						setView({ t: "overview" });
						onNavigate();
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" }),
					label: "Bot",
					active: view.t === "bot",
					onClick: () => {
						setView({ t: "bot" });
						onNavigate();
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 mt-5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
					children: "Servers"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-0.5",
					children: guilds.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setView({
								t: "guild",
								id: g.id,
								tab: "chat"
							});
							loadGuild(g.id);
							onNavigate();
						},
						className: cn("flex h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm", view.t === "guild" && view.id === g.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityAvatar, {
							name: g.name,
							id: g.id,
							src: guildIconUrl(g),
							size: "sm",
							rounded: "lg"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: g.name
						})]
					}) }, g.id))
				})
			]
		})
	});
}
function NavItem({ icon, label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("mb-0.5 flex h-10 w-full items-center gap-2 rounded-md px-2 text-sm", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"),
		children: [icon, label]
	});
}
function GuildRail({ guildId, channelId, tab }) {
	const channels = useRelay((s) => s.channels[guildId] ?? []);
	const guild = useRelay((s) => s.guilds.find((g) => g.id === guildId));
	const setView = useRelay((s) => s.setView);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-11 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-sm font-medium",
				children: guild?.name
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "scroll-thin flex-1 overflow-y-auto p-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelTree, {
				channels,
				activeId: channelId,
				onSelect: (ch) => {
					setView({
						t: "guild",
						id: guildId,
						tab: isTextLike(ch.type) ? "chat" : tab === "chat" ? "channels" : tab,
						channelId: ch.id
					});
				}
			})
		})]
	});
}
function LoginScreen() {
	const connectLive = useRelay((s) => s.connectLive);
	const connectDemo = useRelay((s) => s.connectDemo);
	const connecting = useRelay((s) => s.connecting);
	const error = useRelay((s) => s.error);
	const [token, setToken] = (0, import_react.useState)("");
	const [show, setShow] = (0, import_react.useState)(false);
	const [mask, setMask] = (0, import_react.useState)(false);
	const [guide, setGuide] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMask(true);
	}, []);
	async function onSubmit(e) {
		e.preventDefault();
		try {
			await connectLive(token);
			toast.success("Bot connected");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not connect");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-dvh overflow-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-grid opacity-70" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-80",
				style: { background: "radial-gradient(ellipse 70% 60% at 50% -10%, color-mix(in oklab, var(--color-stone) 14%, transparent), transparent 70%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex items-center justify-between px-5 py-5 sm:px-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelayMark, { className: "size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-serif text-xl tracking-tight",
						children: "Relay"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden text-xs text-muted-foreground sm:block",
					children: "Anyone with a bot token can use this."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:pt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-xs font-medium uppercase tracking-[0.18em] text-stone",
						children: "Bot console"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-[2.6rem] leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.4rem]",
						children: "A console for every Discord bot."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-md text-base leading-relaxed text-muted-foreground",
						children: "Paste a bot token to send messages, edit channels, and run the bot from the browser. Each visitor connects their own bot — sessions never mix, and tokens are not saved on a server."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2",
						children: [
							"Send and edit messages as the bot",
							"Create, rename, and delete channels",
							"Update the bot username and avatar",
							"Invite the bot with the permissions you pick"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-stone" }), item]
						}, item))
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-5 shadow-soft sm:p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit,
							className: "flex flex-col gap-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-2xl tracking-tight",
									children: "Connect a bot"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Use a bot token from the Discord Developer Portal — not a user token."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "token",
										children: "Bot token"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "token",
												autoComplete: "off",
												spellCheck: false,
												type: show || !mask ? "text" : "password",
												value: token,
												onChange: (e) => setToken(e.target.value),
												placeholder: "Paste your bot token",
												className: "h-12 pl-10 pr-11 font-mono text-sm"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setShow((v) => !v),
												className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-2 text-muted-foreground hover:text-foreground",
												"aria-label": show ? "Hide token" : "Show token",
												children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
											})
										]
									})]
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "lg",
									disabled: connecting || token.trim().length < 20,
									children: connecting ? "Connecting…" : "Open console"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "lg",
									onClick: () => {
										connectDemo();
										toast.success("Sample bot loaded");
									},
									children: "Try a sample bot"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-2 rounded-md bg-secondary/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "mt-0.5 size-3.5 shrink-0 text-stone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "The token stays in this browser tab and is sent only to Discord through Relay. Close the tab to forget it. Anyone else can open this same page and connect a different bot." })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setGuide((v) => !v),
							className: "mt-5 text-left text-xs font-medium text-stone hover:underline",
							children: guide ? "Hide token steps" : "How to get a bot token"
						}),
						guide ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Open the Discord Developer Portal and select (or create) an application." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Open the Bot tab and copy the token. Reset it if you do not have one saved." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Turn on Message Content Intent if you want the bot to read message text." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Invite the bot to a server with Manage Channels and Send Messages." })
							]
						}) : null
					]
				})]
			})
		]
	});
}
function Home() {
	const mode = useRelay((s) => s.mode);
	const hydrate = useRelay((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	return mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Console, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
}
//#endregion
export { Home as component };
