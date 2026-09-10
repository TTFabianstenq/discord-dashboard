import { useMemo, useState } from "react";
import { Headphones, Mic, MicOff, PhoneOff, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { discordRequest } from "@/lib/discord/api";
import { userAvatarUrl } from "@/lib/discord/cdn";
import { getGateway } from "@/lib/discord/gateway";
import { CHANNEL_TYPES } from "@/lib/discord/types";
import { useRelay, type VoiceStateEntry } from "@/lib/discord/store";
import { EntityAvatar } from "./entity-avatar";

const EMPTY: never[] = [];
const EMPTY_VS: VoiceStateEntry[] = [];

export function VoicePanel({ guildId }: { guildId: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY);
  const voiceChannelId = useRelay((s) => s.voiceChannelId);
  const voiceStates = useRelay((s) => s.voiceStates[guildId] ?? EMPTY_VS);
  const members = useRelay((s) => s.members[guildId] ?? EMPTY);
  const bot = useRelay((s) => s.bot);
  const token = useRelay((s) => s.token);
  const joinVoice = useRelay((s) => s.joinVoice);
  const leaveVoice = useRelay((s) => s.leaveVoice);
  const mode = useRelay((s) => s.mode);
  const gatewayConnected = useRelay((s) => s.gatewayConnected);

  const voiceChannels = useMemo(
    () =>
      channels.filter(
        (c) => c.type === CHANNEL_TYPES.GUILD_VOICE || c.type === CHANNEL_TYPES.GUILD_STAGE_VOICE,
      ),
    [channels],
  );

  const [selected, setSelected] = useState("");
  const [selfMute, setSelfMute] = useState(false);
  const [selfDeaf, setSelfDeaf] = useState(false);
  const [busy, setBusy] = useState(false);

  const active = voiceChannels.find((c) => c.id === voiceChannelId);
  const inThisGuild = Boolean(active);
  const selectValue = selected || voiceChannelId || voiceChannels[0]?.id || "";
  const rosterChannelId = selectValue;

  const peopleInChannel = useMemo(() => {
    if (!rosterChannelId) return [] as VoiceStateEntry[];
    return voiceStates.filter((v) => v.channel_id === rosterChannelId);
  }, [voiceStates, rosterChannelId]);

  const occupancy = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of voiceStates) {
      if (!v.channel_id) continue;
      map.set(v.channel_id, (map.get(v.channel_id) ?? 0) + 1);
    }
    return map;
  }, [voiceStates]);

  function displayName(v: VoiceStateEntry): string {
    if (v.nick) return v.nick;
    if (v.global_name) return v.global_name;
    if (v.username) return v.username;
    const m = members.find((x) => x.user?.id === v.user_id);
    if (m?.nick) return m.nick;
    if (m?.user?.global_name) return m.user.global_name;
    if (m?.user?.username) return m.user.username;
    if (bot?.id === v.user_id) return bot.username;
    return `User ${v.user_id.slice(-4)}`;
  }

  function sendVoiceState(channelId: string | null, mute: boolean, deaf: boolean) {
    const gw = getGateway();
    if (!gw) {
      toast.error("Gateway not ready — reconnect the bot");
      return false;
    }
    gw.updateVoiceState(guildId, channelId, mute, deaf);
    return true;
  }

  function refreshRoster() {
    const gw = getGateway();
    if (!gw) {
      toast.error("Gateway not ready — disconnect and log in again");
      return;
    }
    toast.message("Refreshing voice states…");
    gw.forceReconnect();
  }

  async function disconnectUser(userId: string) {
    if (mode === "demo" || !token) {
      toast.message("Live bot required");
      return;
    }
    try {
      await discordRequest({
        data: {
          token,
          method: "PATCH",
          path: `/guilds/${guildId}/members/${userId}`,
          body: { channel_id: null },
        },
      });
      toast.success("Disconnected from voice");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Need Move Members permission");
    }
  }

  async function moveUser(userId: string, channelId: string) {
    if (mode === "demo" || !token) {
      toast.message("Live bot required");
      return;
    }
    try {
      await discordRequest({
        data: {
          token,
          method: "PATCH",
          path: `/guilds/${guildId}/members/${userId}`,
          body: { channel_id: channelId },
        },
      });
      toast.success("Moved member");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Need Move Members permission");
    }
  }

  async function onJoin() {
    const id = selectValue;
    if (!id) {
      toast.error("No voice channel in this server");
      return;
    }
    setBusy(true);
    try {
      await joinVoice(guildId, id);
      sendVoiceState(id, selfMute, selfDeaf);
      toast.success(
        mode === "demo"
          ? "Joined voice (sample — not on Discord)"
          : "Bot joined the voice channel. Keep this tab open.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join voice");
    } finally {
      setBusy(false);
    }
  }

  async function onLeave() {
    setBusy(true);
    try {
      await leaveVoice(guildId);
      setSelfMute(false);
      setSelfDeaf(false);
      toast.message("Left voice channel");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not leave voice");
    } finally {
      setBusy(false);
    }
  }

  function toggleMute() {
    const next = !selfMute;
    setSelfMute(next);
    if (!voiceChannelId || !inThisGuild) {
      toast.message(next ? "Will join muted" : "Will join unmuted");
      return;
    }
    if (mode === "demo") {
      toast.success(next ? "Muted (sample)" : "Unmuted (sample)");
      return;
    }
    if (sendVoiceState(voiceChannelId, next, selfDeaf)) {
      toast.success(next ? "Bot muted" : "Bot unmuted");
    }
  }

  function toggleDeaf() {
    const next = !selfDeaf;
    const mute = next ? true : selfMute;
    setSelfDeaf(next);
    if (next) setSelfMute(true);
    if (!voiceChannelId || !inThisGuild) {
      toast.message(next ? "Will join deafened" : "Will join undeafened");
      return;
    }
    if (mode === "demo") {
      toast.success(next ? "Deafened (sample)" : "Undeafened (sample)");
      return;
    }
    if (sendVoiceState(voiceChannelId, mute, next)) {
      toast.success(next ? "Bot deafened" : "Bot undeafened");
    }
  }

  const rosterTitle = rosterChannelId
    ? voiceChannels.find((c) => c.id === rosterChannelId)?.name ?? "channel"
    : null;

  return (
    <div
      className={
        inThisGuild
          ? "rounded-xl border border-success/40 bg-success/10 p-4"
          : "rounded-xl border border-border bg-card p-4"
      }
    >
      <div className="flex items-start gap-3">
        <Volume2 className={`mt-0.5 size-4 ${inThisGuild ? "text-success" : "text-stone"}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">Voice</h3>
            {inThisGuild ? (
              <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                In VC
              </span>
            ) : null}
            <span className="text-[10px] text-muted-foreground">
              {voiceStates.length} tracked in server
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Join / leave, see who is in each VC, move or disconnect people (Move Members). No audio from the site.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={refreshRoster} disabled={mode !== "live"}>
          <RefreshCw className="size-4" />
          Roster
        </Button>
      </div>

      {mode === "live" && !gatewayConnected ? (
        <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Gateway not connected — press Roster or disconnect and log in again.
        </p>
      ) : null}

      {inThisGuild && active ? (
        <div className="mt-3 rounded-lg border border-success/30 bg-background/50 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Connected to #{active.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selfMute ? "Muted" : "Unmuted"} · {selfDeaf ? "Deafened" : "Undeafened"} · keep this tab open
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Not in a voice channel in this server</p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-1.5">
          <Label>Channel</Label>
          <Select value={selectValue} onValueChange={setSelected} disabled={voiceChannels.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice channel" />
            </SelectTrigger>
            <SelectContent>
              {voiceChannels.map((c) => {
                const count = occupancy.get(c.id) ?? 0;
                return (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.type === CHANNEL_TYPES.GUILD_STAGE_VOICE ? " (stage)" : ""}
                    {count ? ` · ${count}` : ""}
                    {c.id === voiceChannelId ? " · live" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={() => void onJoin()} disabled={busy || voiceChannels.length === 0}>
            <Headphones className="size-4" />
            Join
          </Button>
          <Button variant="outline" onClick={() => void onLeave()} disabled={busy || !inThisGuild}>
            <PhoneOff className="size-4" />
            Leave
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant={selfMute ? "secondary" : "outline"} onClick={toggleMute}>
          {selfMute ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          {selfMute ? "Muted" : "Unmuted"}
        </Button>
        <Button type="button" size="sm" variant={selfDeaf ? "secondary" : "outline"} onClick={toggleDeaf}>
          {selfDeaf ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          {selfDeaf ? "Deafened" : "Undeafened"}
        </Button>
      </div>

      {voiceChannels.length > 0 ? (
        <div className="mt-4 grid gap-1 border-t border-border/60 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">All voice channels</p>
          <ul className="mt-1 space-y-1">
            {voiceChannels.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                    c.id === rosterChannelId ? "bg-secondary" : "hover:bg-secondary/60"
                  }`}
                >
                  <span className="truncate">#{c.name}</span>
                  <span className="text-xs text-muted-foreground">{occupancy.get(c.id) ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 border-t border-border/60 pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          In {rosterTitle ? `#${rosterTitle}` : "channel"}
          {peopleInChannel.length ? ` · ${peopleInChannel.length}` : ""}
        </p>
        {mode === "demo" ? (
          <p className="mt-2 text-sm text-muted-foreground">Sample mode has no live voice roster.</p>
        ) : !gatewayConnected ? (
          <p className="mt-2 text-sm text-muted-foreground">Waiting for gateway… hit Roster.</p>
        ) : peopleInChannel.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nobody in this channel
            {voiceStates.length === 0
              ? " — if people are in VC on Discord, hit Roster (or disconnect + log in again)."
              : "."}
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {peopleInChannel.map((v) => {
              const name = displayName(v);
              const isBot = v.bot || v.user_id === bot?.id;
              const avatar =
                v.avatar != null
                  ? userAvatarUrl({
                      id: v.user_id,
                      username: v.username || name,
                      discriminator: "0",
                      avatar: v.avatar,
                    })
                  : null;
              return (
                <li key={v.user_id} className="flex flex-wrap items-center gap-2 rounded-md bg-background/40 px-2 py-1.5">
                  <EntityAvatar name={name} id={v.user_id} src={avatar} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {name}
                    {isBot ? <span className="ml-1 text-[10px] uppercase text-stone">Bot</span> : null}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {v.self_mute || v.mute ? "muted" : ""}
                    {(v.self_mute || v.mute) && (v.self_deaf || v.deaf) ? " · " : ""}
                    {v.self_deaf || v.deaf ? "deaf" : ""}
                  </span>
                  {!isBot ? (
                    <div className="flex gap-1">
                      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => void disconnectUser(v.user_id)}>
                        Kick VC
                      </Button>
                      {voiceChannels
                        .filter((c) => c.id !== rosterChannelId)
                        .slice(0, 2)
                        .map((c) => (
                          <Button
                            key={c.id}
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => void moveUser(v.user_id, c.id)}
                          >
                            → {c.name}
                          </Button>
                        ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
