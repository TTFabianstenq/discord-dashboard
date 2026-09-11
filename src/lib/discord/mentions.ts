/** Normalize free-typed @id into Discord mention tokens and build allowed_mentions. */

const SNOWFLAKE = /^\d{17,20}$/;

/** Turn bare @123… into <@123…> so Discord treats them as real pings. */
export function normalizeMentionContent(content: string): string {
  if (!content) return content;
  // already proper mentions left alone
  // @123456789012345678 (bare snowflake after @)
  let out = content.replace(/(^|[^<])@(\d{17,20})\b/g, (_m, pre: string, id: string) => `${pre}<@${id}>`);
  // <@!id> nickname form is fine for Discord; leave as-is
  return out;
}

export function extractMentionUserIds(content: string): string[] {
  const ids = new Set<string>();
  const re = /<@!?(\d{17,20})>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) ids.add(m[1]);
  // also bare @snowflake in case normalize missed
  const bare = /(?:^|\s)@(\d{17,20})\b/g;
  while ((m = bare.exec(content))) ids.add(m[1]);
  return [...ids].filter((id) => SNOWFLAKE.test(id));
}

export function buildAllowedMentions(content: string): {
  parse: string[];
  users: string[];
  replied_user: boolean;
} {
  const users = extractMentionUserIds(content);
  return {
    parse: users.length ? [] : ["users"],
    users,
    replied_user: true,
  };
}
