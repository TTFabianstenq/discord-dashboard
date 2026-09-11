/** Discord only pings when content has <@id> AND allowed_mentions permits it. */

const SNOWFLAKE = /^\d{17,20}$/;

/**
 * Force real mention tokens.
 * - <@123> / <@!123> kept
 * - bare @123 → <@123>
 * - lone 17–20 digit snowflake as whole message → <@id>
 */
export function normalizeMentionContent(content: string): string {
  if (!content) return content;
  let out = content;

  // <@userid> and <@!userid> already valid — leave them
  // bare @snowflake (not already inside < >)
  out = out.replace(/(^|[^<@])@(\d{17,20})\b/g, (_m, pre: string, id: string) => `${pre}<@${id}>`);
  // leading @snowflake
  out = out.replace(/^@(\d{17,20})\b/g, "<@$1>");
  // whole-string snowflake only
  if (SNOWFLAKE.test(out.trim())) {
    out = `<@${out.trim()}>`;
  }

  return out;
}

export function extractMentionUserIds(content: string): string[] {
  const ids = new Set<string>();
  const re = /<@!?(\d{17,20})>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) ids.add(m[1]);
  return [...ids];
}

/** Always allow user pings. Explicit user ids when we have them. */
export function buildAllowedMentions(content: string): {
  parse: ("users" | "roles" | "everyone")[];
  users?: string[];
  replied_user: boolean;
} {
  const users = extractMentionUserIds(content);
  // parse users so Discord never "escapes" mentions into plain text
  return {
    parse: ["users", "roles"],
    ...(users.length ? { users } : {}),
    replied_user: true,
  };
}
