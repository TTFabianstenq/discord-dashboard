import { useMemo, useState } from "react";
import { Headphones, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGateway } from "@/lib/discord/gateway";
import { CHANNEL_TYPES } from "@/lib/discord/types";
import { useRelay } from "@/lib/discord/store";

const EMPTY: never[] = [];

export function VoicePanel({ guildId }: { guildId: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY);
  const voiceChannelId = useRelay((s) => s.voiceChannelId);
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
  const selectValue = selected || voiceChannels[0]?.id || "";

  function sendVoiceState(channelId: string | null, mute: boolean, deaf: boolean) {
    const gw = getGateway();
    if (!gw) {
      toast.error("Gateway not ready — reconnect the bot");
      return false;
    }
    gw.updateVoiceState(guildId, channelId, mute, deaf);
    return true;
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
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Join / leave, mute, and deafen the bot while this tab stays open.
          </p>
        </div>
      </div>

      {mode === "live" && !gatewayConnected ? (
        <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Gateway not connected yet. Wait a moment or reconnect the bot.
        </p>
      ) : null}

      {inThisGuild && active ? (
        <div className="mt-3 rounded-lg border border-success/30 bg-background/50 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Connected to #{active.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selfMute ? "Muted" : "Unmuted"}
            {" · "}
            {selfDeaf ? "Deafened" : "Undeafened"}
            {" · keep this tab open"}
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
              {voiceChannels.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                  {c.type === CHANNEL_TYPES.GUILD_STAGE_VOICE ? " (stage)" : ""}
                  {c.id === voiceChannelId ? " · live" : ""}
                </SelectItem>
              ))}
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
    </div>
  );
}
