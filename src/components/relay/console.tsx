import { useEffect, useState, type ReactNode } from "react";
import { Hash, LayoutGrid, LogOut, Menu, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { guildIconUrl, userAvatarUrl } from "@/lib/discord/cdn";
import { isTextLike } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { GuildTab } from "@/lib/discord/types";
import { cn } from "@/lib/utils";
import { BotSettings } from "./bot-settings";
import { ChannelManager } from "./channel-manager";
import { ChannelTree } from "./channel-tree";
import { Chat } from "./chat";
import { EntityAvatar } from "./entity-avatar";
import { MembersPanel } from "./members-panel";
import { RelayMark } from "./mark";
import { Overview } from "./overview";
import { RoleManager } from "./role-manager";
import { ServerSettings } from "./server-settings";

const TABS: { id: GuildTab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "channels", label: "Channels" },
  { id: "roles", label: "Roles" },
  { id: "members", label: "Members" },
  { id: "server", label: "Server" },
];

export function Console() {
  const view = useRelay((s) => s.view);
  const setView = useRelay((s) => s.setView);
  const bot = useRelay((s) => s.bot);
  const guilds = useRelay((s) => s.guilds);
  const mode = useRelay((s) => s.mode);
  const disconnect = useRelay((s) => s.disconnect);
  const rateLimit = useRelay((s) => s.rateLimit);
  const clearRateLimit = useRelay((s) => s.clearRateLimit);
  const [navOpen, setNavOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  const guild = view.t === "guild" ? guilds.find((g) => g.id === view.id) : undefined;

  useEffect(() => {
    if (!rateLimit) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= rateLimit.until) clearRateLimit();
    }, 500);
    return () => window.clearInterval(id);
  }, [rateLimit, clearRateLimit]);

  const rateLimitSeconds =
    rateLimit && rateLimit.until > now ? Math.ceil((rateLimit.until - now) / 1000) : 0;

  const nav = <Sidebar onNavigate={() => setNavOpen(false)} />;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {rateLimitSeconds > 0 ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 sm:px-4">
          <span>
            Discord rate-limited this request. Retry in {rateLimitSeconds}s.
            {rateLimit?.message ? ` ${rateLimit.message}` : ""}
          </span>
          <Button variant="ghost" size="sm" onClick={() => clearRateLimit()}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
        <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
        <span className="inline-flex items-center gap-2">
          <RelayMark className="size-5" />
          <span className="font-serif text-base">Fabianbotdeck</span>
        </span>
        {mode === "demo" ? (
          <span className="hidden rounded-full bg-stone/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone sm:inline">
            Sample
          </span>
        ) : (
          <span className="hidden rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-success sm:inline">
            Live
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {bot ? (
            <button
              type="button"
              onClick={() => setView({ t: "bot" })}
              className="hidden items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm hover:bg-secondary sm:flex"
            >
              <EntityAvatar name={bot.username} id={bot.id} src={userAvatarUrl(bot)} size="sm" />
              <span className="max-w-32 truncate">{bot.username}</span>
            </button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              disconnect();
              toast.message("Disconnected");
            }}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 overflow-hidden border-r border-border bg-background lg:flex">{nav}</aside>
        {view.t === "guild" && view.tab === "chat" ? (
          <aside className="hidden w-56 shrink-0 overflow-hidden border-r border-border bg-background md:flex">
            <GuildRail guildId={view.id} channelId={view.channelId} tab={view.tab} />
          </aside>
        ) : null}

        <main
          className={cn(
            "flex min-w-0 flex-1 flex-col bg-background",
            view.t === "guild" && view.tab === "chat" ? "min-h-0 overflow-hidden" : "scroll-thin overflow-y-auto",
          )}
        >
          {view.t === "overview" ? <Overview /> : null}
          {view.t === "bot" ? <BotSettings /> : null}
          {view.t === "guild" && guild ? (
            <>
              <div className="flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2 md:px-3">
                <span className="mr-2 hidden truncate text-sm font-medium md:inline">{guild.name}</span>
                {TABS.map((tabItem) => (
                  <button
                    key={tabItem.id}
                    type="button"
                    onClick={() =>
                      setView({
                        t: "guild",
                        id: guild.id,
                        tab: tabItem.id,
                        channelId: view.t === "guild" ? view.channelId : undefined,
                      })
                    }
                    className={cn(
                      "h-8 shrink-0 rounded-md px-3 text-sm",
                      view.tab === tabItem.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tabItem.label}
                  </button>
                ))}
              </div>
              {view.tab === "chat" ? <Chat guildId={guild.id} channelId={view.channelId} /> : null}
              {view.tab === "channels" ? <ChannelManager guildId={guild.id} /> : null}
              {view.tab === "roles" ? <RoleManager guildId={guild.id} /> : null}
              {view.tab === "members" ? <MembersPanel guildId={guild.id} /> : null}
              {view.tab === "server" ? <ServerSettings guildId={guild.id} /> : null}
            </>
          ) : null}
        </main>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="p-0">
          {nav}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const view = useRelay((s) => s.view);
  const setView = useRelay((s) => s.setView);
  const openGuild = useRelay((s) => s.openGuild);
  const guilds = useRelay((s) => s.guilds);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="scroll-thin flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Console</p>
        <NavItem
          icon={<LayoutGrid className="size-4" />}
          label="Overview"
          active={view.t === "overview"}
          onClick={() => {
            setView({ t: "overview" });
            onNavigate();
          }}
        />
        <NavItem
          icon={<Settings2 className="size-4" />}
          label="Bot"
          active={view.t === "bot"}
          onClick={() => {
            setView({ t: "bot" });
            onNavigate();
          }}
        />
        <p className="mb-2 mt-5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Servers</p>
        <ul className="flex flex-col gap-0.5">
          {guilds.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => {
                  openGuild(g.id);
                  onNavigate();
                }}
                className={cn(
                  "flex h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm",
                  view.t === "guild" && view.id === g.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                <EntityAvatar name={g.name} id={g.id} src={guildIconUrl(g)} size="sm" rounded="lg" />
                <span className="truncate">{g.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-0.5 flex h-10 w-full items-center gap-2 rounded-md px-2 text-sm",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function GuildRail({
  guildId,
  channelId,
  tab,
}: {
  guildId: string;
  channelId?: string;
  tab: GuildTab;
}) {
  const channels = useRelay((s) => s.channels[guildId]);
  const guild = useRelay((s) => s.guilds.find((g) => g.id === guildId));
  const setView = useRelay((s) => s.setView);
  const list = channels ?? [];

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-11 items-center gap-2 border-b border-border px-3">
        <Hash className="size-3.5 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{guild?.name}</span>
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto p-2">
        <ChannelTree
          guildId={guildId}
          channels={list}
          activeId={channelId}
          onSelect={(ch) => {
            setView({
              t: "guild",
              id: guildId,
              tab: isTextLike(ch.type) ? "chat" : tab === "chat" ? "channels" : tab,
              channelId: ch.id,
            });
          }}
        />
      </div>
    </div>
  );
}
