import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { discordRequest } from "@/lib/discord/api";
import { CHANNEL_TYPES } from "@/lib/discord/types";
import { useRelay } from "@/lib/discord/store";

const EMPTY: never[] = [];

type GuildEvent = {
  id: string;
  name: string;
  description?: string | null;
  scheduled_start_time: string;
  status?: number;
  entity_type?: number;
  channel_id?: string | null;
};

export function EventsPanel({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY);
  const voice = useMemo(
    () => channels.filter((c) => c.type === CHANNEL_TYPES.GUILD_VOICE || c.type === CHANNEL_TYPES.GUILD_STAGE_VOICE),
    [channels],
  );

  const [events, setEvents] = useState<GuildEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channelId, setChannelId] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!channelId && voice[0]) setChannelId(voice[0].id);
  }, [channelId, voice]);

  async function load() {
    if (mode === "demo" || !token) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      const list = (await discordRequest({
        data: { token, method: "GET", path: `/guilds/${guildId}/scheduled-events` },
      })) as GuildEvent[];
      setEvents(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [guildId, mode, token]);

  async function create() {
    if (!name.trim() || !startLocal || !channelId) {
      toast.error("Name, start time, and channel required");
      return;
    }
    if (mode === "demo" || !token) return;
    setBusy(true);
    try {
      const start = new Date(startLocal).toISOString();
      const created = (await discordRequest({
        data: {
          token,
          method: "POST",
          path: `/guilds/${guildId}/scheduled-events`,
          body: {
            name: name.trim(),
            description: description.trim() || undefined,
            scheduled_start_time: start,
            entity_type: 2,
            channel_id: channelId,
            privacy_level: 2,
          },
        },
      })) as GuildEvent;
      setEvents((cur) => [created, ...cur]);
      setOpen(false);
      setName("");
      setDescription("");
      toast.success("Event created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create event");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (mode === "demo" || !token) return;
    try {
      await discordRequest({
        data: { token, method: "DELETE", path: `/guilds/${guildId}/scheduled-events/${id}` },
      });
      setEvents((cur) => cur.filter((e) => e.id !== id));
      toast.success("Event deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete event");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Events</h2>
          <p className="mt-1 text-sm text-muted-foreground">Scheduled events (voice/stage). Needs Create Events / Manage Events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New event
          </Button>
        </div>
      </div>

      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Sample mode has no events API.
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No scheduled events."}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.scheduled_start_time).toLocaleString()}
                  {e.description ? ` · ${e.description}` : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Delete event" onClick={() => void remove(e.id)}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New scheduled event</DialogTitle>
            <DialogDescription>Creates a voice/stage event in this server.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ev-name">Name</Label>
              <Input id="ev-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea id="ev-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
            </div>
            <div className="grid gap-1.5">
              <Label>Voice / stage channel</Label>
              <Select value={channelId} onValueChange={setChannelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {voice.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-start">Start (local time)</Label>
              <Input id="ev-start" type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
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
