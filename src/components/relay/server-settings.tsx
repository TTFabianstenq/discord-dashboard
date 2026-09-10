import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { discordRequest } from "@/lib/discord/api";
import { guildIconUrl } from "@/lib/discord/cdn";
import { fileToDataUri } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import { EntityAvatar } from "./entity-avatar";
import { VoicePanel } from "./voice-panel";

export function ServerSettings({ guildId }: { guildId: string }) {
  const guild = useRelay((s) => s.guilds.find((g) => g.id === guildId));
  const editGuild = useRelay((s) => s.editGuild);
  const mode = useRelay((s) => s.mode);
  const token = useRelay((s) => s.token);
  const setView = useRelay((s) => s.setView);
  const [name, setName] = useState(guild?.name ?? "");
  const [description, setDescription] = useState(guild?.description ?? "");
  const [icon, setIcon] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setName(guild?.name ?? "");
    setDescription(guild?.description ?? "");
    setIcon(null);
  }, [guild?.id, guild?.name, guild?.description]);

  if (!guild) return null;

  async function onSave() {
    setSaving(true);
    try {
      await editGuild(guildId, {
        name: name.trim(),
        description: description.trim() || null,
        ...(icon ? { icon } : {}),
      });
      toast.success("Server updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update server");
    } finally {
      setSaving(false);
    }
  }

  async function leaveGuild() {
    if (mode === "demo") {
      toast.message("Sample bot cannot leave a real server");
      return;
    }
    if (!token) return;
    setLeaving(true);
    try {
      await discordRequest({ data: { token, method: "DELETE", path: `/users/@me/guilds/${guildId}` } });
      useRelay.setState((s) => ({
        guilds: s.guilds.filter((g) => g.id !== guildId),
        view: { t: "overview" },
      }));
      toast.success("Bot left the server");
      setLeaveOpen(false);
      setView({ t: "overview" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not leave server");
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6 sm:px-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Server</h2>
        <p className="mt-1 text-sm text-muted-foreground">Rename, icon, description, voice, or leave this server as the bot.</p>
      </div>

      <VoicePanel guildId={guildId} />

      <div className="flex items-center gap-4">
        <EntityAvatar name={name || guild.name} id={guild.id} src={icon ?? guildIconUrl(guild, 256)} size="xl" rounded="lg" />
        <div>
          <Label htmlFor="guild-icon" className="cursor-pointer text-sm text-stone hover:underline">Change icon</Label>
          <input
            id="guild-icon"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setIcon(await fileToDataUri(file));
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not read image");
              }
            }}
          />
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, GIF, or WebP. Under 2 MB.</p>
          <button
            type="button"
            className="mt-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(guildId);
                toast.success("Server ID copied");
              } catch {
                toast.error("Could not copy");
              }
            }}
          >
            ID: {guildId}
          </button>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guild-name">Name</Label>
        <Input id="guild-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guild-desc">Description</Label>
        <Textarea id="guild-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button onClick={() => void onSave()} disabled={saving || !name.trim()}>
        {saving ? "Saving…" : "Save server"}
      </Button>

      <div className="border-t border-border pt-6">
        <h3 className="font-medium text-destructive">Danger zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">Removes this bot from the server. You will need a new invite to rejoin.</p>
        <Button variant="destructive" className="mt-3" onClick={() => setLeaveOpen(true)}>
          Leave server
        </Button>
      </div>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {guild.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The bot will leave this Discord server immediately. Roles, channels, and history stay — only the bot is removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void leaveGuild()}
              disabled={leaving}
            >
              {leaving ? "Leaving…" : "Leave server"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
