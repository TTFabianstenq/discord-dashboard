import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { discordRequest } from "@/lib/discord/api";
import { useRelay } from "@/lib/discord/store";

type AutoModRule = {
  id: string;
  name: string;
  enabled: boolean;
  event_type: number;
  trigger_type: number;
};

const TRIGGER: Record<number, string> = {
  1: "Keyword",
  3: "Spam",
  4: "Keyword preset",
  5: "Mention spam",
  6: "Member profile",
};

export function AutomodPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const [rules, setRules] = useState<AutoModRule[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (mode === "demo" || !token) {
      setRules([]);
      return;
    }
    setLoading(true);
    try {
      const list = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/auto-moderation/rules` },
      })) as AutoModRule[];
      setRules(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load AutoMod (Manage Guild)");
      setRules([]);
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
          <h2 className="font-serif text-2xl tracking-tight">AutoMod</h2>
          <p className="mt-1 text-sm text-muted-foreground">Read-only list of AutoMod rules. Needs Manage Guild.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>
      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode has no AutoMod API.
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No rules (or missing permission)."}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {rules.map((r) => (
            <li key={r.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {TRIGGER[r.trigger_type] ?? `Trigger ${r.trigger_type}`}
                  {" · "}
                  {r.enabled ? "enabled" : "disabled"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
