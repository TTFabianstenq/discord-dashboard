import { useEffect, useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
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
import { isTextLike } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordWebhook } from "@/lib/discord/types";

export function WebhookManager({ guildId }: { guildId: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? []);
  const webhooks = useRelay((s) => s.webhooks[guildId] ?? []);
  const loadWebhooks = useRelay((s) => s.loadWebhooks);
  const createWebhook = useRelay((s) => s.createWebhook);
  const deleteWebhook = useRelay((s) => s.deleteWebhook);
  const mode = useRelay((s) => s.mode);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("BotDeck hook");
  const [channelId, setChannelId] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DiscordWebhook | null>(null);
  const [busy, setBusy] = useState(false);

  const textChannels = channels.filter((c) => isTextLike(c.type));

  useEffect(() => {
    void loadWebhooks(guildId);
  }, [guildId, loadWebhooks]);

  useEffect(() => {
    if (!channelId && textChannels[0]) setChannelId(textChannels[0].id);
  }, [channelId, textChannels]);

  async function onCreate() {
    if (!name.trim() || !channelId) {
      toast.error("Name and channel are required");
      return;
    }
    setBusy(true);
    try {
      const created = await createWebhook(channelId, name.trim());
      // ensure list reflects create
      useRelay.setState((s) => ({
        webhooks: {
          ...s.webhooks,
          [guildId]: [...(s.webhooks[guildId] ?? []), created],
        },
      }));
      toast.success("Webhook created");
      setOpen(false);
      setName("BotDeck hook");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create webhook");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Webhooks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create or delete channel webhooks. Needs Manage Webhooks.
            {mode === "demo" ? " Sample mode simulates creates." : ""}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          No webhooks loaded for this server.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {webhooks.map((w) => {
            const ch = channels.find((c) => c.id === w.channel_id);
            return (
              <li key={w.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{w.name || "Webhook"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    #{ch?.name ?? w.channel_id}
                    {w.application_id ? " · app-owned" : ""}
                  </p>
                </div>
                {w.url || w.token ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy webhook URL"
                    onClick={async () => {
                      const url =
                        w.url ||
                        (w.token ? `https://discord.com/api/webhooks/${w.id}/${w.token}` : "");
                      if (!url) {
                        toast.error("No URL available");
                        return;
                      }
                      try {
                        await navigator.clipboard.writeText(url);
                        toast.success("Webhook URL copied");
                      } catch {
                        toast.error("Could not copy");
                      }
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete webhook"
                  onClick={() => setPendingDelete(w)}
                >
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
            <DialogTitle>New webhook</DialogTitle>
            <DialogDescription>Posts into the channel as a webhook identity.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="wh-name">Name</Label>
              <Input id="wh-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void onCreate()} disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name || "This webhook"} will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteWebhook(pendingDelete.id, guildId);
                  toast.success("Webhook deleted");
                  setPendingDelete(null);
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
