import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const THEMES = new Set(["light", "dark", "system"]);
const DENSITIES = new Set(["compact", "comfortable", "spacious"]);
const CURRENCIES = new Set(["INR", "USD"]);
const TIME_FORMATS = new Set(["12h", "24h"]);
const TAB_IDS = new Set(["products", "invoice", "leads", "inventory", "analytics", "content", "media", "users", "roles", "account"]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function validatePreferences(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null) {
    throw new Error("Preferences payload must be an object.");
  }

  const validated: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    switch (key) {
      case "theme":
        if (!THEMES.has(value as string)) throw new Error(`Invalid theme: ${value}`);
        break;
      case "density":
        if (!DENSITIES.has(value as string)) throw new Error(`Invalid density: ${value}`);
        break;
      case "currency":
        if (!CURRENCIES.has(value as string)) throw new Error(`Invalid currency: ${value}`);
        break;
      case "timeFormat":
        if (!TIME_FORMATS.has(value as string)) throw new Error(`Invalid timeFormat: ${value}`);
        break;
      case "defaultPage":
        if (!TAB_IDS.has(value as string)) throw new Error(`Invalid defaultPage: ${value}`);
        break;
      case "accentColor":
        if (typeof value !== "string" || !HEX_COLOR.test(value)) throw new Error(`Invalid accentColor: ${value}`);
        break;
      case "avatarStyle":
        if (value !== null && typeof value !== "string") throw new Error(`Invalid avatarStyle: ${value}`);
        break;
      case "avatarSeed":
        if (value !== null && typeof value !== "string") throw new Error(`Invalid avatarSeed: ${value}`);
        break;
      default:
        throw new Error(`Unknown preference key: ${key}`);
    }
    validated[key] = value;
  }
  return validated;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    let validatedPrefs: Record<string, unknown>;
    try {
      validatedPrefs = validatePreferences(body);
    } catch (validationError) {
      return NextResponse.json({ error: (validationError as Error).message }, { status: 400 });
    }

    // Fetch current preferences first
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const existingPrefs = (currentUser?.preferences as Record<string, any>) || {};
    const newPrefs = { ...existingPrefs, ...validatedPrefs };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: newPrefs,
      },
    });

    return NextResponse.json({ success: true, preferences: updatedUser.preferences });
  } catch (error) {
    console.error("Failed to update preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
