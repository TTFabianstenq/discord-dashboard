import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { discordRequest } from "@/lib/discord/api";
import { useRelay } from "@/lib/discord/store";

type Integration = {
  id: string;
  name: string;
  type: string;
  enabled?: boolean;
  account?: { id: string; name: string };
  application?: { id: string; name: string; bot?: { id: string; username: string } };
};

export function IntegrationsPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (mode === "demo" || !token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/integrations` },
      })) as Integration[];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load integrations (Manage Guild)");
      setItems([]);
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
          <h2 className="font-serif text-2xl tracking-tight">Integrations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bots and services linked to this server.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>
      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode has no integrations API.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No integrations (or missing permission)."}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {items.map((it) => (
            <li key={it.id} className="border-b border-border px-3 py-2.5 last:border-b-0">
              <p className="text-sm font-medium">{it.name || it.application?.name || "Integration"}</p>
              <p className="text-xs text-muted-foreground">
                {it.type}
                {it.application?.bot?.username ? ` · bot @${it.application.bot.username}` : ""}
                {it.enabled === false ? " · disabled" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
