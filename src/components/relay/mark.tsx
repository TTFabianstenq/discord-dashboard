import { cn } from "@/lib/utils";

export function RelayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("text-stone", className)} aria-hidden>
      <path
        d="M8 16c0-2.8 1.4-5.4 3.7-7M24 16c0 2.8-1.4 5.4-3.7 7M5 16c0-4.4 2.3-8.4 6-10.6M27 16c0 4.4-2.3 8.4-6 10.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function RelayWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <RelayMark className="size-6" />
      <span className="font-serif text-lg tracking-tight">Relay</span>
    </span>
  );
}
