import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRelay } from "@/lib/discord/store";
import { COMMAND_TYPES, type DiscordApplicationCommand } from "@/lib/discord/types";

export function CommandManager({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const application = useRelay((s) => s.application);
  const guildCommands = useRelay((s) => s.commands.guild[guildId] ?? []);
  const globalCommands = useRelay((s) => s.commands.global);
  const loadCommands = useRelay((s) => s.loadCommands);
  const createCommand = useRelay((s) => s.createCommand);
  const deleteCommand = useRelay((s) => s.deleteCommand);

  const [scope, setScope] = useState<"guild" | "global">("guild");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(String(COMMAND_TYPES.CHAT_INPUT));
  const [pendingDelete, setPendingDelete] = useState<DiscordApplicationCommand | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (scope === "guild") void loadCommands(guildId);
    else void loadCommands();
  }, [scope, guildId, loadCommands]);

  const list = scope === "guild" ? guildCommands : globalCommands;

  async function onCreate() {
    const n = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!n || !description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    if (mode === "demo") {
      toast.message("Slash commands need a live bot");
      return;
    }
    if (!application) {
      toast.error("Application profile unavailable for this bot");
      return;
    }
    setBusy(true);
    try {
      await createCommand(
        {
          name: n,
          description: description.trim(),
          type: Number(type),
        },
        scope === "guild" ? guildId : undefined,
      );
      toast.success(scope === "guild" ? "Guild command created" : "Global command created (can take up to 1h)");
      setOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create command");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Slash commands</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Register application commands for this server or globally.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={scope} onValueChange={(v) => setScope(v as "guild" | "global")}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guild">This server</SelectItem>
              <SelectItem value="global">Global</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New command
          </Button>
        </div>
      </div>

      {mode === "demo" ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
          Connect a live bot to manage slash commands.
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          No {scope} commands yet.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">/{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.description || "No description"}
                  {c.type === COMMAND_TYPES.USER
                    ? " · user"
                    : c.type === COMMAND_TYPES.MESSAGE
                      ? " · message"
                      : " · chat"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete command"
                onClick={() => setPendingDelete(c)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New slash command</DialogTitle>
            <DialogDescription>
              {scope === "global"
                ? "Global commands can take up to an hour to appear in Discord."
                : "Guild commands appear almost immediately in this server."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="cmd-name">Name</Label>
              <Input
                id="cmd-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ping"
                maxLength={32}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cmd-desc">Description</Label>
              <Textarea
                id="cmd-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Replies with pong"
                maxLength={100}
                className="min-h-16"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(COMMAND_TYPES.CHAT_INPUT)}>Chat input</SelectItem>
                  <SelectItem value={String(COMMAND_TYPES.USER)}>User</SelectItem>
                  <SelectItem value={String(COMMAND_TYPES.MESSAGE)}>Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void onCreate()} disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete /{pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This removes the command from Discord.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteCommand(pendingDelete.id, scope === "guild" ? guildId : undefined);
                  toast.success("Command deleted");
                  setPendingDelete(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not delete");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
