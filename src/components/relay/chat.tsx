import { useEffect, useMemo, useRef, useState } from "react";
import { AtSign, Eraser, MoreHorizontal, Pencil, Pin, RefreshCw, Reply, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { discordRequest } from "@/lib/discord/api";
import { userAvatarUrl } from "@/lib/discord/cdn";
import { formatStamp, hexToInt, isTextLike } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordEmbed, DiscordMember, DiscordMessage } from "@/lib/discord/types";
import { EntityAvatar } from "./entity-avatar";
import { ChannelIcon } from "./channel-tree";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY_CHANNELS: never[] = [];
const EMPTY_MEMBERS: DiscordMember[] = [];
const POLL_MS = 3500;
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function memberLabel(m: DiscordMember): string {
  return m.nick || m.user?.global_name || m.user?.username || m.user?.id || "?";
}

export function Chat({ guildId, channelId }: { guildId: string; channelId?: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY_CHANNELS);
  const loadMessages = useRelay((s) => s.loadMessages);
  const setView = useRelay((s) => s.setView);
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const messages = useRelay((s) => (channelId ? s.messages[channelId] : undefined));
  const list = channels;
  const textChannels = useMemo(() => list.filter((c) => isTextLike(c.type)), [list]);
  const channel = channelId ? list.find((c) => c.id === channelId) : undefined;
  const [replyTo, setReplyTo] = useState<DiscordMessage | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeCount, setPurgeCount] = useState(10);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    setReplyTo(null);
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;
    void loadMessages(channelId, true);
    const timer = setInterval(() => {
      void loadMessages(channelId, true);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [channelId, loadMessages]);

  async function purge() {
    if (!channelId) return;
    if (mode === "demo") {
      toast.message("Connect a live bot to purge");
      return;
    }
    if (!token) return;
    const ids = (messages ?? []).slice(-Math.min(100, Math.max(2, purgeCount))).map((m) => m.id);
    if (ids.length < 2) {
      toast.error("Need at least 2 messages under 14 days old");
      return;
    }
    setPurging(true);
    try {
      await discordRequest({
        data: {
          token,
          method: "POST",
          path: `/channels/${channelId}/messages/bulk-delete`,
          body: { messages: ids },
        },
      });
      toast.success(`Purged ${ids.length} messages`);
      setPurgeOpen(false);
      void loadMessages(channelId, true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purge failed (Manage Messages; messages < 14d)");
    } finally {
      setPurging(false);
    }
  }

  if (!channelId || !channel) {
    return (
      <Empty
        title={list.length === 0 ? "Loading channels…" : "No text channel"}
        body={
          list.length === 0
            ? "Fetching channels for this server."
            : "Create a text channel in the Channels tab, then come back to chat."
        }
      />
    );
  }

  if (!isTextLike(channel.type)) {
    return <Empty title={channel.name ?? "Voice"} body="Voice and stage channels cannot carry text here." />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
        <ChannelIcon type={channel.type} className="text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <Select
            value={channel.id}
            onValueChange={(id) => setView({ t: "guild", id: guildId, tab: "chat", channelId: id })}
          >
            <SelectTrigger className="h-9 w-full max-w-xs border-0 bg-transparent px-1 shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {textChannels.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setPurgeOpen(true)}>
          <Eraser className="size-4" />
          <span className="hidden sm:inline">Purge</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Refresh"
          onClick={() => void loadMessages(channel.id, true)}
        >
          <RefreshCw className="size-4" />
        </Button>
      </header>
      {mode === "live" ? <MessageContentIntentBanner channelId={channel.id} /> : null}
      <MessageList
        channelId={channel.id}
        onReply={setReplyTo}
        onMention={(userId, username) => {
          // composer listens via custom event to avoid prop drilling state up
          window.dispatchEvent(
            new CustomEvent("botdeck-mention", { detail: { userId, username, channelId: channel.id } }),
          );
        }}
      />
      <Composer guildId={guildId} channelId={channel.id} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />

      <Dialog open={purgeOpen} onOpenChange={setPurgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purge messages</DialogTitle>
            <DialogDescription>
              Bulk-delete the newest messages in this channel (2–100). Discord only allows messages younger than 14 days.
              Needs Manage Messages.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="purge-n">Count</Label>
            <Input
              id="purge-n"
              type="number"
              min={2}
              max={100}
              value={purgeCount}
              onChange={(e) => setPurgeCount(Number(e.target.value) || 10)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurgeOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void purge()} disabled={purging}>
              {purging ? "Purging…" : "Purge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageContentIntentBanner({ channelId }: { channelId: string }) {
  const messages = useRelay((s) => s.messages[channelId]);
  const list = messages ?? [];
  if (list.length < 3) return null;
  const emptyBodies = list.filter((m) => !m.content?.trim() && !m.embeds?.length && !m.attachments?.length).length;
  if (emptyBodies < Math.max(3, Math.floor(list.length * 0.6))) return null;
  return (
    <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 sm:px-4">
      <strong>Message text is empty from Discord.</strong> Enable Message Content Intent in the Developer Portal, save,
      refresh.
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function MessageList({
  channelId,
  onReply,
  onMention,
}: {
  channelId: string;
  onReply: (m: DiscordMessage) => void;
  onMention: (userId: string, username: string) => void;
}) {
  const messages = useRelay((s) => s.messages[channelId]);
  const botId = useRelay((s) => s.bot?.id);
  const bottom = useRef<HTMLDivElement>(null);
  const list = messages ?? EMPTY_CHANNELS;
  const prevLen = useRef(0);
  useEffect(() => {
    if (list.length !== prevLen.current) {
      prevLen.current = list.length;
      bottom.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [list.length, channelId]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "auto" });
  }, [channelId]);
  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-4">
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No messages in this channel yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((m) => (
            <MessageRow
              key={m.id}
              message={m as DiscordMessage}
              mine={(m as DiscordMessage).author?.id === botId}
              onReply={() => onReply(m as DiscordMessage)}
              onMention={() => {
                const a = (m as DiscordMessage).author;
                if (a?.id) onMention(a.id, a.global_name || a.username || a.id);
              }}
            />
          ))}
        </ul>
      )}
      <div ref={bottom} />
    </div>
  );
}

function MessageRow({
  message,
  mine,
  onReply,
  onMention,
}: {
  message: DiscordMessage;
  mine: boolean;
  onReply: () => void;
  onMention: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content ?? "");
  const editMessage = useRelay((s) => s.editMessage);
  const deleteMessage = useRelay((s) => s.deleteMessage);
  const token = useRelay((s) => s.token);
  const mode = useRelay((s) => s.mode);
  const loadMessages = useRelay((s) => s.loadMessages);
  const content = message.content ?? "";
  const embeds = message.embeds ?? [];
  const attachments = message.attachments ?? [];
  const hasBody = Boolean(content.trim()) || embeds.length > 0 || attachments.length > 0;

  async function togglePin() {
    if (mode === "demo" || !token) {
      toast.message("Pin needs a live bot");
      return;
    }
    try {
      if (message.pinned) {
        await discordRequest({
          data: { token, method: "DELETE", path: `/channels/${message.channel_id}/pins/${message.id}` },
        });
        toast.success("Unpinned");
      } else {
        await discordRequest({
          data: { token, method: "PUT", path: `/channels/${message.channel_id}/pins/${message.id}` },
        });
        toast.success("Pinned");
      }
      void loadMessages(message.channel_id, true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update pin");
    }
  }

  async function react(emoji: string) {
    if (mode === "demo" || !token) {
      toast.message("Reactions need a live bot");
      return;
    }
    try {
      const encoded = encodeURIComponent(emoji);
      await discordRequest({
        data: {
          token,
          method: "PUT",
          path: `/channels/${message.channel_id}/messages/${message.id}/reactions/${encoded}/@me`,
        },
      });
      toast.success(`Reacted ${emoji}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not react");
    }
  }

  return (
    <li className="group flex gap-3">
      <EntityAvatar
        name={message.author?.global_name || message.author?.username || "?"}
        id={message.author?.id ?? "0"}
        src={message.author ? userAvatarUrl(message.author) : null}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <button
            type="button"
            className="text-sm font-medium text-foreground hover:underline"
            onClick={onMention}
            title="Mention this user"
          >
            {message.author?.global_name || message.author?.username || "Unknown"}
          </button>
          {message.author?.bot ? (
            <span className="rounded-sm bg-stone/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-stone">
              Bot
            </span>
          ) : null}
          {message.pinned ? <span className="text-[10px] uppercase tracking-wide text-stone">Pinned</span> : null}
          <span className="text-[11px] text-muted-foreground">{formatStamp(message.timestamp)}</span>
          <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-sm p-1 text-muted-foreground hover:bg-secondary"
                  aria-label="Message actions"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onReply}>
                  <Reply className="size-4" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMention}>
                  <AtSign className="size-4" />
                  Mention
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void togglePin()}>
                  <Pin className="size-4" />
                  {message.pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                {mine ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setDraft(content);
                      setEditing(true);
                    }}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    try {
                      await deleteMessage(message.channel_id, message.id);
                      toast.success("Message deleted");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not delete");
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {editing ? (
          <div className="mt-2 flex flex-col gap-2">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-20" />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await editMessage(message.channel_id, message.id, draft);
                    setEditing(false);
                    toast.success("Message updated");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not edit");
                  }
                }}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {content.trim() ? (
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{content}</p>
            ) : null}
            {embeds.map((embed, i) => (
              <EmbedCard key={i} embed={embed} />
            ))}
            {attachments.map((a) => (
              <div key={a.id} className="mt-1">
                {a.content_type?.startsWith("image/") ? (
                  <a href={a.url} target="_blank" rel="noreferrer">
                    <img
                      src={a.proxy_url || a.url}
                      alt={a.filename}
                      className="max-h-64 max-w-full rounded-md border border-border"
                    />
                  </a>
                ) : (
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-sm text-stone underline">
                    {a.filename}
                  </a>
                )}
              </div>
            ))}
            {!hasBody ? (
              <p className="mt-0.5 text-xs italic text-muted-foreground">
                (no text — enable Message Content Intent, or this message has no body)
              </p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {REACTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="rounded-md border border-border bg-secondary/50 px-1.5 py-0.5 text-sm hover:bg-secondary"
                  onClick={() => void react(e)}
                  aria-label={`React ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </li>
  );
}

function EmbedCard({ embed }: { embed: DiscordEmbed }) {
  const color = embed.color ? `#${embed.color.toString(16).padStart(6, "0")}` : "var(--color-stone)";
  return (
    <div className="mt-2 max-w-lg overflow-hidden rounded-md border border-border bg-secondary/40">
      <div className="flex">
        <span className="w-1 shrink-0" style={{ background: color }} />
        <div className="min-w-0 flex-1 px-3 py-2.5">
          {embed.title ? <p className="font-medium text-foreground">{embed.title}</p> : null}
          {embed.description ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{embed.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Composer({
  guildId,
  channelId,
  replyTo,
  onClearReply,
}: {
  guildId: string;
  channelId: string;
  replyTo: DiscordMessage | null;
  onClearReply: () => void;
}) {
  const sendMessage = useRelay((s) => s.sendMessage);
  const loadMessages = useRelay((s) => s.loadMessages);
  const members = useRelay((s) => s.members[guildId] ?? EMPTY_MEMBERS);
  const [content, setContent] = useState("");
  const [embedOn, setEmbedOn] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#c9bfb0");
  const [sending, setSending] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const embeds = useMemo(() => {
    if (!embedOn || (!title.trim() && !description.trim())) return undefined;
    return [
      {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        color: hexToInt(color),
      },
    ];
  }, [embedOn, title, description, color]);

  const filteredMembers = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    const list = members.filter((m) => m.user?.id);
    if (!q) return list.slice(0, 12);
    return list
      .filter((m) => {
        const label = memberLabel(m).toLowerCase();
        const uname = (m.user?.username || "").toLowerCase();
        return label.includes(q) || uname.includes(q) || (m.user?.id || "").includes(q);
      })
      .slice(0, 12);
  }, [members, mentionQuery]);

  function insertMention(userId: string, label: string) {
    const tag = `<@${userId}>`;
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart ?? content.length;
      const end = el.selectionEnd ?? content.length;
      // if user typed @query, strip the incomplete @query before cursor
      const before = content.slice(0, start);
      const at = before.lastIndexOf("@");
      const useFrom = at >= 0 && !before.slice(at).includes(" ") ? at : start;
      const next = content.slice(0, useFrom) + tag + " " + content.slice(end);
      setContent(next);
      requestAnimationFrame(() => {
        const pos = useFrom + tag.length + 1;
        el.focus();
        el.setSelectionRange(pos, pos);
      });
    } else {
      setContent((c) => (c ? `${c} ${tag} ` : `${tag} `));
    }
    setMentionOpen(false);
    setMentionQuery("");
    toast.message(`Will ping ${label}`);
  }

  useEffect(() => {
    function onExternalMention(ev: Event) {
      const detail = (ev as CustomEvent).detail as { userId?: string; username?: string; channelId?: string };
      if (!detail?.userId || detail.channelId !== channelId) return;
      insertMention(detail.userId, detail.username || detail.userId);
    }
    window.addEventListener("botdeck-mention", onExternalMention);
    return () => window.removeEventListener("botdeck-mention", onExternalMention);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, content]);

  async function send() {
    setSending(true);
    try {
      await sendMessage(channelId, content, embeds, { messageReferenceId: replyTo?.id });
      setContent("");
      setTitle("");
      setDescription("");
      onClearReply();
      void loadMessages(channelId, true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="shrink-0 border-t border-border p-3 sm:p-4">
      {replyTo ? (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs">
          <Reply className="size-3.5 shrink-0 text-stone" />
          <span className="min-w-0 flex-1 truncate">
            Replying to <strong>{replyTo.author?.username}</strong>
            {replyTo.content ? `: ${replyTo.content}` : ""}
          </span>
          <button type="button" onClick={onClearReply} className="rounded p-1 hover:bg-secondary" aria-label="Cancel reply">
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
      <div className="relative rounded-lg border border-border bg-card p-2 sm:p-3">
        {embedOn ? (
          <div className="mb-3 grid gap-2 rounded-md bg-secondary/50 p-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="embed-title">Embed title</Label>
              <Input id="embed-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="embed-body">Embed body</Label>
              <Textarea
                id="embed-body"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-16"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="embed-color">Color</Label>
              <Input
                id="embed-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-11 w-20 p-1"
              />
            </div>
          </div>
        ) : null}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            const v = e.target.value;
            setContent(v);
            const pos = e.target.selectionStart ?? v.length;
            const before = v.slice(0, pos);
            const match = before.match(/@([\w.]*)$/);
            if (match) {
              setMentionOpen(true);
              setMentionQuery(match[1] || "");
            } else if (mentionOpen) {
              setMentionOpen(false);
              setMentionQuery("");
            }
          }}
          placeholder={replyTo ? "Write a reply… Type @ to ping" : "Message as the bot — type @ to ping someone"}
          className="min-h-[52px] resize-none border-0 bg-transparent focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Escape" && mentionOpen) {
              setMentionOpen(false);
              return;
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        {mentionOpen ? (
          <div className="absolute bottom-full left-2 right-2 z-20 mb-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg sm:left-3 sm:right-auto sm:w-72">
            <p className="border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Ping member
            </p>
            {filteredMembers.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">
                {members.length === 0
                  ? "No members loaded (enable Server Members Intent or open Members tab first)."
                  : "No match."}
              </p>
            ) : (
              <ul className="py-1">
                {filteredMembers.map((m) => {
                  const id = m.user!.id;
                  const label = memberLabel(m);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-secondary"
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                          insertMention(id, label);
                        }}
                      >
                        <EntityAvatar
                          name={label}
                          id={id}
                          src={m.user ? userAvatarUrl(m.user) : null}
                          size="sm"
                        />
                        <span className="truncate">{label}</span>
                        {m.user?.bot ? (
                          <span className="text-[10px] uppercase text-muted-foreground">bot</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={embedOn} onCheckedChange={setEmbedOn} />
              Embed
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setMentionOpen((o) => !o);
                setMentionQuery("");
                textareaRef.current?.focus();
              }}
            >
              <AtSign className="size-4" />
              Ping
            </Button>
          </div>
          <Button size="sm" onClick={() => void send()} disabled={sending}>
            <Send className="size-4" />
            {replyTo ? "Reply" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
