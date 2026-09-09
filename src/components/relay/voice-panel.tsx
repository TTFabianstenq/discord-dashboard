import { useMemo, useState } from "react";
import { Headphones, Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
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
  const selectValue = selected || voiceChannels[0]?.id || "";

  async function onJoin() {
    const id = selectValue;
    if (!id) {
      toast.error("No voice channel in this server");
      return;
    }
    setBusy(true);
    try {
      await joinVoice(guildId, id);
      getGateway()?.updateVoiceState(guildId, id, selfMute, selfDeaf);
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
      toast.message("Left voice channel");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not leave voice");
    } finally {
      setBusy(false);
    }
  }

  function applyFlags() {
    if (!voiceChannelId) {
      toast.message("Join a channel first");
      return;
    }
    getGateway()?.updateVoiceState(guildId, voiceChannelId, selfMute, selfDeaf);
    toast.success("Mute / deaf flags sent");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Volume2 className="mt-0.5 size-4 text-stone" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">Voice</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The bot can <strong className="font-medium text-foreground">join and leave</strong> voice channels
            while this tab stays open (gateway). It{" "}
            <strong className="font-medium text-foreground">cannot stream mic audio or TTS</strong> from this
            dashboard — that needs a separate always-on voice process, not a Vercel website.
          </p>
        </div>
      </div>

      {mode === "live" && !gatewayConnected ? (
        <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Gateway not connected yet. Wait a moment or reconnect the bot.
        </p>
      ) : null}

      {active ? (
        <p className="mt-3 text-sm">
          In channel: <span className="font-medium">{active.name}</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Not in a voice channel</p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-1.5">
          <Label>Channel</Label>
          <Select
            value={selectValue}
            onValueChange={setSelected}
            disabled={voiceChannels.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select voice channel" />
            </SelectTrigger>
            <SelectContent>
              {voiceChannels.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                  {c.type === CHANNEL_TYPES.GUILD_STAGE_VOICE ? " (stage)" : ""}
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
          <Button variant="outline" onClick={() => void onLeave()} disabled={busy || !voiceChannelId}>
            <PhoneOff className="size-4" />
            Leave
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={selfMute ? "secondary" : "outline"}
          onClick={() => setSelfMute((v) => !v)}
        >
          {selfMute ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          {selfMute ? "Muted" : "Unmuted"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={selfDeaf ? "secondary" : "outline"}
          onClick={() => setSelfDeaf((v) => !v)}
        >
          <Headphones className="size-4" />
          {selfDeaf ? "Deafened" : "Undeafened"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={applyFlags} disabled={!voiceChannelId}>
          Apply mute/deaf
        </Button>
      </div>
    </div>
  );
}
