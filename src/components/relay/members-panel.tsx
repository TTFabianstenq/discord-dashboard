import { userAvatarUrl } from "@/lib/discord/cdn";
import { formatRelative } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import { EntityAvatar } from "./entity-avatar";

export function MembersPanel({ guildId }: { guildId: string }) {
  const members = useRelay((s) => s.members[guildId] ?? []);
  const roles = useRelay((s) => s.roles[guildId] ?? []);
  const mode = useRelay((s) => s.mode);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {members.length > 0
            ? `${members.length} loaded`
            : mode === "live"
              ? "The Server Members Intent must be enabled on this bot to list people."
              : "No members in this sample roster."}
        </p>
      </div>
      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          Nothing to show here yet.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {members.map((m) => {
            const u = m.user;
            if (!u) return null;
            const roleNames = m.roles
              .map((id) => roles.find((r) => r.id === id)?.name)
              .filter((n): n is string => !!n && n !== "@everyone");
            return (
              <li key={u.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
                <EntityAvatar name={m.nick || u.username} id={u.id} src={userAvatarUrl(u)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.nick || u.global_name || u.username}
                    {u.bot ? <span className="ml-2 text-[10px] uppercase tracking-wide text-stone">Bot</span> : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{u.username}
                    {roleNames.length ? ` · ${roleNames.join(", ")}` : ""}
                    {m.joined_at ? ` · joined ${formatRelative(m.joined_at)}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
