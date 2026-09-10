import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { discordRequest } from "@/lib/discord/api";
import { useRelay } from "@/lib/discord/store";

type Sticker = {
  id: string;
  name: string;
  description?: string | null;
  tags?: string;
  type?: number;
  format_type?: number;
  available?: boolean;
};

export function StickersPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const [items, setItems] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (mode === "demo" || !token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/stickers` },
      })) as Sticker[];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load stickers");
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
          <h2 className="font-serif text-2xl tracking-tight">Stickers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Server stickers (list). Upload is limited by Discord asset rules.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>
      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode has no stickers API.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No stickers."}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {items.map((s) => (
            <li key={s.id} className="rounded-lg border border-border bg-card px-3 py-3 text-center">
              <img
                src={`https://media.discordapp.net/stickers/${s.id}.png?size=128`}
                alt={s.name}
                className="mx-auto size-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <p className="mt-2 truncate text-xs font-medium">{s.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
