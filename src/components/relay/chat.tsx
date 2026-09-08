import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
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

export function Chat({ guildId, channelId }: { guildId: string; channelId?: string }) {
  const channels = useRelay((s) => s.channels[guildId]);
  const loadMessages = useRelay((s) => s.loadMessages);
  const setView = useRelay((s) => s.setView);
  const list = channels ?? [];
  const textChannels = list.filter((c) => isTextLike(c.type));
  const channel = channelId ? list.find((c) => c.id === channelId) : undefined;

  useEffect(() => {
    if (channelId) void loadMessages(channelId);
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
          {channel.topic ? (
            <p className="hidden truncate px-1 text-xs text-muted-foreground sm:block">{channel.topic}</p>
          ) : null}
        </div>
      </header>
      <MessageList channelId={channel.id} />
      <Composer channelId={channel.id} />
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

function MessageList({ channelId }: { channelId: string }) {
  const messages = useRelay((s) => s.messages[channelId]);
  const botId = useRelay((s) => s.bot?.id);
  const bottom = useRef<HTMLDivElement>(null);
  const list = messages ?? [];

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [list.length, channelId]);

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-4">
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No messages in this channel yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((m) => (
            <MessageRow key={m.id} message={m} mine={m.author.id === botId} />
          ))}
        </ul>
      )}
      <div ref={bottom} />
    </div>
  );
}

function MessageRow({ message, mine }: { message: DiscordMessage; mine: boolean }) {
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
          {message.edited_timestamp ? (
            <span className="text-[11px] text-muted-foreground">(edited)</span>
          ) : null}
          <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="rounded-sm p-1 text-muted-foreground hover:bg-secondary" aria-label="Message actions">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-20" /> />
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
          {embed.author?.name ? <p className="text-[11px] text-muted-foreground">{embed.author.name}</p> : null}
          {embed.title ? <p className="font-medium">{embed.title}</p> : null}
          {embed.description ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{embed.description}</p>
          ) : null}
          {embed.fields && embed.fields.length > 0 ? (
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              {embed.fields.map((f) => (
                <div key={f.name} className={f.inline ? "" : "sm:col-span-2"}>
                  <dt className="text-[11px] font-medium text-muted-foreground">{f.name}</dt>
                  <dd className="text-sm">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {embed.footer?.text ? <p className="mt-2 text-[11px] text-muted-foreground">{embed.footer.text}</p> : null}
        </div>
      </div>
    </div>
  );
}

function Composer({ channelId }: { channelId: string }) {
  const sendMessage = useRelay((s) => s.sendMessage);
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
      await sendMessage(channelId, content, embeds);
      setContent("");
      setTitle("");
      setDescription("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="shrink-0 border-t border-border p-3 sm:p-4">
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
              <Input id="embed-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-20 p-1" />/>
            </div>
          </div>
        ) : null}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Message as the bot"
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
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
