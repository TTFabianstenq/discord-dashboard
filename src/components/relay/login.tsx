import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRelay } from "@/lib/discord/store";
import { RelayMark } from "./mark";

export function LoginScreen() {
  const connectLive = useRelay((s) => s.connectLive);
  const connectDemo = useRelay((s) => s.connectDemo);
  const connecting = useRelay((s) => s.connecting);
  const error = useRelay((s) => s.error);
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const [mask, setMask] = useState(false);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    setMask(true);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await connectLive(token);
      toast.success("Bot connected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not connect");
    }
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
          <span className="font-serif text-xl tracking-tight">Fabianbotdeck</span>
        </span>
        <p className="hidden text-xs text-muted-foreground sm:block">Anyone with a bot token can use this.</p>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:pt-12">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-stone">Bot console</p>
          <h1 className="font-serif text-[2.6rem] leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.4rem]">
            A console for every Discord bot.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Paste a bot token to send messages, edit channels, and run the bot from the browser. Each visitor
            connects their own bot — sessions never mix, and tokens are not saved on a server.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Send and edit messages as the bot",
              "Create, rename, and delete channels",
              "Update the bot username and avatar",
              "Invite the bot with the permissions you pick",
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
                The token stays in this browser tab and is sent only to Discord through Fabianbotdeck. Close the tab to
                forget it. Anyone else can open this same page and connect a different bot.
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
              <li>Open the Bot tab and copy the token. Reset it if you do not have one saved.</li>
              <li>Turn on Message Content Intent if you want the bot to read message text.</li>
              <li>Invite the bot to a server with Manage Channels and Send Messages.</li>
            </ol>
          ) : null}
        </div>
      </div>
    </main>
  );
}
