import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FileSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  dataBase64: z.string().min(1).max(12_000_000),
});

const RequestSchema = z.object({
  token: z.string().min(20).max(200),
  method: z.enum(["GET", "POST", "PATCH", "PUT", "DELETE"]),
  path: z.string().min(1).max(700),
  body: z.any().optional(),
  files: z.array(FileSchema).max(10).optional(),
});

export type DiscordJson =
  | null
  | string
  | number
  | boolean
  | DiscordJson[]
  | { [key: string]: DiscordJson };

export const discordRequest = createServerFn({ method: "POST" })
  .validator(RequestSchema)
  .handler(async ({ data }): Promise<DiscordJson> => {
    const { discordFetch } = await import("./discord.server");
    return (await discordFetch(data)) as DiscordJson;
  });
