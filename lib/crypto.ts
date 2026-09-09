const PBKDF2_ITERATIONS = 100_000;
const SALT_SIZE_BYTES = 16;
const KEY_LEN_BYTES = 32;

function bufToHex(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuf(hex: string): Uint8Array<ArrayBuffer> {
  const match = hex.match(/.{1,2}/g);
  if (!match) return new Uint8Array(0);
  const buf = new Uint8Array(match.length);
  for (let i = 0; i < match.length; i++) { buf[i] = parseInt(match[i], 16); }
  return buf;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE_BYTES));
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, passwordKey, KEY_LEN_BYTES * 8);
  const saltHex = bufToHex(salt.buffer);
  const hashHex = bufToHex(derivedBits);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${saltHex}$${hashHex}`;
}


export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") { return false; }
    const iterations = parseInt(parts[1], 10);
    const salt = hexToBuf(parts[2]);
    const expectedHashHex = parts[3];
    const enc = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
    const derivedBits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, passwordKey, KEY_LEN_BYTES * 8);
    const derivedHashHex = bufToHex(derivedBits);
    if (derivedHashHex.length !== expectedHashHex.length) { return false; }
    let diff = 0;
    for (let i = 0; i < derivedHashHex.length; i++) { diff |= derivedHashHex.charCodeAt(i) ^ expectedHashHex.charCodeAt(i) }
    return diff === 0;
  } catch { return false; }
}
