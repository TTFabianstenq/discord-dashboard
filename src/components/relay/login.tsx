import { useEffect, useState, type FormEvent } from "react";
import { Code2, Eye, EyeOff, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRelay } from "@/lib/discord/store";
import { RelayMark } from "./mark";

const ACK_KEY = "botdeck.intents_ack";
const SOURCE_URL = "https://github.com/TTFabianstenq/discord-dashboard";

export function LoginScreen() {
  const connectLive = useRelay((s) => s.connectLive);
  const connectDemo = useRelay((s) => s.connectDemo);
  const connecting = useRelay((s) => s.connecting);
  const error = useRelay((s) => s.error);
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const [mask, setMask] = useState(false);
  const [guide, setGuide] = useState(false);
  const [acked, setAcked] = useState(false);

  useEffect(() => {
    setMask(true);
    try {
      if (sessionStorage.getItem(ACK_KEY) === "1") setAcked(true);
    } catch {
      /* ignore */
    }
  }, []);

  function acceptIntentsWarning() {
    try {
      sessionStorage.setItem(ACK_KEY, "1");
    } catch {
      /* ignore */
    }
    setAcked(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await connectLive(token);
      toast.success("Bot connected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not connect");
    }
  }

  if (!acked) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
          <span className="inline-flex items-center gap-2.5">
            <RelayMark className="size-7" />
            <span className="font-serif text-xl tracking-tight">BotDeck</span>
          </span>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Code2 className="size-3.5" />
            Source code
          </a>
        </header>
        <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-6 px-5 pb-16 pt-6 sm:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/90">Required setup</p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Turn on Privileged Gateway Intents</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Discord will not send message text, member lists, or presence data unless these are enabled on your bot
              in the Developer Portal. BotDeck cannot bypass this.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 sm:p-5">
            <p className="text-sm font-medium text-amber-50">Enable all of these under Bot → Privileged Gateway Intents:</p>
            <ul className="mt-3 space-y-3 text-sm text-amber-50/95">
              <li className="rounded-lg border border-amber-500/25 bg-black/20 px-3 py-2.5">
                <p className="font-medium">Message Content Intent</p>
                <p className="mt-0.5 text-xs text-amber-100/80">
                  Without this, Chat shows names and times but <strong>no message text</strong>.
                </p>
              </li>
              <li className="rounded-lg border border-amber-500/25 bg-black/20 px-3 py-2.5">
                <p className="font-medium">Server Members Intent</p>
                <p className="mt-0.5 text-xs text-amber-100/80">
                  Without this, the Members tab is empty or incomplete.
                </p>
              </li>
              <li className="rounded-lg border border-amber-500/25 bg-black/20 px-3 py-2.5">
                <p className="font-medium">Presence Intent</p>
                <p className="mt-0.5 text-xs text-amber-100/80">
                  Optional for most of BotDeck, but turn it on if you care about live presence data from Discord.
                </p>
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-amber-100/85">
              Path:{" "}
              <a
                className="underline"
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noreferrer"
              >
                Discord Developer Portal
              </a>{" "}
              → your app → <strong>Bot</strong> → Privileged Gateway Intents → toggle on → <strong>Save Changes</strong>.
              Under 10,000 users this is a free toggle (no Discord review).
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={acceptIntentsWarning}>
              I turned them on — continue
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.open("https://discord.com/developers/applications", "_blank", "noopener,noreferrer");
              }}
            >
              Open Developer Portal
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            You can still connect without them, but chat text and members will not work correctly.
          </p>
          <button
            type="button"
            className="text-center text-xs text-muted-foreground underline hover:text-foreground"
            onClick={acceptIntentsWarning}
          >
            Skip warning and continue anyway
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -10%, color-mix(in oklab, var(--color-stone) 14%, transparent), transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
        <span className="inline-flex items-center gap-2.5">
          <RelayMark className="size-7" />
          <span className="font-serif text-xl tracking-tight">BotDeck</span>
        </span>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted-foreground sm:block">Anyone with a bot token can use this.</p>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Code2 className="size-3.5" />
            Source code
          </a>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:pt-12">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-stone">Bot console</p>
          <h1 className="font-serif text-[2.6rem] leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.4rem]">
            A console for every Discord bot.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Paste a bot token to send messages, edit channels, manage roles, webhooks, slash commands, and more.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Send and edit messages as the bot",
              "Create, rename, and delete channels",
              "Webhooks and slash commands",
              "Status, activity, and voice join",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-7">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <h2 className="font-serif text-2xl tracking-tight">Connect a bot</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use a bot token from the Discord Developer Portal — not a user token.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="token">Bot token</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="token"
                  autoComplete="off"
                  spellCheck={false}
                  type={show || !mask ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your bot token"
                  className="h-12 pl-10 pr-11 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide token" : "Show token"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" disabled={connecting || token.trim().length < 20}>
              {connecting ? "Connecting…" : "Open console"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                connectDemo();
                toast.success("Sample bot loaded");
              }}
            >
              Try a sample bot
            </Button>

            <div className="flex items-start gap-2 rounded-md bg-secondary/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              <Shield className="mt-0.5 size-3.5 shrink-0 text-stone" />
              <span>
                The token stays in this browser tab and is sent only to Discord through BotDeck. Close the tab to
                forget it. Full source is public on GitHub.
              </span>
            </div>
          </form>

          <button
            type="button"
            onClick={() => setGuide((v) => !v)}
            className="mt-5 text-left text-xs font-medium text-stone hover:underline"
          >
            {guide ? "Hide token steps" : "How to get a bot token"}
          </button>
          {guide ? (
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>Open the Discord Developer Portal and select (or create) an application.</li>
              <li>Open the Bot tab and copy the token.</li>
              <li>Enable Message Content Intent and Server Members Intent, then save.</li>
              <li>Invite the bot to a server with the permissions you need.</li>
            </ol>
          ) : null}
        </div>
      </div>
    </main>
  );
}
