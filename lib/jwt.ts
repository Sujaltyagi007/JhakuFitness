const JWT_SECRET = process.env.JWT_SECRET || "jhaku-fitness-secure-jwt-secret-key-2026";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) { base64 += "=" }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i) }
  return bytes;
}

function stringToUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

export interface AdminJWTPayload {
  sub: string;
  role: "admin";
  iat: number;
  exp: number;
  [key: string]: unknown;
}

export async function signJWT(payload: Omit<AdminJWTPayload, "iat" | "exp">, expiresInSeconds: number = 60 * 60 * 24 * 7): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AdminJWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    sub: "",
    role: "admin"
  };

  const headerB64 = base64UrlEncode(stringToUint8(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(stringToUint8(JSON.stringify(fullPayload)));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const key = await getCryptoKey(JWT_SECRET, ["sign"]);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    stringToUint8(dataToSign) as unknown as BufferSource
  );
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));

  return `${dataToSign}.${signatureB64}`;
}

export async function verifyJWT(token: string): Promise<AdminJWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;
    const signature = base64UrlDecode(signatureB64);

    const key = await getCryptoKey(JWT_SECRET, ["verify"]);
    const isValid = await crypto.subtle.verify("HMAC", key,
      signature as unknown as BufferSource,
      stringToUint8(dataToVerify) as unknown as BufferSource
    );

    if (!isValid) {
      return null;
    }

    const payloadJson = uint8ToString(base64UrlDecode(payloadB64));
    const payload: AdminJWTPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
