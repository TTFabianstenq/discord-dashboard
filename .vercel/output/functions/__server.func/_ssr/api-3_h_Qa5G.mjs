import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as object, n as any, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-3_h_Qa5G.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var discordRequest_createServerFn_handler = createServerRpc({
	id: "650857b983da88e4bb7c70c785e32dbb29ea4ff05818a33ce8be5b35e0e4696f",
	name: "discordRequest",
	filename: "src/lib/discord/api.ts"
}, (opts) => discordRequest.__executeServer(opts));
var discordRequest = createServerFn({ method: "POST" }).validator(RequestSchema).handler(discordRequest_createServerFn_handler, async ({ data }) => {
	const { discordFetch } = await import("./discord.server-en5CJ6ZB.mjs");
	return await discordFetch(data);
});
//#endregion
export { discordRequest_createServerFn_handler };
