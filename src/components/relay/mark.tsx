import { useId } from "react";
import { cn } from "@/lib/utils";

/** BotDeck mark: a violet tile with a terminal-style "/" prompt and a status dot. */
export function RelayMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`bd-g-${id}`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a99dff" />
          <stop offset="0.55" stopColor="#7c6cff" />
          <stop offset="1" stopColor="#4f3df0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#bd-g-${id})`} />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="white" strokeOpacity="0.22" />
      <path d="M9.5 11.5 13.5 16l-4 4.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 21h6" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="23" cy="10" r="2.2" fill="#34d399" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

export function RelayWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <RelayMark className="size-6" />
      <span className="font-serif text-lg font-bold tracking-tight">BotDeck</span>
    </span>
  );
}
