import { useEffect, useMemo, useState } from "react";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { discordRequest } from "@/lib/discord/api";
import { isTextLike } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordInvite } from "@/lib/discord/types";

const EMPTY: never[] = [];

export function InvitesPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY);
  const textChannels = useMemo(() => channels.filter((c) => isTextLike(c.type)), [channels]);

  const [invites, setInvites] = useState<DiscordInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [maxAge, setMaxAge] = useState("0");
  const [maxUses, setMaxUses] = useState("0");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!channelId && textChannels[0]) setChannelId(textChannels[0].id);
  }, [channelId, textChannels]);

  async function load() {
    if (mode === "demo") {
      setInvites([]);
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      const list = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/invites` },
      })) as DiscordInvite[];
      setInvites(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load invites (need Manage Guild)");
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [guildId, mode, token]);

  async function create() {
    if (!channelId) {
      toast.error("Pick a channel");
      return;
    }
    if (mode === "demo") {
      toast.message("Connect a live bot to create invites");
      return;
    }
    if (!token) return;
    setBusy(true);
    try {
      const created = (await discordRequest({
        data: {
          token,
          method: "POST",
          path: `/channels/${channelId}/invites`,
          body: {
            max_age: Number(maxAge) || 0,
            max_uses: Number(maxUses) || 0,
            temporary: false,
            unique: true,
          },
        },
      })) as DiscordInvite;
      setInvites((cur) => [created, ...cur]);
      setOpen(false);
      toast.success("Invite created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create invite");
    } finally {
      setBusy(false);
    }
  }

  async function remove(code: string) {
    if (mode === "demo" || !token) return;
    try {
      await discordRequest({ data: { token, method: "DELETE", path: `/invites/${code}` } });
      setInvites((cur) => cur.filter((i) => i.code !== code));
      toast.success("Invite deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete invite");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Invites</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create and revoke server invites.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New invite
          </Button>
        </div>
      </div>

      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode cannot create Discord invites. Connect a live bot.
        </div>
      ) : invites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No invites loaded."}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {invites.map((inv) => {
            const link = inv.url || `https://discord.gg/${inv.code}`;
            return (
              <li key={inv.code} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm">{inv.code}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    #{inv.channel?.name ?? "channel"}
                    {inv.max_uses ? ` · max ${inv.max_uses} uses` : " · unlimited uses"}
                    {inv.max_age ? ` · expires ${inv.max_age}s` : " · never expires"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy invite"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(link);
                      toast.success("Invite copied");
                    } catch {
                      toast.error("Could not copy");
                    }
                  }}
                >
                  <Copy className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Delete invite" onClick={() => void remove(inv.code)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New invite</DialogTitle>
            <DialogDescription>Creates a Discord invite for a channel in this server.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Channel</Label>
              <Select value={channelId} onValueChange={setChannelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {textChannels.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      #{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="max-age">Max age (seconds, 0 = never)</Label>
              <Input id="max-age" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="max-uses">Max uses (0 = unlimited)</Label>
              <Input id="max-uses" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void create()} disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
