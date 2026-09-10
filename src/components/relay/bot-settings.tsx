import { useEffect, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userAvatarUrl } from "@/lib/discord/cdn";
import { fileToDataUri } from "@/lib/discord/format";
import { inviteUrl, PERMISSIONS, permissionsToBits } from "@/lib/discord/permissions";
import { useRelay } from "@/lib/discord/store";
import { ACTIVITY_TYPES } from "@/lib/discord/types";
import { EntityAvatar } from "./entity-avatar";

const DEFAULT_PERMS = ["view", "send", "embed", "attach", "history", "manageMessages", "manageChannels"];

const STATUSES = [
  { value: "online", label: "Online" },
  { value: "idle", label: "Idle" },
  { value: "dnd", label: "Do Not Disturb" },
  { value: "invisible", label: "Invisible" },
] as const;

const ACTIVITY_OPTIONS = [
  { value: String(ACTIVITY_TYPES.PLAYING), label: "Playing" },
  { value: String(ACTIVITY_TYPES.STREAMING), label: "Streaming" },
  { value: String(ACTIVITY_TYPES.LISTENING), label: "Listening to" },
  { value: String(ACTIVITY_TYPES.WATCHING), label: "Watching" },
  { value: String(ACTIVITY_TYPES.CUSTOM), label: "Custom status" },
  { value: String(ACTIVITY_TYPES.COMPETING), label: "Competing in" },
  { value: "none", label: "No activity" },
];

export function BotSettings() {
  const bot = useRelay((s) => s.bot);
  const application = useRelay((s) => s.application);
  const editBot = useRelay((s) => s.editBot);
  const editApplication = useRelay((s) => s.editApplication);
  const setPresence = useRelay((s) => s.setPresence);
  const presence = useRelay((s) => s.presence);
  const mode = useRelay((s) => s.mode);
  const gatewayConnected = useRelay((s) => s.gatewayConnected);
  const [username, setUsername] = useState(bot?.username ?? "");
  const [description, setDescription] = useState(application?.description ?? "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [perms, setPerms] = useState<string[]>(DEFAULT_PERMS);
  const [copied, setCopied] = useState(false);

  const [status, setStatus] = useState<string>(presence?.status ?? "online");
  const [activityType, setActivityType] = useState<string>(
    presence?.activities?.[0] ? String(presence.activities[0].type) : "none",
  );
  const [activityName, setActivityName] = useState(presence?.activities?.[0]?.name ?? "");
  const [streamUrl, setStreamUrl] = useState(presence?.activities?.[0]?.url ?? "https://twitch.tv/");
  const [presenceSaving, setPresenceSaving] = useState(false);

  useEffect(() => {
    setUsername(bot?.username ?? "");
    setDescription(application?.description ?? "");
    setAvatar(null);
    setBanner(null);
  }, [bot?.id, bot?.username, application?.description]);

  useEffect(() => {
    setStatus(presence?.status ?? "online");
    setActivityType(presence?.activities?.[0] ? String(presence.activities[0].type) : "none");
    setActivityName(presence?.activities?.[0]?.name ?? "");
    if (presence?.activities?.[0]?.url) setStreamUrl(presence.activities[0].url);
  }, [presence]);

  const clientId = application?.id || bot?.id || "";
  const url = useMemo(() => (clientId ? inviteUrl(clientId, permissionsToBits(perms)) : ""), [clientId, perms]);

  if (!bot) return null;

  async function onSave() {
    setSaving(true);
    try {
      await editBot({
        username: username.trim(),
        ...(avatar ? { avatar } : {}),
        ...(banner ? { banner } : {}),
      });
      if (application) {
        try {
          await editApplication({ description: description.trim() });
        } catch {
          /* some bots cannot patch applications/@me */
        }
      }
      toast.success(mode === "demo" ? "Sample profile updated (local only)" : "Bot updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update bot");
    } finally {
      setSaving(false);
    }
  }

  async function onSavePresence() {
    setPresenceSaving(true);
    try {
      const type = Number(activityType);
      const activities =
        activityType === "none" || !activityName.trim()
          ? []
          : type === ACTIVITY_TYPES.CUSTOM
            ? [{ name: "Custom Status", type: ACTIVITY_TYPES.CUSTOM, state: activityName.trim() }]
            : [
                {
                  name: activityName.trim(),
                  type,
                  ...(type === ACTIVITY_TYPES.STREAMING
                    ? { url: streamUrl.trim() || "https://twitch.tv/" }
                    : {}),
                },
              ];
      await setPresence({
        status: status as "online" | "idle" | "dnd" | "invisible",
        activities: activities.length ? activities : undefined,
      });
      toast.success(mode === "demo" ? "Presence updated (sample)" : "Presence sent to Discord");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update presence");
    } finally {
      setPresenceSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-6 sm:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
          {mode === "demo" ? "Sample bot" : "Live bot"}
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">Bot profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "demo"
            ? "This is a fake local bot for trying the UI. It does not exist on Discord and cannot join servers."
            : "Username, avatar, and banner. Banner needs a bot that supports it (Discord may reject on some accounts)."}
        </p>
      </div>

      {mode === "demo" ? (
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          Sample mode only. Connect a real bot token from the login screen to manage an actual Discord bot.
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <EntityAvatar name={username || bot.username} id={bot.id} src={avatar ?? userAvatarUrl(bot, 256)} size="xl" />
        <div className="flex flex-col gap-2">
          <Label htmlFor="bot-avatar" className="cursor-pointer text-sm text-stone hover:underline">
            Change avatar
          </Label>
          <input
            id="bot-avatar"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setAvatar(await fileToDataUri(file));
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not read image");
              }
            }}
          />
          {mode === "live" ? (
            <>
              <Label htmlFor="bot-banner" className="cursor-pointer text-sm text-stone hover:underline">
                Change banner
              </Label>
              <input
                id="bot-banner"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setBanner(await fileToDataUri(file));
                    toast.message("Banner selected — click Save profile");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not read image");
                  }
                }}
              />
            </>
          ) : null}
          <p className="font-mono text-xs text-muted-foreground">{bot.id}</p>
          {banner ? <p className="text-xs text-muted-foreground">New banner ready to save</p> : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="bot-name">Username</Label>
        <Input id="bot-name" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={32} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="bot-desc">Description</Label>
        <Textarea id="bot-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={400} />
      </div>
      <Button onClick={() => void onSave()} disabled={saving || !username.trim()}>
        {saving ? "Saving…" : "Save profile"}
      </Button>

      <section className="border-t border-border pt-8">
        <h2 className="font-serif text-2xl tracking-tight">Status & activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "live"
            ? gatewayConnected
              ? "Gateway connected — presence updates while this tab stays open."
              : "Connecting gateway…"
            : "Sample mode only updates the dashboard preview — nothing is sent to Discord."}
        </p>
        <div className="mt-4 grid gap-3">
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Activity type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activityType !== "none" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="activity-name">
                {activityType === String(ACTIVITY_TYPES.CUSTOM) ? "Status text" : "Activity name"}
              </Label>
              <Input
                id="activity-name"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder={activityType === String(ACTIVITY_TYPES.CUSTOM) ? "grok is lowk peak" : "Managed by BotDeck"}
                maxLength={128}
              />
            </div>
          ) : null}
          {activityType === String(ACTIVITY_TYPES.STREAMING) ? (
            <div className="grid gap-1.5">
              <Label htmlFor="stream-url">Stream URL</Label>
              <Input
                id="stream-url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://twitch.tv/channel or https://youtube.com/..."
              />
              <p className="text-[11px] text-muted-foreground">
                Discord only accepts <strong>Twitch or YouTube</strong> URLs for Streaming.
              </p>
            </div>
          ) : null}
          <Button onClick={() => void onSavePresence()} disabled={presenceSaving}>
            {presenceSaving ? "Updating…" : "Update presence"}
          </Button>
        </div>
      </section>

      {mode === "demo" ? (
        <section className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl tracking-tight">Invite link</h2>
          <p className="mt-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            The sample bot is <strong className="text-foreground">not a real Discord bot</strong>. There is no invite
            link and it cannot be added to a server. Disconnect and connect with your own bot token to generate a real
            invite URL.
          </p>
        </section>
      ) : (
        <section className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl tracking-tight">Invite link</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this to add <strong className="font-medium text-foreground">this live bot</strong> to a Discord
            server. Permissions below are encoded in the URL.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PERMISSIONS.map((p) => {
              const on = perms.includes(p.key);
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() =>
                      setPerms((cur) => (cur.includes(p.key) ? cur.filter((k) => k !== p.key) : [...cur, p.key]))
                    }
                    className={`flex h-full w-full flex-col rounded-lg border px-3 py-2.5 text-left text-sm ${
                      on ? "border-stone/50 bg-stone/10" : "border-border hover:bg-secondary/60"
                    }`}
                  >
                    <span className="font-medium">{p.label}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">{p.hint}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex gap-2">
            <Input readOnly value={url} className="font-mono text-xs" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy invite link"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  toast.success("Invite link copied");
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  toast.error("Could not copy");
                }
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
