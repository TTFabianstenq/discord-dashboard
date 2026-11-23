import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Code2, Eye, EyeOff, Hash, KeyRound, MessagesSquare, Shield, Sparkles, SquareSlash, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRelay } from "@/lib/discord/store";
import { RelayMark } from "./mark";

const ACK_KEY = "botdeck.intents_ack";
const SOURCE_URL = "https://github.com/TTFabianstenq/discord-dashboard";

function SourceCodeButton({ size = "lg" }: { size?: "sm" | "lg" }) {
  return (
    <Button asChild variant="outline" size={size}>
      <a href={SOURCE_URL} target="_blank" rel="noreferrer">
        <Code2 />
        Source code
      </a>
    </Button>
  );
}

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
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
          <span className="inline-flex items-center gap-2.5">
            <RelayMark className="size-7" />
            <span className="font-serif text-xl font-bold tracking-tight">BotDeck</span>
          </span>
          <SourceCodeButton size="sm" />
        </header>
        <div className="relative z-10 mx-auto flex max-w-lg animate-fade-up flex-col gap-6 px-5 pb-16 pt-6 sm:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/90">Required setup</p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Turn on Privileged Gateway Intents</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Discord will not send message text, member lists, or presence data unless these are enabled on your bot
              in the Developer Portal. BotDeck cannot bypass this.
            </p>
          </div>

          <div className="glass rounded-2xl border border-amber-400/25 p-4 shadow-soft sm:p-5">
            <p className="text-sm font-medium text-amber-50">Enable all of these under Bot → Privileged Gateway Intents:</p>
            <ul className="mt-3 space-y-3 text-sm text-amber-50/95">
              <li className="rounded-xl border border-white/5 bg-black/25 px-3.5 py-3">
                <p className="font-medium">Message Content Intent</p>
                <p className="mt-0.5 text-xs text-amber-100/80">
                  Without this, Chat shows names and times but <strong>no message text</strong>.
                </p>
              </li>
              <li className="rounded-xl border border-white/5 bg-black/25 px-3.5 py-3">
                <p className="font-medium">Server Members Intent</p>
                <p className="mt-0.5 text-xs text-amber-100/80">
                  Without this, the Members tab is empty or incomplete.
                </p>
              </li>
              <li className="rounded-xl border border-white/5 bg-black/25 px-3.5 py-3">
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
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 70% -5%, color-mix(in oklab, #7c6cff 30%, transparent), transparent 70%), radial-gradient(ellipse 40% 40% at 10% 10%, color-mix(in oklab, #22d3ee 12%, transparent), transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
        <span className="inline-flex items-center gap-2.5">
          <RelayMark className="size-7" />
          <span className="font-serif text-xl font-bold tracking-tight">BotDeck</span>
        </span>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted-foreground sm:block">Anyone with a bot token can use this.</p>
          <SourceCodeButton size="sm" />
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:pt-12">
        <div className="animate-fade-up">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-stone">
            <Sparkles className="size-3.5" />
            Slash commands now reply on their own
          </span>
          <h1 className="font-serif text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[4.2rem]">
            Run your Discord bot <span className="text-gradient">from one deck.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Paste a bot token and you get chat, channels, roles, members, webhooks and working slash commands. Nothing to
            install.
          </p>
          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {[
              { icon: MessagesSquare, title: "Live chat", body: "Send, edit and reply as the bot" },
              { icon: SquareSlash, title: "Slash commands", body: "Build them and pick the reply" },
              { icon: Hash, title: "Channels & roles", body: "Create, reorder, set permissions" },
              { icon: Users, title: "Moderation", body: "Kick, ban, timeout, audit log" },
            ].map((f) => (
              <li key={f.title} className="glass flex items-start gap-3 rounded-xl border border-border p-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-stone">
                  <f.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{f.title}</span>
                  <span className="block text-xs text-muted-foreground">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass relative animate-fade-up rounded-3xl border border-white/10 p-5 shadow-soft [animation-delay:80ms] sm:p-8">
          <div className="pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-to-b from-primary/25 via-transparent to-transparent blur-xl" />
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight">Connect your bot</h2>
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
                  className="h-12 rounded-xl pl-10 pr-11 font-mono text-sm"
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
              {connecting ? "Connecting…" : (
                <>
                  Open console <ArrowRight className="size-4" />
                </>
              )}
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

            <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
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
