import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Embed = {
  title?: string;
  description?: string;
  color?: number;
  url?: string;
  author?: { name?: string; icon_url?: string };
  thumbnail?: { url?: string };
  image?: { url?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text?: string };
};

/** Tiny Discord-markdown renderer for previews: **bold**, `code`, > quotes, mentions, timestamps. */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|<@&?\d+>|<#\d+>|<t:\d+(?::\w)?>)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} className="rounded bg-black/30 px-1 py-0.5 font-mono text-[0.85em]">
          {p.slice(1, -1)}
        </code>
      );
    if (/^<@&\d+>$/.test(p)) return <Mention key={i}>@role</Mention>;
    if (/^<@\d+>$/.test(p)) return <Mention key={i}>@You</Mention>;
    if (/^<#\d+>$/.test(p)) return <Mention key={i}>#channel</Mention>;
    const t = /^<t:(\d+)(?::(\w))?>$/.exec(p);
    if (t) {
      const d = new Date(Number(t[1]) * 1000);
      const label = t[2] === "R" ? "just now" : t[2] === "D" ? d.toLocaleDateString() : d.toLocaleString();
      return (
        <span key={i} className="rounded bg-white/10 px-1">
          {label}
        </span>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function Mention({ children }: { children: ReactNode }) {
  return <span className="rounded bg-[#5865f2]/30 px-0.5 font-medium text-[#c9cdfb]">{children}</span>;
}

function Markdown({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      {lines.map((line, i) =>
        line.startsWith("> ") ? (
          <div key={i} className="border-l-4 border-white/20 pl-2">
            {renderInline(line.slice(2))}
          </div>
        ) : (
          <div key={i}>{line ? renderInline(line) : "\u00a0"}</div>
        ),
      )}
    </div>
  );
}

export function DiscordMessagePreview({
  botName,
  botAvatar,
  commandLabel,
  content,
  embeds,
  ephemeral,
}: {
  botName: string;
  botAvatar: string | null;
  commandLabel: string;
  content?: string;
  embeds?: Record<string, unknown>[];
  ephemeral?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[#313338] p-4 text-[14px] leading-[1.375] text-[#dbdee1] shadow-inner">
      <div className="mb-1 flex items-center gap-1.5 pl-[52px] text-xs text-[#949ba4]">
        <span className="inline-block h-2 w-6 rounded-tl-md border-l-2 border-t-2 border-[#4e5058]" />
        <span className="font-medium text-[#c9cdfb]">@You</span> used <span className="text-[#c9cdfb]">{commandLabel}</span>
      </div>
      <div className="flex gap-3">
        {botAvatar ? (
          <img src={botAvatar} alt="" className="size-10 shrink-0 rounded-full" />
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#5865f2] text-sm font-semibold text-white">
            {botName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-white">{botName}</span>
            <span className="rounded bg-[#5865f2] px-1 text-[10px] font-semibold leading-4 text-white">APP</span>
            <span className="text-xs text-[#949ba4]">Today</span>
          </div>
          {content ? <Markdown text={content} /> : null}
          {(embeds ?? []).map((raw, idx) => {
            const e = raw as Embed;
            const color = typeof e.color === "number" ? `#${e.color.toString(16).padStart(6, "0")}` : "#1e1f22";
            return (
              <div
                key={idx}
                className="mt-1.5 grid max-w-[432px] grid-cols-[1fr_auto] gap-3 rounded-[4px] border-l-4 bg-[#2b2d31] p-3"
                style={{ borderLeftColor: color }}
              >
                <div className="min-w-0">
                  {e.author?.name ? (
                    <div className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-white">
                      {e.author.icon_url ? <img src={e.author.icon_url} alt="" className="size-6 rounded-full" /> : null}
                      {e.author.name}
                    </div>
                  ) : null}
                  {e.title ? <div className="mb-1 font-semibold text-white">{renderInline(e.title)}</div> : null}
                  {e.description ? <Markdown text={e.description} className="text-[13.5px]" /> : null}
                  {e.fields?.length ? (
                    <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-2">
                      {e.fields.map((f, i) => (
                        <div key={i} className={f.inline ? "col-span-1" : "col-span-3"}>
                          <div className="text-[13px] font-semibold text-white">{f.name}</div>
                          <Markdown text={f.value} className="text-[13px]" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {e.image?.url ? <img src={e.image.url} alt="" className="mt-3 max-h-60 rounded" /> : null}
                  {e.footer?.text ? <div className="mt-2 text-xs text-[#949ba4]">{e.footer.text}</div> : null}
                </div>
                {e.thumbnail?.url ? <img src={e.thumbnail.url} alt="" className="size-20 rounded object-cover" /> : null}
              </div>
            );
          })}
          {ephemeral ? (
            <div className="mt-1 text-xs text-[#949ba4]">👁 Only you can see this · Dismiss message</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
