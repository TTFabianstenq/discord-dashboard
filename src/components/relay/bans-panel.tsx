import { useEffect, useState } from "react";
import { RefreshCw, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { discordRequest } from "@/lib/discord/api";
import { userAvatarUrl } from "@/lib/discord/cdn";
import { useRelay } from "@/lib/discord/store";
import type { DiscordBan } from "@/lib/discord/types";
import { EntityAvatar } from "./entity-avatar";

export function BansPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const unbanMember = useRelay((s) => s.unbanMember);
  const [bans, setBans] = useState<DiscordBan[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (mode === "demo") {
      setBans([]);
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      const list = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/bans?limit=100` },
      })) as DiscordBan[];
      setBans(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load bans (need Ban Members)");
      setBans([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [guildId, mode, token]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Bans</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            People banned from this server. Needs Ban Members permission.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode has no ban list. Connect a live bot to manage bans.
        </div>
      ) : bans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No bans (or missing permission)."}
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
                    setBans((cur) => cur.filter((x) => x.user.id !== b.user.id));
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
