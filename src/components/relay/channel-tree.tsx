import {
  Hash,
  Megaphone,
  Volume2,
  Folder,
  MessagesSquare,
  Phone,
  PhoneOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CHANNEL_TYPES, type DiscordChannel } from "@/lib/discord/types";
import { useRelay } from "@/lib/discord/store";

export function ChannelIcon({ type, className }: { type: number; className?: string }) {
  const cls = cn("size-4 shrink-0", className);
  switch (type) {
    case CHANNEL_TYPES.GUILD_VOICE:
      return <Volume2 className={cls} />;
    case CHANNEL_TYPES.GUILD_ANNOUNCEMENT:
      return <Megaphone className={cls} />;
    case CHANNEL_TYPES.GUILD_CATEGORY:
      return <Folder className={cls} />;
    case CHANNEL_TYPES.GUILD_FORUM:
      return <MessagesSquare className={cls} />;
    case CHANNEL_TYPES.GUILD_STAGE_VOICE:
      return <Volume2 className={cls} />;
    default:
      return <Hash className={cls} />;
  }
}

export function sortChannels(channels: DiscordChannel[]): DiscordChannel[] {
  return [...channels].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || (a.name ?? "").localeCompare(b.name ?? ""));
}

function isVoice(type: number): boolean {
  return type === CHANNEL_TYPES.GUILD_VOICE || type === CHANNEL_TYPES.GUILD_STAGE_VOICE;
}

export function ChannelTree({
  channels,
  activeId,
  onSelect,
  guildId,
}: {
  channels: DiscordChannel[];
  activeId?: string;
  onSelect: (channel: DiscordChannel) => void;
  guildId?: string;
}) {
  const sorted = sortChannels(channels);
  const categories = sorted.filter((c) => c.type === CHANNEL_TYPES.GUILD_CATEGORY);
  const rest = sorted.filter((c) => c.type !== CHANNEL_TYPES.GUILD_CATEGORY);
  const grouped = categories.map((cat) => ({
    cat,
    children: rest.filter((c) => c.parent_id === cat.id),
  }));
  const orphans = rest.filter((c) => !c.parent_id || !categories.some((cat) => cat.id === c.parent_id));

  return (
    <nav className="flex flex-col gap-4">
      {orphans.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {orphans.map((c) => (
            <ChannelRow key={c.id} channel={c} active={activeId === c.id} onSelect={onSelect} guildId={guildId} />
          ))}
        </ul>
      ) : null}
      {grouped.map(({ cat, children }) => (
        <div key={cat.id}>
          <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {cat.name}
          </p>
          <ul className="flex flex-col gap-0.5">
            {children.map((c) => (
              <ChannelRow key={c.id} channel={c} active={activeId === c.id} onSelect={onSelect} guildId={guildId} />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ChannelRow({
  channel,
  active,
  onSelect,
  guildId,
}: {
  channel: DiscordChannel;
  active: boolean;
  onSelect: (channel: DiscordChannel) => void;
  guildId?: string;
}) {
  const voiceChannelId = useRelay((s) => s.voiceChannelId);
  const joinVoice = useRelay((s) => s.joinVoice);
  const leaveVoice = useRelay((s) => s.leaveVoice);
  const inThis = voiceChannelId === channel.id;
  const voice = isVoice(channel.type);

  return (
    <li className="group flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => onSelect(channel)}
        className={cn(
          "flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm",
          active || inThis
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
        )}
      >
        <ChannelIcon type={channel.type} className="text-muted-foreground" />
        <span className="truncate">{channel.name}</span>
      </button>
      {voice && guildId ? (
        <button
          type="button"
          title={inThis ? "Leave voice" : "Join voice"}
          aria-label={inThis ? "Leave voice" : "Join voice"}
          className={cn(
            "mr-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground",
            inThis && "text-stone",
          )}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              if (inThis) {
                await leaveVoice(guildId);
                toast.message("Left voice channel");
              } else {
                await joinVoice(guildId, channel.id);
                toast.success(`Joined ${channel.name}`);
              }
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Voice action failed");
            }
          }}
        >
          {inThis ? <PhoneOff className="size-3.5" /> : <Phone className="size-3.5" />}
        </button>
      ) : null}
    </li>
  );
}
