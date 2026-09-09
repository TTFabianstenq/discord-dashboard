import { useState } from "react";
import { MoreHorizontal, ShieldOff, UserX, Ban, Clock } from "lucide-react";
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

type Action = "kick" | "ban" | "timeout" | "untimeout" | null;

export function MembersPanel({ guildId }: { guildId: string }) {
  const members = useRelay((s) => s.members[guildId] ?? EMPTY_MEMBERS);
  const roles = useRelay((s) => s.roles[guildId] ?? EMPTY_ROLES);
  const guild = useRelay((s) => s.guilds.find((g) => g.id === guildId));
  const botId = useRelay((s) => s.bot?.id);
  const mode = useRelay((s) => s.mode);
  const kickMember = useRelay((s) => s.kickMember);
  const banMember = useRelay((s) => s.banMember);
  const timeoutMember = useRelay((s) => s.timeoutMember);

  const [target, setTarget] = useState<DiscordMember | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState("");
  const [timeoutMinutes, setTimeoutMinutes] = useState(60);

  const perms = guild?.permissions;
  const allowKick = mode === "demo" || canKick(perms);
  const allowBan = mode === "demo" || canBan(perms);
  const allowTimeout = mode === "demo" || canModerate(perms);

  function openAction(m: DiscordMember, a: Action) {
    setTarget(m);
    setAction(a);
    setReason("");
    setTimeoutMinutes(60);
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
        toast.success(`Timed out ${target.user.username} for ${timeoutMinutes}m`);
      } else if (action === "untimeout") {
        await timeoutMember(guildId, userId, null);
        toast.success(`Removed timeout from ${target.user.username}`);
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
            ? `${members.length} loaded`
            : mode === "live"
              ? "The Server Members Intent must be enabled on this bot to list people."
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
                    {u.bot ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-stone">Bot</span>
                    ) : null}
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
                {!isSelf && !u.bot ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Member actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                      {!allowKick && !allowBan && !allowTimeout ? (
                        <DropdownMenuItem disabled>Missing moderation permissions</DropdownMenuItem>
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
        open={action === "timeout" || action === "kick" || action === "ban"}
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
            </DialogTitle>
            <DialogDescription>
              {action === "ban"
                ? "They will not be able to rejoin until unbanned."
                : action === "kick"
                  ? "They can rejoin with a new invite."
                  : "They cannot send messages or join voice until the timeout ends."}
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
            <div className="grid gap-1.5">
              <Label htmlFor="mod-reason">Reason (optional)</Label>
              <Input id="mod-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={512} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={action === "ban" ? "destructive" : "default"}
              onClick={() => void confirm()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={action === "untimeout"}
        onOpenChange={(o) => {
          if (!o) {
            setAction(null);
            setTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove timeout from {target?.user?.username}?</AlertDialogTitle>
            <AlertDialogDescription>They will be able to chat and join voice again immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirm()}>Remove timeout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
