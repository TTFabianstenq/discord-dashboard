import { useState } from "react";
import { MoreHorizontal, ShieldOff, UserX, Ban, Clock, UserCog, MicOff, Headphones } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { userAvatarUrl } from "@/lib/discord/cdn";
import { formatRelative } from "@/lib/discord/format";
import { canBan, canKick, canModerate } from "@/lib/discord/permissions";
import { useRelay } from "@/lib/discord/store";
import type { DiscordMember, DiscordRole } from "@/lib/discord/types";
import { EntityAvatar } from "./entity-avatar";

const EMPTY_MEMBERS: DiscordMember[] = [];
const EMPTY_ROLES: DiscordRole[] = [];

type Action = "kick" | "ban" | "timeout" | "untimeout" | "nick" | "roles" | "mute" | "deaf" | null;

export function MembersPanel({ guildId }: { guildId: string }) {
  const members = useRelay((s) => s.members[guildId] ?? EMPTY_MEMBERS);
  const roles = useRelay((s) => s.roles[guildId] ?? EMPTY_ROLES);
  const guild = useRelay((s) => s.guilds.find((g) => g.id === guildId));
  const botId = useRelay((s) => s.bot?.id);
  const mode = useRelay((s) => s.mode);
  const kickMember = useRelay((s) => s.kickMember);
  const banMember = useRelay((s) => s.banMember);
  const timeoutMember = useRelay((s) => s.timeoutMember);
  const editMember = useRelay((s) => s.editMember);

  const [target, setTarget] = useState<DiscordMember | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState("");
  const [timeoutMinutes, setTimeoutMinutes] = useState(60);
  const [nick, setNick] = useState("");
  const [roleIds, setRoleIds] = useState<string[]>([]);

  const perms = guild?.permissions;
  const allowKick = mode === "demo" || canKick(perms);
  const allowBan = mode === "demo" || canBan(perms);
  const allowTimeout = mode === "demo" || canModerate(perms);
  const allowManage = mode === "demo" || canModerate(perms);

  const assignableRoles = roles.filter((r) => r.name !== "@everyone" && !r.managed);

  function openAction(m: DiscordMember, a: Action) {
    setTarget(m);
    setAction(a);
    setReason("");
    setTimeoutMinutes(60);
    setNick(m.nick ?? "");
    setRoleIds([...m.roles]);
  }

  async function confirm() {
    if (!target?.user || !action) return;
    const userId = target.user.id;
    try {
      if (action === "kick") {
        await kickMember(guildId, userId, reason || undefined);
        toast.success(`Kicked ${target.user.username}`);
      } else if (action === "ban") {
        await banMember(guildId, userId, { reason: reason || undefined, delete_message_seconds: 0 });
        toast.success(`Banned ${target.user.username}`);
      } else if (action === "timeout") {
        const until = new Date(Date.now() + timeoutMinutes * 60_000).toISOString();
        await timeoutMember(guildId, userId, until, reason || undefined);
        toast.success(`Timed out ${target.user.username}`);
      } else if (action === "untimeout") {
        await timeoutMember(guildId, userId, null);
        toast.success(`Removed timeout`);
      } else if (action === "nick") {
        await editMember(guildId, userId, { nick: nick.trim() || null });
        toast.success("Nickname updated");
      } else if (action === "roles") {
        await editMember(guildId, userId, { roles: roleIds });
        toast.success("Roles updated");
      } else if (action === "mute") {
        await editMember(guildId, userId, { mute: true });
        toast.success("Server muted");
      } else if (action === "deaf") {
        await editMember(guildId, userId, { deaf: true });
        toast.success("Server deafened");
      }
      setAction(null);
      setTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {members.length > 0
            ? `${members.length} loaded — nick, roles, server mute/deafen, kick, ban, timeout`
            : mode === "live"
              ? "Enable Server Members Intent on the bot to list people."
              : "No members in this sample roster."}
        </p>
      </div>
      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          Nothing to show here yet.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {members.map((m) => {
            const u = m.user;
            if (!u) return null;
            const isSelf = u.id === botId;
            const roleNames = m.roles
              .map((id) => roles.find((r) => r.id === id)?.name)
              .filter((n): n is string => !!n && n !== "@everyone");
            const timedOut =
              m.communication_disabled_until &&
              new Date(m.communication_disabled_until).getTime() > Date.now();
            return (
              <li key={u.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
                <EntityAvatar name={m.nick || u.username} id={u.id} src={userAvatarUrl(u)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.nick || u.global_name || u.username}
                    {u.bot ? <span className="ml-2 text-[10px] uppercase tracking-wide text-stone">Bot</span> : null}
                    {timedOut ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-destructive">Timed out</span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{u.username}
                    {roleNames.length ? ` · ${roleNames.join(", ")}` : ""}
                    {m.joined_at ? ` · joined ${formatRelative(m.joined_at)}` : ""}
                  </p>
                </div>
                {!isSelf ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Member actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {allowManage ? (
                        <>
                          <DropdownMenuItem onClick={() => openAction(m, "nick")}>
                            <UserCog className="size-4" />
                            Nickname
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(m, "roles")}>
                            <UserCog className="size-4" />
                            Roles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(m, "mute")}>
                            <MicOff className="size-4" />
                            Server mute
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(m, "deaf")}>
                            <Headphones className="size-4" />
                            Server deafen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      ) : null}
                      {allowTimeout ? (
                        timedOut ? (
                          <DropdownMenuItem onClick={() => openAction(m, "untimeout")}>
                            <ShieldOff className="size-4" />
                            Remove timeout
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => openAction(m, "timeout")}>
                            <Clock className="size-4" />
                            Timeout
                          </DropdownMenuItem>
                        )
                      ) : null}
                      {allowKick ? (
                        <DropdownMenuItem onClick={() => openAction(m, "kick")}>
                          <UserX className="size-4" />
                          Kick
                        </DropdownMenuItem>
                      ) : null}
                      {allowBan ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => openAction(m, "ban")}>
                            <Ban className="size-4" />
                            Ban
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={action === "timeout" || action === "kick" || action === "ban" || action === "nick" || action === "roles"}
        onOpenChange={(o) => {
          if (!o) {
            setAction(null);
            setTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "kick" && `Kick ${target?.user?.username}?`}
              {action === "ban" && `Ban ${target?.user?.username}?`}
              {action === "timeout" && `Timeout ${target?.user?.username}?`}
              {action === "nick" && `Nickname for ${target?.user?.username}`}
              {action === "roles" && `Roles for ${target?.user?.username}`}
            </DialogTitle>
            <DialogDescription>
              {action === "roles"
                ? "Toggle roles. Managed roles (bots/integrations) are hidden."
                : action === "nick"
                  ? "Leave empty to clear the nickname."
                  : "Confirm this moderation action."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {action === "timeout" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="timeout-min">Duration (minutes)</Label>
                <Input
                  id="timeout-min"
                  type="number"
                  min={1}
                  max={40320}
                  value={timeoutMinutes}
                  onChange={(e) => setTimeoutMinutes(Number(e.target.value) || 60)}
                />
              </div>
            ) : null}
            {action === "nick" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="mem-nick">Nickname</Label>
                <Input id="mem-nick" value={nick} onChange={(e) => setNick(e.target.value)} maxLength={32} />
              </div>
            ) : null}
            {action === "roles" ? (
              <ul className="max-h-60 space-y-1 overflow-y-auto">
                {assignableRoles.map((r) => {
                  const on = roleIds.includes(r.id);
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setRoleIds((cur) => (on ? cur.filter((id) => id !== r.id) : [...cur, r.id]))
                        }
                        className={`flex w-full items-center rounded-md border px-3 py-2 text-left text-sm ${
                          on ? "border-stone/50 bg-stone/10" : "border-border"
                        }`}
                      >
                        {r.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {action === "timeout" || action === "kick" || action === "ban" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="mod-reason">Reason (optional)</Label>
                <Input id="mod-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={512} />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAction(null); setTarget(null); }}>
              Cancel
            </Button>
            <Button variant={action === "ban" ? "destructive" : "default"} onClick={() => void confirm()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={action === "untimeout" || action === "mute" || action === "deaf"}
        onOpenChange={(o) => {
          if (!o) {
            setAction(null);
            setTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "untimeout" && `Remove timeout from ${target?.user?.username}?`}
              {action === "mute" && `Server mute ${target?.user?.username}?`}
              {action === "deaf" && `Server deafen ${target?.user?.username}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "mute" || action === "deaf"
                ? "This is a server-wide voice flag (not the bot self-mute). Needs Mute Members / Deafen Members."
                : "They can chat again immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirm()}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
