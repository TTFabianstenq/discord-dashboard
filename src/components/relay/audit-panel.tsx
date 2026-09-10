import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { discordRequest } from "@/lib/discord/api";
import { useRelay } from "@/lib/discord/store";

type AuditEntry = {
  id: string;
  action_type: number;
  user_id?: string | null;
  target_id?: string | null;
  reason?: string | null;
};

const ACTION_NAMES: Record<number, string> = {
  1: "Guild update",
  10: "Channel create",
  11: "Channel update",
  12: "Channel delete",
  20: "Member kick",
  21: "Member prune",
  22: "Member ban",
  23: "Member unban",
  24: "Member update",
  25: "Member role update",
  26: "Member move",
  27: "Member disconnect",
  28: "Bot add",
  30: "Role create",
  31: "Role update",
  32: "Role delete",
  40: "Invite create",
  41: "Invite update",
  42: "Invite delete",
  50: "Webhook create",
  51: "Webhook update",
  52: "Webhook delete",
  60: "Emoji create",
  61: "Emoji update",
  62: "Emoji delete",
  72: "Message delete",
  73: "Message bulk delete",
  74: "Message pin",
  75: "Message unpin",
  80: "Integration create",
  81: "Integration update",
  82: "Integration delete",
};

export function AuditPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (mode === "demo") {
      setEntries([]);
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      const data = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/audit-logs?limit=50` },
      })) as { audit_log_entries?: AuditEntry[] };
      setEntries(Array.isArray(data?.audit_log_entries) ? data.audit_log_entries : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load audit log (need View Audit Log)");
      setEntries([]);
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
          <h2 className="font-serif text-2xl tracking-tight">Audit log</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent moderation and config changes. Needs View Audit Log.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode has no audit log. Connect a live bot.
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No entries (or missing permission)."}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {entries.map((e) => (
            <li key={e.id} className="border-b border-border px-3 py-2.5 last:border-b-0">
              <p className="text-sm font-medium">{ACTION_NAMES[e.action_type] ?? `Action ${e.action_type}`}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                by {e.user_id ?? "?"}
                {e.target_id ? ` · target ${e.target_id}` : ""}
                {e.reason ? ` · ${e.reason}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
