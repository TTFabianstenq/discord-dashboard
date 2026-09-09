import { useEffect, useState } from "react";
import { RefreshCw, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { userAvatarUrl } from "@/lib/discord/cdn";
import { useRelay } from "@/lib/discord/store";
import type { DiscordBan } from "@/lib/discord/types";
import { EntityAvatar } from "./entity-avatar";

const EMPTY: DiscordBan[] = [];

export function BanPanel({ guildId }: { guildId: string }) {
  const bans = useRelay((s) => s.bans[guildId] ?? EMPTY);
  const loadBans = useRelay((s) => s.loadBans);
  const unbanMember = useRelay((s) => s.unbanMember);
  const mode = useRelay((s) => s.mode);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadBans(guildId).catch(() => undefined);
  }, [guildId, loadBans]);

  async function refresh() {
    setLoading(true);
    try {
      await loadBans(guildId);
      toast.success("Bans refreshed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load bans");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Bans</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View banned users and unban them. Needs Ban Members.
            {mode === "demo" ? " Sample mode starts empty." : ""}
          </p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {bans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          No bans loaded for this server.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {bans.map((b) => (
            <li key={b.user.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
              <EntityAvatar name={b.user.username} id={b.user.id} src={userAvatarUrl(b.user)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.user.global_name || b.user.username}</p>
                <p className="truncate text-xs text-muted-foreground">
                  @{b.user.username}
                  {b.reason ? ` · ${b.reason}` : " · no reason"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await unbanMember(guildId, b.user.id);
                    useRelay.setState((s) => ({
                      bans: {
                        ...s.bans,
                        [guildId]: (s.bans[guildId] ?? []).filter((x) => x.user.id !== b.user.id),
                      },
                    }));
                    toast.success(`Unbanned ${b.user.username}`);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not unban");
                  }
                }}
              >
                <ShieldOff className="size-4" />
                Unban
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
