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
      <div className="relative animate-fade-up overflow-hidden rounded-3xl border border-white/10 p-6 shadow-soft sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 120% at 100% 0%, color-mix(in oklab, #7c6cff 28%, transparent), transparent 60%), radial-gradient(ellipse 60% 90% at 0% 100%, color-mix(in oklab, #22d3ee 10%, transparent), transparent 60%), var(--color-card)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="rounded-full p-[3px] [background:linear-gradient(135deg,#a99dff,#7c6cff,#22d3ee)]">
                <div className="rounded-full bg-card p-[2px]">
                  <EntityAvatar name={bot.username} id={bot.id} src={userAvatarUrl(bot, 256)} size="xl" />
                </div>
              </div>
              <span className="absolute bottom-1 right-1 size-4 rounded-full border-[3px] border-card bg-success" />
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                {mode === "demo" ? "Sample session" : "Live bot"}
              </p>
              <h1 className="mt-2 truncate font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">{bot.username}</h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{bot.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setView({ t: "bot" })}
            className="h-11 shrink-0 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium backdrop-blur transition-colors hover:bg-white/10"
          >
            Edit bot
          </button>
        </div>
      </div>

      {application?.description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{application.description}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Server} label="Servers" value={guilds.length} tint="#7c6cff" />
        <Stat icon={Users} label="Members" value={members.toLocaleString()} tint="#22d3ee" />
        <Stat icon={Hash} label="Can manage" value={managed} tint="#34d399" />
        <Stat icon={MessagesSquare} label="Public bot" value={application?.bot_public ? "Yes" : "No"} tint="#f472b6" />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-bold">Servers</h2>
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
                  className="card-hover group flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
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
                  <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">→</span>
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
  tint,
}: {
  icon: typeof Server;
  label: string;
  value: number | string;
  tint: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-4 py-4">
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full blur-2xl"
        style={{ background: `color-mix(in oklab, ${tint} 22%, transparent)` }}
      />
      <span
        className="grid size-9 place-items-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${tint} 16%, transparent)`, color: tint }}
      >
        <Icon className="size-4" />
      </span>
      <p className="mt-3 font-serif text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
