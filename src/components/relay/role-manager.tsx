import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { canManageRoles } from "@/lib/discord/permissions";
import { intToHex, hexToInt } from "@/lib/discord/format";
import { useRelay } from "@/lib/discord/store";
import type { DiscordRole } from "@/lib/discord/types";

type Draft = {
  name: string;
  color: string;
  hoist: boolean;
  mentionable: boolean;
};

const emptyDraft: Draft = {
  name: "",
  color: "#99aab5",
  hoist: false,
  mentionable: false,
};

export function RoleManager({ guildId }: { guildId: string }) {
  const roles = useRelay((s) => s.roles[guildId] ?? []);
  const guild = useRelay((s) => s.guilds.find((g) => g.id === guildId));
  const createRole = useRelay((s) => s.createRole);
  const editRole = useRelay((s) => s.editRole);
  const deleteRole = useRelay((s) => s.deleteRole);
  const mode = useRelay((s) => s.mode);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DiscordRole | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pendingDelete, setPendingDelete] = useState<DiscordRole | null>(null);

  const allowed = mode === "demo" || canManageRoles(guild?.permissions);
  const sorted = [...roles].sort((a, b) => b.position - a.position);

  function startCreate() {
    setEditing(null);
    setDraft(emptyDraft);
    setOpen(true);
  }

  function startEdit(role: DiscordRole) {
    setEditing(role);
    setDraft({
      name: role.name,
      color: intToHex(role.color),
      hoist: role.hoist,
      mentionable: role.mentionable,
    });
    setOpen(true);
  }

  async function save() {
    try {
      if (!draft.name.trim()) throw new Error("Name is required.");
      if (draft.name === "@everyone") throw new Error("Cannot name a role @everyone.");
      const payload = {
        name: draft.name.trim(),
        color: hexToInt(draft.color),
        hoist: draft.hoist,
        mentionable: draft.mentionable,
      };
      if (editing) {
        await editRole(guildId, editing.id, payload);
        toast.success("Role updated");
      } else {
        await createRole(guildId, payload);
        toast.success("Role created");
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save role");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Roles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and edit roles. Managed roles (integrations) cannot be deleted.
            {!allowed && mode === "live" ? " The bot needs Manage Roles." : ""}
          </p>
        </div>
        <Button onClick={startCreate} disabled={!allowed}>
          <Plus className="size-4" />
          New role
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          No roles loaded.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border">
          {sorted.map((role) => {
            const color = role.color ? intToHex(role.color) : "#99aab5";
            const isEveryone = role.id === guildId;
            return (
              <li
                key={role.id}
                className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0"
              >
                <span
                  className="size-3 shrink-0 rounded-full border border-border"
                  style={{ background: color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: role.color ? color : undefined }}>
                    {role.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    position {role.position}
                    {role.hoist ? " · displayed separately" : ""}
                    {role.mentionable ? " · mentionable" : ""}
                    {role.managed ? " · managed" : ""}
                  </p>
                </div>
                {!isEveryone && !role.managed ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEdit(role)}
                      disabled={!allowed}
                      aria-label="Edit role"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setPendingDelete(role)}
                      disabled={!allowed}
                      aria-label="Delete role"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "New role"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Changes apply immediately on the live server."
                : "The bot can only manage roles below its highest role."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Moderator"
                maxLength={100}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role-color">Color</Label>
              <Input
                id="role-color"
                type="color"
                value={draft.color}
                onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                className="h-11 w-20 p-1"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <Label htmlFor="role-hoist">Display role members separately</Label>
              <Switch
                id="role-hoist"
                checked={draft.hoist}
                onCheckedChange={(v) => setDraft({ ...draft, hoist: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <Label htmlFor="role-mention">Allow anyone to @mention this role</Label>
              <Switch
                id="role-mention"
                checked={draft.mentionable}
                onCheckedChange={(v) => setDraft({ ...draft, mentionable: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Members with only this role will keep other roles. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteRole(guildId, pendingDelete.id);
                  toast.success("Role deleted");
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
