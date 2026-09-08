export const PERMISSIONS: { key: string; bit: bigint; label: string; hint: string }[] = [
  { key: "view", bit: 1n << 10n, label: "View channels", hint: "See channels in the server" },
  { key: "send", bit: 1n << 11n, label: "Send messages", hint: "Post in text channels" },
  { key: "embed", bit: 1n << 14n, label: "Embed links", hint: "Send rich embeds" },
  { key: "attach", bit: 1n << 15n, label: "Attach files", hint: "Upload files and images" },
  { key: "history", bit: 1n << 16n, label: "Read history", hint: "Read past messages" },
  { key: "manageMessages", bit: 1n << 13n, label: "Manage messages", hint: "Delete and pin others' messages" },
  { key: "manageChannels", bit: 1n << 4n, label: "Manage channels", hint: "Create, edit, and delete channels" },
  { key: "manageNick", bit: 1n << 27n, label: "Manage nicknames", hint: "Change other members' nicknames" },
  { key: "moderate", bit: 1n << 40n, label: "Moderate members", hint: "Timeout members" },
  { key: "connect", bit: 1n << 20n, label: "Connect", hint: "Join voice channels" },
  { key: "speak", bit: 1n << 21n, label: "Speak", hint: "Talk in voice channels" },
  { key: "admin", bit: 8n, label: "Administrator", hint: "Every permission, including destructive ones" },
];

export function bitsToPermissions(bits: bigint): string[] {
  return PERMISSIONS.filter((p) => (bits & p.bit) === p.bit).map((p) => p.key);
}

export function permissionsToBits(keys: string[]): bigint {
  return PERMISSIONS.reduce((acc, p) => (keys.includes(p.key) ? acc | p.bit : acc), 0n);
}

export function inviteUrl(clientId: string, bits: bigint): string {
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: bits.toString(),
    scope: "bot applications.commands",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function parsePermissionString(raw?: string): bigint {
  if (!raw) return 0n;
  try {
    return BigInt(raw);
  } catch {
    return 0n;
  }
}

export function hasPerm(raw: string | undefined, bit: bigint): boolean {
  const n = parsePermissionString(raw);
  if ((n & 8n) === 8n) return true;
  return (n & bit) === bit;
}
