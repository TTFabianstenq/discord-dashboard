import { cn } from "@/lib/utils";
import { hueFromId, initialsOf } from "@/lib/discord/cdn";

export function EntityAvatar({
  name,
  id,
  src,
  size = "md",
  rounded = "full",
}: {
  name: string;
  id: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: "full" | "lg";
}) {
  const dim =
    size === "sm" ? "size-7 text-[10px]" : size === "lg" ? "size-12 text-sm" : size === "xl" ? "size-16 text-lg" : "size-9 text-xs";
  const radius = rounded === "lg" ? "rounded-lg" : "rounded-full";
  const hue = hueFromId(id);

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("shrink-0 object-cover", dim, radius)}
        crossOrigin="anonymous"
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium tracking-wide text-foreground/90",
        dim,
        radius,
      )}
      style={{ background: `hsl(${hue} 12% 22%)` }}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
