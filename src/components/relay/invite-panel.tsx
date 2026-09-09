import { useMemo, useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { isTextLike } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordChannel } from "@/lib/discord/types";

const EMPTY: DiscordChannel[] = [];

export function InvitePanel({ guildId }: { guildId: string }) {
  const channels = useRelay((s) => s.channels[guildId] ?? EMPTY);
  const createInvite = useRelay((s) => s.createInvite);
  const textChannels = useMemo(() => channels.filter((c) => isTextLike(c.type)), [channels]);

  const [channelId, setChannelId] = useState(textChannels[0]?.id ?? "");
  const [maxAge, setMaxAge] = useState("86400");
  const [maxUses, setMaxUses] = useState("0");
  const [temporary, setTemporary] = useState(false);
  const [lastUrl, setLastUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    const id = channelId || textChannels[0]?.id;
    if (!id) {
      toast.error("Pick a channel");
      return;
    }
    setBusy(true);
    try {
      const invite = await createInvite(id, {
        max_age: Number(maxAge) || 0,
        max_uses: Number(maxUses) || 0,
        temporary,
      });
      const url = invite.url || `https://discord.gg/${invite.code}`;
      setLastUrl(url);
      toast.success("Invite created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create invite");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6 sm:px-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Invites</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a server invite through a channel. Needs Create Instant Invite.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-border p-4">
        <div className="grid gap-1.5">
          <Label>Channel</Label>
          <Select value={channelId || textChannels[0]?.id || ""} onValueChange={setChannelId}>
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
        <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="max-age">Expires (seconds, 0 = never)</Label>
            <Input id="max-age" type="number" min={0} value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="max-uses">Max uses (0 = unlimited)</Label>
            <Input id="max-uses" type="number" min={0} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <Label htmlFor="temp-mem">Temporary membership</Label>
          <Switch id="temp-mem" checked={temporary} onCheckedChange={setTemporary} />
        </div>
        <Button onClick={() => void create()} disabled={busy || textChannels.length === 0}>
          <Link2 className="size-4" />
          {busy ? "Creating…" : "Create invite"}
        </Button>
      </div>

      {lastUrl ? (
        <div className="flex gap-2">
          <Input readOnly value={lastUrl} className="font-mono text-xs" />
          <Button
            variant="outline"
            size="icon"
            aria-label="Copy invite"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(lastUrl);
                toast.success("Copied");
              } catch {
                toast.error("Could not copy");
              }
            }}
          >
            <Copy className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
