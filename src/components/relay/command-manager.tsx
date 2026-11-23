import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Lock,
  MessageSquareReply,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { userAvatarUrl } from "@/lib/discord/cdn";
import {
  ACTION_INFO,
  COMMAND_PRESETS,
  DEFAULT_REPLY,
  TEMPLATE_VARIABLES,
  buildReply,
  sampleInteraction,
  useResponder,
  type CommandPreset,
  type CommandReply,
  type ReplyAction,
} from "@/lib/discord/responder";
import { useRelay } from "@/lib/discord/store";
import {
  COMMAND_TYPES,
  type DiscordApplicationCommand,
  type DiscordApplicationCommandOption,
} from "@/lib/discord/types";
import { cn } from "@/lib/utils";
import { DiscordMessagePreview } from "./discord-preview";

const EMPTY_COMMANDS: DiscordApplicationCommand[] = [];
const EMPTY_REPLIES: Record<string, CommandReply> = {};

const OPTION_TYPES: { value: number; label: string }[] = [
  { value: 3, label: "Text" },
  { value: 4, label: "Whole number" },
  { value: 10, label: "Number" },
  { value: 5, label: "True / false" },
  { value: 6, label: "User" },
  { value: 7, label: "Channel" },
  { value: 8, label: "Role" },
  { value: 9, label: "User or role" },
  { value: 11, label: "File" },
];

const NAME_RE = /^[-_\p{Ll}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

function typeLabel(t: number) {
  return t === COMMAND_TYPES.USER ? "User menu" : t === COMMAND_TYPES.MESSAGE ? "Message menu" : "Slash";
}

function commandLabel(c: { name: string; type: number }) {
  return c.type === COMMAND_TYPES.CHAT_INPUT ? `/${c.name}` : c.name;
}

type Scope = "guild" | "global";

export function CommandManager({ guildId }: { guildId: string }) {
  const mode = useRelay((s) => s.mode);
  const bot = useRelay((s) => s.bot);
  const application = useRelay((s) => s.application);
  const gatewayConnected = useRelay((s) => s.gatewayConnected);
  const guildCommands = useRelay((s) => s.commands.guild[guildId] ?? EMPTY_COMMANDS);
  const globalCommands = useRelay((s) => s.commands.global);
  const loadCommands = useRelay((s) => s.loadCommands);
  const createCommand = useRelay((s) => s.createCommand);
  const editCommand = useRelay((s) => s.editCommand);
  const deleteCommand = useRelay((s) => s.deleteCommand);

  const appId = application?.id ?? bot?.id ?? "";
  const replies = useResponder((s) => s.replies[appId] ?? EMPTY_REPLIES);
  const setReply = useResponder((s) => s.setReply);
  const renameReply = useResponder((s) => s.renameReply);
  const log = useResponder((s) => s.log);
  const clearLog = useResponder((s) => s.clearLog);

  const [scope, setScope] = useState<Scope>("guild");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ command: DiscordApplicationCommand | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DiscordApplicationCommand | null>(null);
  const [addingPreset, setAddingPreset] = useState<string | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await Promise.all([loadCommands(guildId), loadCommands()]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load commands from Discord.");
    } finally {
      setLoading(false);
    }
  }, [guildId, loadCommands]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const list = scope === "guild" ? guildCommands : globalCommands;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter((c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
  }, [list, query]);

  const withReply = list.filter((c) => replies[c.name]?.enabled).length;
  const existingNames = new Set(list.map((c) => `${c.type}:${c.name}`));

  async function addPreset(p: CommandPreset) {
    setAddingPreset(p.id);
    try {
      await createCommand(
        {
          name: p.command.name,
          description: p.command.description,
          type: p.command.type,
          options: p.command.options,
          default_member_permissions: p.command.default_member_permissions ?? null,
        },
        scope === "guild" ? guildId : undefined,
      );
      if (appId) setReply(appId, p.command.name, p.reply);
      toast.success(`${commandLabel(p.command)} is ready`, {
        description:
          scope === "guild"
            ? "Try it in Discord now — BotDeck answers while this tab is open."
            : "Global commands can take a little while to show up in Discord.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add command");
    } finally {
      setAddingPreset(null);
    }
  }

  const responderState: { tone: "on" | "warn" | "demo"; title: string; body: string } =
    mode === "demo"
      ? {
          tone: "demo",
          title: "Sample mode",
          body: "Everything here works locally. Connect your real bot token to push commands to Discord.",
        }
      : gatewayConnected
        ? {
            tone: "on",
            title: "Auto-replies are live",
            body: `BotDeck is answering ${withReply} ${withReply === 1 ? "command" : "commands"} in this list while this tab stays open.`,
          }
        : {
            tone: "warn",
            title: "Connecting to Discord…",
            body: "Auto-replies start once the bot's live connection is up.",
          };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Tools</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight">Slash commands</h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Create commands, then pick what the bot replies with. No code needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setEditor({ command: null })}>
            <Plus className="size-4" />
            New command
          </Button>
        </div>
      </div>

      {/* Responder status */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-4 sm:p-5",
          responderState.tone === "on" && "border-success/30 bg-success/[0.07]",
          responderState.tone === "warn" && "border-amber-400/30 bg-amber-400/[0.07]",
          responderState.tone === "demo" && "border-primary/30 bg-primary/[0.07]",
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              responderState.tone === "on" && "bg-success/15 text-success",
              responderState.tone === "warn" && "bg-amber-400/15 text-amber-300",
              responderState.tone === "demo" && "bg-primary/15 text-primary",
            )}
          >
            {responderState.tone === "on" ? <Zap className="size-5" /> : <Bot className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-medium">
              {responderState.title}
              {responderState.tone === "on" ? (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{responderState.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowHowTo((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            How it works
            <ChevronDown className={cn("size-3.5 transition-transform", showHowTo && "rotate-180")} />
          </button>
        </div>
        {showHowTo ? (
          <ol className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm text-muted-foreground sm:grid-cols-3">
            <li>
              <span className="mb-1 block font-medium text-foreground">1 · Register</span>
              Creating a command tells Discord it exists. Server commands show up instantly; global ones can take a while.
            </li>
            <li>
              <span className="mb-1 block font-medium text-foreground">2 · Pick a reply</span>
              Give it an auto-reply (text, embed, or a built-in like /ping or /userinfo). Discord needs an answer within 3
              seconds.
            </li>
            <li>
              <span className="mb-1 block font-medium text-foreground">3 · Keep BotDeck open</span>
              BotDeck answers through your bot's live connection while this tab is open. Commands with no BotDeck reply are left
              for your own bot code to handle.
            </li>
          </ol>
        ) : null}
      </div>

      {loadError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Couldn't load commands</p>
            <p className="mt-0.5 text-muted-foreground">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* Scope + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(
            [
              ["guild", "This server", guildCommands.length],
              ["global", "Global", globalCommands.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setScope(id)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm transition-colors",
                scope === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-md px-1.5 text-[11px] tabular-nums",
                  scope === id ? "bg-black/20" : "bg-secondary",
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands"
            className="h-11 pl-9"
          />
        </div>
      </div>

      {/* Command list */}
      {loading && list.length === 0 ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <p className="font-medium">{query ? "No commands match that search" : `No ${scope === "guild" ? "server" : "global"} commands yet`}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Try another name." : "Start from a ready-made command below or build your own."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((c) => {
            const reply = replies[c.name];
            const locked = c.default_member_permissions != null && c.default_member_permissions !== "";
            return (
              <li
                key={c.id}
                className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono text-lg text-primary">
                  {c.type === COMMAND_TYPES.CHAT_INPUT ? "/" : <MessageSquareReply className="size-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-mono text-[15px] font-medium">{commandLabel(c)}</span>
                    {c.type !== COMMAND_TYPES.CHAT_INPUT ? (
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {typeLabel(c.type)}
                      </span>
                    ) : null}
                    {locked ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <Lock className="size-3" /> Restricted
                      </span>
                    ) : null}
                    {(c.options ?? []).map((o) => (
                      <span
                        key={o.name}
                        className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {o.name}
                        {o.required ? "" : "?"}
                      </span>
                    ))}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {c.description || (c.type === COMMAND_TYPES.CHAT_INPUT ? "No description" : "Right-click menu command")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {reply?.enabled ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs text-success">
                      <Zap className="size-3" />
                      {ACTION_INFO[reply.action].label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditor({ command: c })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-400/20"
                      title="Nothing in BotDeck answers this command. Your bot's own code has to, or Discord shows 'The application did not respond'."
                    >
                      <AlertTriangle className="size-3" />
                      No reply set
                    </button>
                  )}
                  <Button variant="ghost" size="icon-sm" aria-label={`Edit ${c.name}`} onClick={() => setEditor({ command: c })}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${c.name}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingDelete(c)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Presets */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold">Quick add</h3>
          <p className="text-xs text-muted-foreground">
            One click registers it {scope === "guild" ? "in this server" : "globally"} and sets up the reply.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {COMMAND_PRESETS.map((p) => {
            const exists = existingNames.has(`${p.command.type}:${p.command.name}`);
            return (
              <button
                key={p.id}
                type="button"
                disabled={exists || addingPreset !== null}
                onClick={() => void addPreset(p)}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-12px] hover:shadow-primary/40 disabled:pointer-events-none disabled:opacity-45"
              >
                <span className="text-xl leading-none">{p.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm">
                    {commandLabel(p.command)}
                    {addingPreset === p.id ? "…" : ""}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {exists ? "Already added" : p.command.description || "User right-click menu"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Activity */}
      {mode !== "demo" ? (
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h3 className="text-sm font-medium">Recent command runs</h3>
            {log.length ? (
              <Button variant="ghost" size="sm" onClick={clearLog}>
                Clear
              </Button>
            ) : null}
          </div>
          {log.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              When someone uses a command BotDeck answers, it shows up here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {log.slice(0, 10).map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  {e.ok ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-destructive" />
                  )}
                  <span className="font-mono">{e.command}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    by {e.user}
                    {e.guildName ? ` in ${e.guildName}` : ""} · {e.detail}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {editor ? (
        <CommandEditor
          key={editor.command?.id ?? "new"}
          command={editor.command}
          scope={scope}
          guildId={guildId}
          initialReply={editor.command ? replies[editor.command.name] : undefined}
          botName={bot?.username ?? "Bot"}
          botAvatar={bot ? userAvatarUrl(bot) : null}
          onClose={() => setEditor(null)}
          onSave={async (payload, reply) => {
            const target = scope === "guild" ? guildId : undefined;
            if (editor.command) {
              // A command's type can't change after it's created, so don't send it on edit.
              const { type: _type, ...patch } = payload;
              void _type;
              await editCommand(editor.command.id, patch, target);
              if (appId && editor.command.name !== payload.name) renameReply(appId, editor.command.name, payload.name);
            } else {
              await createCommand(payload, target);
            }
            if (appId) setReply(appId, payload.name, reply);
            toast.success(editor.command ? "Command updated" : "Command created", {
              description: reply?.enabled
                ? "BotDeck will answer it while this tab is open."
                : "No auto-reply — your bot's own code needs to answer it.",
            });
            setEditor(null);
          }}
        />
      ) : null}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete ? commandLabel(pendingDelete) : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the command from Discord{scope === "global" ? " everywhere" : " in this server"}. Its BotDeck reply is
              removed too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteCommand(pendingDelete.id, scope === "guild" ? guildId : undefined);
                  if (appId) setReply(appId, pendingDelete.name, null);
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

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

type DraftOption = { key: string; type: number; name: string; description: string; required: boolean };

type CommandPayload = {
  name: string;
  description: string;
  type: number;
  options?: DiscordApplicationCommandOption[];
  default_member_permissions: string | null;
  nsfw: boolean;
};

const PERMISSION_CHOICES: { value: string; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "8192", label: "Manage Messages" },
  { value: "2", label: "Kick Members" },
  { value: "4", label: "Ban Members" },
  { value: "32", label: "Manage Server" },
  { value: "8", label: "Administrators only" },
];

function CommandEditor({
  command,
  scope,
  guildId,
  initialReply,
  botName,
  botAvatar,
  onClose,
  onSave,
}: {
  command: DiscordApplicationCommand | null;
  scope: Scope;
  guildId: string;
  initialReply?: CommandReply;
  botName: string;
  botAvatar: string | null;
  onClose: () => void;
  onSave: (payload: CommandPayload, reply: CommandReply | null) => Promise<void>;
}) {
  const guilds = useRelay((s) => s.guilds);
  const commands = useRelay((s) => s.commands);
  const isEdit = !!command;

  const [type, setType] = useState<number>(command?.type ?? COMMAND_TYPES.CHAT_INPUT);
  const [name, setName] = useState(command?.name ?? "");
  const [description, setDescription] = useState(command?.description ?? "");
  const [options, setOptions] = useState<DraftOption[]>(
    (command?.options ?? [])
      .filter((o) => o.type !== 1 && o.type !== 2)
      .map((o, i) => ({ key: `o${i}`, type: o.type, name: o.name, description: o.description, required: !!o.required })),
  );
  const hasSubcommands = (command?.options ?? []).some((o) => o.type === 1 || o.type === 2);
  const [permission, setPermission] = useState<string>(command?.default_member_permissions ?? "everyone");
  const [nsfw, setNsfw] = useState(!!command?.nsfw);
  const [reply, setReplyDraft] = useState<CommandReply>(
    initialReply ?? { ...DEFAULT_REPLY, enabled: !isEdit },
  );
  const [busy, setBusy] = useState(false);

  const isSlash = type === COMMAND_TYPES.CHAT_INPUT;
  const cleanName = isSlash ? name.trim().toLowerCase().replace(/\s+/g, "-") : name.trim();

  const problems: string[] = [];
  if (!cleanName) problems.push("Give the command a name.");
  else if (isSlash && !NAME_RE.test(cleanName))
    problems.push("Slash command names: 1–32 lowercase letters, numbers, - or _.");
  else if (!isSlash && cleanName.length > 32) problems.push("Name must be 32 characters or less.");
  if (isSlash && !description.trim()) problems.push("Slash commands need a description.");
  if (isSlash) {
    const seen = new Set<string>();
    for (const o of options) {
      const n = o.name.trim().toLowerCase();
      if (!n || !NAME_RE.test(n)) problems.push(`Option "${o.name || "(blank)"}" needs a valid lowercase name.`);
      else if (seen.has(n)) problems.push(`Two options are named "${n}".`);
      seen.add(n);
      if (!o.description.trim()) problems.push(`Option "${n || "(blank)"}" needs a description.`);
    }
  }
  if (reply.enabled && reply.action === "text" && !reply.content.trim()) problems.push("Write the reply message.");

  const preview = useMemo(() => {
    if (!reply.enabled) return null;
    const i = sampleInteraction(guildId, cleanName || "command");
    try {
      return buildReply(reply, i as never, { guilds, commands });
    } catch {
      return null;
    }
  }, [reply, guildId, cleanName, guilds, commands]);

  function addOption() {
    setOptions((prev) => [
      ...prev,
      { key: `o${Date.now()}`, type: 3, name: "", description: "", required: false },
    ]);
  }

  function updateOption(key: string, patch: Partial<DraftOption>) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)));
  }

  async function save() {
    if (problems.length) {
      toast.error(problems[0]);
      return;
    }
    setBusy(true);
    try {
      const payload: CommandPayload = {
        name: cleanName,
        description: isSlash ? description.trim() : "",
        type,
        default_member_permissions: permission === "everyone" ? null : permission,
        nsfw,
      };
      if (isSlash && !hasSubcommands) {
        // Discord requires required options before optional ones.
        payload.options = [...options]
          .sort((a, b) => Number(b.required) - Number(a.required))
          .map((o) => ({
            type: o.type,
            name: o.name.trim().toLowerCase(),
            description: o.description.trim().slice(0, 100),
            required: o.required,
          }));
      }
      await onSave(payload, reply.enabled ? reply : null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save command");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{isEdit ? `Edit ${commandLabel(command!)}` : "New command"}</DialogTitle>
          <DialogDescription>
            {scope === "global"
              ? "Global commands work in every server the bot is in and can take a while to appear."
              : "Server commands appear in this server right away."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)]">
          <div className="grid content-start gap-5">
            {/* Basics */}
            <fieldset className="grid gap-3">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Command</legend>
              {!isEdit ? (
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-background p-1">
                  {[
                    [COMMAND_TYPES.CHAT_INPUT, "Slash /"],
                    [COMMAND_TYPES.USER, "User menu"],
                    [COMMAND_TYPES.MESSAGE, "Message menu"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setType(v as number)}
                      className={cn(
                        "h-9 rounded-lg text-sm transition-colors",
                        type === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="grid gap-1.5">
                <Label htmlFor="cmd-name">Name</Label>
                <div className="relative">
                  {isSlash ? (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                      /
                    </span>
                  ) : null}
                  <Input
                    id="cmd-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isSlash ? "ping" : "Report message"}
                    maxLength={32}
                    className={cn("font-mono", isSlash && "pl-6")}
                  />
                </div>
                {isSlash && name && cleanName !== name ? (
                  <p className="text-xs text-muted-foreground">
                    Will be saved as <span className="font-mono text-foreground">/{cleanName}</span>
                  </p>
                ) : null}
              </div>
              {isSlash ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="cmd-desc">Description</Label>
                  <Input
                    id="cmd-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Replies with pong"
                    maxLength={100}
                  />
                </div>
              ) : (
                <p className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                  {type === COMMAND_TYPES.USER ? "Shows up when you right-click a user → Apps." : "Shows up when you right-click a message → Apps."}
                </p>
              )}
            </fieldset>

            {/* Options */}
            {isSlash ? (
              <fieldset className="grid gap-2">
                <div className="mb-1 flex items-center justify-between">
                  <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Options</legend>
                  {!hasSubcommands ? (
                    <Button type="button" variant="ghost" size="sm" onClick={addOption} disabled={options.length >= 25}>
                      <Plus className="size-3.5" /> Add option
                    </Button>
                  ) : null}
                </div>
                {hasSubcommands ? (
                  <p className="text-xs text-muted-foreground">
                    This command has subcommands. BotDeck keeps them as they are when you save.
                  </p>
                ) : options.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                    No options. Add one to let people pass a user, some text, a number…
                  </p>
                ) : (
                  options.map((o) => (
                    <div key={o.key} className="grid gap-2 rounded-xl border border-border bg-background/60 p-3">
                      <div className="flex gap-2">
                        <Input
                          value={o.name}
                          onChange={(e) => updateOption(o.key, { name: e.target.value })}
                          placeholder="name"
                          maxLength={32}
                          className="h-9 flex-1 font-mono"
                        />
                        <Select value={String(o.type)} onValueChange={(v) => updateOption(o.key, { type: Number(v) })}>
                          <SelectTrigger className="h-9 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPTION_TYPES.map((t) => (
                              <SelectItem key={t.value} value={String(t.value)}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove option"
                          onClick={() => setOptions((prev) => prev.filter((x) => x.key !== o.key))}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <Input
                        value={o.description}
                        onChange={(e) => updateOption(o.key, { description: e.target.value })}
                        placeholder="What should people put here?"
                        maxLength={100}
                        className="h-9"
                      />
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Switch checked={o.required} onCheckedChange={(v) => updateOption(o.key, { required: v })} />
                        Required
                      </label>
                    </div>
                  ))
                )}
              </fieldset>
            ) : null}

            {/* Permissions */}
            <fieldset className="grid gap-3">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Who can use it</legend>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_CHOICES.some((p) => p.value === permission) ? null : (
                    <SelectItem value={permission}>Custom ({permission})</SelectItem>
                  )}
                  {PERMISSION_CHOICES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={nsfw} onCheckedChange={setNsfw} />
                Age-restricted (only in NSFW channels)
              </label>
            </fieldset>
          </div>

          {/* Reply */}
          <div className="grid content-start gap-4 rounded-2xl border border-primary/25 bg-primary/[0.05] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Zap className="size-4 text-primary" /> Auto-reply
                </p>
                <p className="text-xs text-muted-foreground">BotDeck answers this command for you.</p>
              </div>
              <Switch checked={reply.enabled} onCheckedChange={(v) => setReplyDraft((r) => ({ ...r, enabled: v }))} />
            </div>

            {reply.enabled ? (
              <>
                <div className="grid gap-1.5">
                  <Label>Reply with</Label>
                  <Select
                    value={reply.action}
                    onValueChange={(v) => setReplyDraft((r) => ({ ...r, action: v as ReplyAction }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ACTION_INFO) as ReplyAction[]).map((a) => (
                        <SelectItem key={a} value={a}>
                          {ACTION_INFO[a].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{ACTION_INFO[reply.action].hint}</p>
                </div>

                {reply.action === "text" || reply.action === "help" || reply.action === "ping" || reply.action === "userinfo" || reply.action === "serverinfo" || reply.action === "roll" || reply.action === "coinflip" ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="reply-text">{reply.action === "text" ? "Message" : "Extra text (optional)"}</Label>
                    <Textarea
                      id="reply-text"
                      value={reply.content}
                      onChange={(e) => setReplyDraft((r) => ({ ...r, content: e.target.value }))}
                      placeholder={reply.action === "text" ? "Hey {user}, welcome to {server}!" : ""}
                      maxLength={reply.embed ? 4000 : 2000}
                      className="min-h-24 font-mono text-[13px]"
                    />
                    <div className="flex flex-wrap gap-1">
                      {TEMPLATE_VARIABLES.map((v) => (
                        <button
                          key={v.token}
                          type="button"
                          title={v.meaning}
                          onClick={() => setReplyDraft((r) => ({ ...r, content: `${r.content}${v.token}` }))}
                          className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        >
                          {v.token}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {reply.action === "text" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={reply.embed} onCheckedChange={(v) => setReplyDraft((r) => ({ ...r, embed: v }))} />
                    Send as an embed
                  </label>
                ) : null}
                {reply.action === "text" && reply.embed ? (
                  <Input
                    value={reply.embedTitle}
                    onChange={(e) => setReplyDraft((r) => ({ ...r, embedTitle: e.target.value }))}
                    placeholder="Embed title (optional)"
                    maxLength={256}
                  />
                ) : null}
                {reply.embed || ["8ball", "avatar", "userinfo", "serverinfo", "help"].includes(reply.action) ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="color"
                      value={reply.color}
                      onChange={(e) => setReplyDraft((r) => ({ ...r, color: e.target.value }))}
                      className="size-8 cursor-pointer rounded-md border border-border bg-transparent"
                    />
                    Embed colour
                  </label>
                ) : null}
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={reply.ephemeral} onCheckedChange={(v) => setReplyDraft((r) => ({ ...r, ephemeral: v }))} />
                  Only visible to the person who ran it
                </label>

                <div className="grid gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Preview</p>
                  {preview ? (
                    <DiscordMessagePreview
                      botName={botName}
                      botAvatar={botAvatar}
                      commandLabel={isSlash ? `/${cleanName || "command"}` : cleanName || "command"}
                      content={preview.content}
                      embeds={preview.embeds}
                      ephemeral={reply.ephemeral}
                    />
                  ) : null}
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                With auto-reply off, your bot's own code must answer this command — otherwise Discord shows
                “The application did not respond”.
              </p>
            )}
          </div>
        </div>

        {problems.length ? (
          <p className="text-xs text-amber-300">{problems[0]}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create command"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
