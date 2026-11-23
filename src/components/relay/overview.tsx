import { Hash, MessagesSquare, Server, Users } from "lucide-react";
import { guildIconUrl, userAvatarUrl } from "@/lib/discord/cdn";
import { hasPerm } from "@/lib/discord/permissions";
import { useRelay } from "@/lib/discord/store";
import { EntityAvatar } from "./entity-avatar";

export function Overview() {
  const bot = useRelay((s) => s.bot);
  const application = useRelay((s) => s.application);
  const guilds = useRelay((s) => s.guilds);
  const mode = useRelay((s) => s.mode);
  const setView = useRelay((s) => s.setView);
  const openGuild = useRelay((s) => s.openGuild);

  if (!bot) return null;

  const members = guilds.reduce((n, g) => n + (g.approximate_member_count ?? 0), 0);
  const managed = guilds.filter((g) => hasPerm(g.permissions, 1n << 4n)).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <EntityAvatar name={bot.username} id={bot.id} src={userAvatarUrl(bot, 256)} size="xl" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
              {mode === "demo" ? "Sample session" : "Live bot"}
            </p>
            <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">{bot.username}</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{bot.id}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setView({ t: "bot" })}
          className="h-11 rounded-md border border-border px-4 text-sm hover:bg-secondary"
        >
          Edit bot
        </button>
      </div>

      {application?.description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{application.description}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Server} label="Servers" value={guilds.length} />
        <Stat icon={Users} label="Members" value={members} />
        <Stat icon={Hash} label="Can manage" value={managed} />
        <Stat icon={MessagesSquare} label="Public" value={application?.bot_public ? "Yes" : "—"} />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Servers</h2>
          <p className="text-xs text-muted-foreground">Select one to chat, edit channels, or change settings</p>
        </div>
        {guilds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
            <p className="font-serif text-lg">No servers yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Invite this bot from the Bot tab, then reconnect.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {guilds.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => openGuild(g.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-stone/40"
                >
                  <EntityAvatar
                    name={g.name}
                    id={g.id}
                    src={guildIconUrl(g)}
                    size="lg"
                    rounded="lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{g.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {(g.approximate_member_count ?? 0).toLocaleString()} members
                      {hasPerm(g.permissions, 8n)
                        ? " · administrator"
                        : hasPerm(g.permissions, 1n << 4n)
                          ? " · manage channels"
                          : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Server;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <Icon className="size-4 text-stone" />
      <p className="mt-3 font-serif text-2xl tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
