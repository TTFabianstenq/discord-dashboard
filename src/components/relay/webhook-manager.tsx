import { useEffect, useMemo, useState } from "react";
import { Copy, Plus, Send, Trash2 } from "lucide-react";
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
import { discordRequest } from "@/lib/discord/api";
import { isTextLike } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordWebhook } from "@/lib/discord/types";

const EMPTY: never[] = [];

export function WebhookManager({ guildId }: { guildId: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY);
  const webhooks = useRelay((s) => s.webhooks[guildId] ?? EMPTY);
  const loadWebhooks = useRelay((s) => s.loadWebhooks);
  const createWebhook = useRelay((s) => s.createWebhook);
  const deleteWebhook = useRelay((s) => s.deleteWebhook);
  const editWebhook = useRelay((s) => s.editWebhook);
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("BotDeck hook");
  const [channelId, setChannelId] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DiscordWebhook | null>(null);
  const [busy, setBusy] = useState(false);

  const [sendTarget, setSendTarget] = useState<DiscordWebhook | null>(null);
  const [sendContent, setSendContent] = useState("");
  const [sendUsername, setSendUsername] = useState("");
  const [sendChannelId, setSendChannelId] = useState("");
  const [sending, setSending] = useState(false);

  const textChannels = useMemo(() => channels.filter((c) => isTextLike(c.type)), [channels]);

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

  async function onSend() {
    if (!sendTarget) return;
    const bodyContent = sendContent.trim();
    if (!bodyContent) {
      toast.error("Write a message");
      return;
    }
    if (mode === "demo") {
      toast.message("Connect a live bot to send webhook messages");
      return;
    }
    const whToken = sendTarget.token;
    if (!whToken || !token) {
      toast.error("This webhook has no token (app-owned webhooks often cannot be executed from here)");
      return;
    }
    const dest = sendChannelId || sendTarget.channel_id;
    if (!dest) {
      toast.error("Pick a channel");
      return;
    }
    setSending(true);
    try {
      if (dest !== sendTarget.channel_id) {
        await editWebhook(sendTarget.id, { channel_id: dest });
        useRelay.setState((s) => ({
          webhooks: {
            ...s.webhooks,
            [guildId]: (s.webhooks[guildId] ?? []).map((w) =>
              w.id === sendTarget.id ? { ...w, channel_id: dest } : w,
            ),
          },
        }));
      }
      const body: { content: string; username?: string } = { content: bodyContent };
      if (sendUsername.trim()) body.username = sendUsername.trim();
      await discordRequest({
        data: {
          token,
          method: "POST",
          path: `/webhooks/${sendTarget.id}/${whToken}?wait=true`,
          body,
        },
      });
      toast.success(`Sent via webhook to #${textChannels.find((c) => c.id === dest)?.name ?? "channel"}`);
      setSendContent("");
      setSendTarget(null);
      setSendUsername("");
      setSendChannelId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send webhook message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Webhooks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, delete, or send through a webhook. When sending you pick the target channel (moves the webhook if needed).
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
            const wh = w as DiscordWebhook;
            const ch = channels.find((c) => c.id === wh.channel_id);
            const canSend = Boolean(wh.token);
            return (
              <li key={wh.id} className="flex items-center gap-2 border-b border-border px-3 py-2.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{wh.name || "Webhook"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    #{ch?.name ?? wh.channel_id}
                    {wh.application_id ? " · app-owned" : ""}
                    {!canSend ? " · no token (can’t send)" : ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canSend}
                  onClick={() => {
                    setSendTarget(wh);
                    setSendContent("");
                    setSendUsername(wh.name || "");
                    setSendChannelId(wh.channel_id);
                  }}
                >
                  <Send className="size-4" />
                  Send
                </Button>
                {wh.url || wh.token ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy webhook URL"
                    onClick={async () => {
                      const url =
                        wh.url ||
                        (wh.token ? `https://discord.com/api/webhooks/${wh.id}/${wh.token}` : "");
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
                <Button variant="ghost" size="icon-sm" aria-label="Delete webhook" onClick={() => setPendingDelete(wh)}>
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

      <Dialog
        open={!!sendTarget}
        onOpenChange={(o) => {
          if (!o) {
            setSendTarget(null);
            setSendContent("");
            setSendChannelId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send via webhook</DialogTitle>
            <DialogDescription>
              Posts as <strong>{sendTarget?.name || "Webhook"}</strong>. Choose any text channel — the webhook is
              moved there if needed, then the message is sent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Channel</Label>
              <Select value={sendChannelId} onValueChange={setSendChannelId}>
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
              <Label htmlFor="wh-send-name">Display name (optional)</Label>
              <Input
                id="wh-send-name"
                value={sendUsername}
                onChange={(e) => setSendUsername(e.target.value)}
                placeholder={sendTarget?.name || "Webhook"}
                maxLength={80}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="wh-send-body">Message</Label>
              <Textarea
                id="wh-send-body"
                value={sendContent}
                onChange={(e) => setSendContent(e.target.value)}
                className="min-h-28"
                placeholder="Message content…"
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendTarget(null)}>
              Cancel
            </Button>
            <Button onClick={() => void onSend()} disabled={sending || !sendContent.trim() || !sendChannelId}>
              <Send className="size-4" />
              {sending ? "Sending…" : "Send"}
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
