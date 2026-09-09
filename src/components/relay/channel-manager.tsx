import { useState } from "react";
import { Headphones, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CHANNEL_TYPES, type DiscordChannel } from "@/lib/discord/types";
import { channelKindLabel } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import { ChannelIcon, sortChannels } from "./channel-tree";

const EMPTY: DiscordChannel[] = [];

const CREATE_TYPES = [
  { value: String(CHANNEL_TYPES.GUILD_TEXT), label: "Text" },
  { value: String(CHANNEL_TYPES.GUILD_VOICE), label: "Voice" },
  { value: String(CHANNEL_TYPES.GUILD_CATEGORY), label: "Category" },
  { value: String(CHANNEL_TYPES.GUILD_ANNOUNCEMENT), label: "Announcement" },
  { value: String(CHANNEL_TYPES.GUILD_STAGE_VOICE), label: "Stage" },
];

type Draft = {
  name: string;
  type: number;
  topic: string;
  parent_id: string;
  nsfw: boolean;
  rate_limit_per_user: number;
};

const emptyDraft: Draft = {
  name: "",
  type: CHANNEL_TYPES.GUILD_TEXT,
  topic: "",
  parent_id: "",
  nsfw: false,
  rate_limit_per_user: 0,
};

function isVoiceLike(type: number) {
  return type === CHANNEL_TYPES.GUILD_VOICE || type === CHANNEL_TYPES.GUILD_STAGE_VOICE;
}

export function ChannelManager({ guildId }: { guildId: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY);
  const createChannel = useRelay((s) => s.createChannel);
  const editChannel = useRelay((s) => s.editChannel);
  const deleteChannel = useRelay((s) => s.deleteChannel);
  const joinVoice = useRelay((s) => s.joinVoice);
  const voiceChannelId = useRelay((s) => s.voiceChannelId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DiscordChannel | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pendingDelete, setPendingDelete] = useState<DiscordChannel | null>(null);

  const categories = sortChannels(channels).filter((c) => c.type === CHANNEL_TYPES.GUILD_CATEGORY);
  const sorted = sortChannels(channels);

  function startCreate() {
    setEditing(null);
    setDraft(emptyDraft);
    setOpen(true);
  }

  function startEdit(ch: DiscordChannel) {
    setEditing(ch);
    setDraft({
      name: ch.name ?? "",
      type: ch.type,
      topic: ch.topic ?? "",
      parent_id: ch.parent_id ?? "",
      nsfw: ch.nsfw ?? false,
      rate_limit_per_user: ch.rate_limit_per_user ?? 0,
    });
    setOpen(true);
  }

  async function save() {
    try {
      if (!draft.name.trim()) throw new Error("Name is required.");
      const slug =
        (editing ? editing.type : draft.type) === CHANNEL_TYPES.GUILD_CATEGORY
          ? draft.name.trim()
          : draft.name.trim().toLowerCase().replace(/\s+/g, "-");
      const payload = {
        name: slug,
        type: editing ? editing.type : draft.type,
        topic: draft.topic || null,
        parent_id: draft.parent_id || null,
        nsfw: draft.nsfw,
        rate_limit_per_user: Number(draft.rate_limit_per_user) || 0,
      };
      if (editing) {
        await editChannel(guildId, editing.id, payload);
        toast.success("Channel updated");
      } else {
        await createChannel(guildId, payload);
        toast.success("Channel created");
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save channel");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Channels</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, rename, move, or delete channels. Voice rows have a Join button (bot appears in VC; no audio from this site).
          </p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="size-4" />
          New channel
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          No channels loaded. If this is a live bot, it may lack View Channel permission.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {sorted.map((ch) => (
            <li
              key={ch.id}
              className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0"
            >
              <ChannelIcon type={ch.type} className="text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {ch.type === CHANNEL_TYPES.GUILD_CATEGORY ? ch.name?.toUpperCase() : ch.name}
                  {voiceChannelId === ch.id ? (
                    <span className="ml-2 text-xs font-normal text-stone">· in channel</span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {channelKindLabel(ch.type)}
                  {ch.parent_id
                    ? ` · ${categories.find((c) => c.id === ch.parent_id)?.name ?? "category"}`
                    : ""}
                  {ch.nsfw ? " · age-restricted" : ""}
                  {ch.rate_limit_per_user ? ` · slowmode ${ch.rate_limit_per_user}s` : ""}
                </p>
              </div>
              {isVoiceLike(ch.type) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await joinVoice(guildId, ch.id);
                      toast.success("Joined voice — keep the tab open");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not join");
                    }
                  }}
                >
                  <Headphones className="size-4" />
                  Join
                </Button>
              ) : null}
              <Button variant="ghost" size="icon-sm" onClick={() => startEdit(ch)} aria-label="Edit channel">
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPendingDelete(ch)}
                aria-label="Delete channel"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit channel" : "New channel"}</DialogTitle>
            <DialogDescription>
              {editing ? "Changes apply immediately on the live server." : "The bot needs Manage Channels to create this."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ch-name">Name</Label>
              <Input
                id="ch-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="general"
              />
            </div>
            {!editing ? (
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={String(draft.type)} onValueChange={(v) => setDraft({ ...draft, type: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            {draft.type !== CHANNEL_TYPES.GUILD_CATEGORY ? (
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select
                  value={draft.parent_id || "none"}
                  onValueChange={(v) => setDraft({ ...draft, parent_id: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories
                      .filter((c) => c.id !== editing?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            {draft.type === CHANNEL_TYPES.GUILD_TEXT ||
            draft.type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT ||
            editing?.type === CHANNEL_TYPES.GUILD_TEXT ||
            editing?.type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT ? (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="ch-topic">Topic</Label>
                  <Textarea
                    id="ch-topic"
                    value={draft.topic}
                    onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                    className="min-h-16"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <Label htmlFor="ch-nsfw">Age-restricted</Label>
                  <Switch id="ch-nsfw" checked={draft.nsfw} onCheckedChange={(v) => setDraft({ ...draft, nsfw: v })} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ch-slow">Slowmode (seconds)</Label>
                  <Input
                    id="ch-slow"
                    type="number"
                    min={0}
                    max={21600}
                    value={draft.rate_limit_per_user}
                    onChange={(e) => setDraft({ ...draft, rate_limit_per_user: Number(e.target.value) })}
                  />
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete #{pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Messages in this channel will be gone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteChannel(guildId, pendingDelete.id);
                  toast.success("Channel deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not delete");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
