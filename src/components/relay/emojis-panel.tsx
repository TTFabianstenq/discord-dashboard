import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { discordRequest } from "@/lib/discord/api";
import { fileToDataUri } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordEmoji } from "@/lib/discord/types";

export function EmojisPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const [emojis, setEmojis] = useState<DiscordEmoji[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (mode === "demo") {
      setEmojis([]);
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      const list = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/emojis` },
      })) as DiscordEmoji[];
      setEmojis(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load emojis");
      setEmojis([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [guildId, mode, token]);

  async function create() {
    if (!name.trim() || !image) {
      toast.error("Name and image required");
      return;
    }
    if (mode === "demo" || !token) {
      toast.message("Connect a live bot to upload emojis");
      return;
    }
    setBusy(true);
    try {
      const created = (await discordRequest({
        data: {
          token,
          method: "POST",
          path: `/guilds/${guildId}/emojis`,
          body: { name: name.trim().replace(/\s+/g, "_").slice(0, 32), image },
        },
      })) as DiscordEmoji;
      setEmojis((cur) => [created, ...cur]);
      setOpen(false);
      setName("");
      setImage(null);
      toast.success("Emoji uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create emoji");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (mode === "demo" || !token) return;
    try {
      await discordRequest({ data: { token, method: "DELETE", path: `/guilds/${guildId}/emojis/${id}` } });
      setEmojis((cur) => cur.filter((e) => e.id !== id));
      toast.success("Emoji deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete emoji");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Emojis</h2>
          <p className="mt-1 text-sm text-muted-foreground">Server emoji list. Needs Manage Expressions / Manage Emojis.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Upload
          </Button>
        </div>
      </div>

      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode has no emoji API. Connect a live bot.
        </div>
      ) : emojis.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No custom emojis."}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {emojis.map((e) => (
            <li key={e.id} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <img
                src={`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? "gif" : "png"}?size=48`}
                alt={e.name}
                className="size-8 shrink-0"
              />
              <span className="min-w-0 flex-1 truncate text-xs font-medium">:{e.name}:</span>
              <Button variant="ghost" size="icon-sm" aria-label="Delete emoji" onClick={() => void remove(e.id)}>
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload emoji</DialogTitle>
            <DialogDescription>PNG/JPG/GIF under Discord’s size limits. Name becomes :name:.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="emoji-name">Name</Label>
              <Input id="emoji-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={32} placeholder="cool_cat" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="emoji-file">Image</Label>
              <Input
                id="emoji-file"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setImage(await fileToDataUri(file));
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not read image");
                  }
                }}
              />
              {image ? <p className="text-xs text-muted-foreground">Image ready</p> : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void create()} disabled={busy}>
              {busy ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
