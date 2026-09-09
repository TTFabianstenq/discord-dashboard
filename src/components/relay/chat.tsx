import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, Pencil, RefreshCw, Reply, Send, Trash2, X } from "lucide-react";
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
import { userAvatarUrl } from "@/lib/discord/cdn";
import { formatStamp, hexToInt, isTextLike } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordEmbed, DiscordMessage } from "@/lib/discord/types";
import { EntityAvatar } from "./entity-avatar";
import { ChannelIcon } from "./channel-tree";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY_CHANNELS: never[] = [];
const POLL_MS = 3500;

export function Chat({ guildId, channelId }: { guildId: string; channelId?: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY_CHANNELS);
  const loadMessages = useRelay((s) => s.loadMessages);
  const setView = useRelay((s) => s.setView);
  const list = channels;
  const textChannels = useMemo(() => list.filter((c) => isTextLike(c.type)), [list]);
  const channel = channelId ? list.find((c) => c.id === channelId) : undefined;
  const [replyTo, setReplyTo] = useState<DiscordMessage | null>(null);

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
    return (
      <Empty
        title={channel.name ?? "Voice"}
        body="Voice and stage channels cannot carry text here. Pick a text channel, or edit this one under Channels."
      />
    );
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
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Refresh messages"
          onClick={() => void loadMessages(channel.id, true)}
        >
          <RefreshCw className="size-4" />
        </Button>
      </header>
      <MessageList channelId={channel.id} onReply={setReplyTo} />
      <Composer channelId={channel.id} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />
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
}: {
  channelId: string;
  onReply: (m: DiscordMessage) => void;
}) {
  const messages = useRelay((s) => s.messages[channelId]);
  const botId = useRelay((s) => s.bot?.id);
  const bottom = useRef<HTMLDivElement>(null);
  const list = messages ?? EMPTY_CHANNELS;
  const prevLen = useRef(0);

  // Always jump to latest when new messages arrive
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
              mine={(m as DiscordMessage).author.id === botId}
              onReply={() => onReply(m as DiscordMessage)}
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
}: {
  message: DiscordMessage;
  mine: boolean;
  onReply: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const editMessage = useRelay((s) => s.editMessage);
  const deleteMessage = useRelay((s) => s.deleteMessage);

  async function save() {
    try {
      await editMessage(message.channel_id, message.id, draft);
      setEditing(false);
      toast.success("Message updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not edit");
    }
  }

  return (
    <li className="group flex gap-3">
      <EntityAvatar
        name={message.author.global_name || message.author.username}
        id={message.author.id}
        src={userAvatarUrl(message.author)}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">
            {message.author.global_name || message.author.username}
          </span>
          {message.author.bot ? (
            <span className="rounded-sm bg-stone/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-stone">
              Bot
            </span>
          ) : null}
          <span className="text-[11px] text-muted-foreground">{formatStamp(message.timestamp)}</span>
          <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="rounded-sm p-1 text-muted-foreground hover:bg-secondary" aria-label="Message actions">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onReply}>
                  <Reply className="size-4" />
                  Reply
                </DropdownMenuItem>
                {mine ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setDraft(message.content);
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
              <Button size="sm" onClick={() => void save()}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {message.content ? <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p> : null}
            {message.embeds.map((embed, i) => (
              <EmbedCard key={i} embed={embed} />
            ))}
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
          {embed.title ? <p className="font-medium">{embed.title}</p> : null}
          {embed.description ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{embed.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Composer({
  channelId,
  replyTo,
  onClearReply,
}: {
  channelId: string;
  replyTo: DiscordMessage | null;
  onClearReply: () => void;
}) {
  const sendMessage = useRelay((s) => s.sendMessage);
  const loadMessages = useRelay((s) => s.loadMessages);
  const [content, setContent] = useState("");
  const [embedOn, setEmbedOn] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#c9bfb0");
  const [sending, setSending] = useState(false);

  const embeds = useMemo(() => {
    if (!embedOn || (!title.trim() && !description.trim())) return undefined;
    return [{ title: title.trim() || undefined, description: description.trim() || undefined, color: hexToInt(color) }];
  }, [embedOn, title, description, color]);

  async function send() {
    setSending(true);
    try {
      await sendMessage(channelId, content, embeds, {
        messageReferenceId: replyTo?.id,
      });
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
            Replying to <strong>{replyTo.author.username}</strong>
            {replyTo.content ? `: ${replyTo.content}` : ""}
          </span>
          <button type="button" onClick={onClearReply} className="rounded p-1 hover:bg-secondary" aria-label="Cancel reply">
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
      <div className="rounded-lg border border-border bg-card p-2 sm:p-3">
        {embedOn ? (
          <div className="mb-3 grid gap-2 rounded-md bg-secondary/50 p-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="embed-title">Embed title</Label>
              <Input id="embed-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="embed-body">Embed body</Label>
              <Textarea id="embed-body" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-16" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="embed-color">Color</Label>
              <Input id="embed-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-20 p-1" />
            </div>
          </div>
        ) : null}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyTo ? "Write a reply…" : "Message as the bot"}
          className="min-h-[52px] resize-none border-0 bg-transparent focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={embedOn} onCheckedChange={setEmbedOn} />
            Embed
          </label>
          <Button size="sm" onClick={() => void send()} disabled={sending}>
            <Send className="size-4" />
            {replyTo ? "Reply" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
