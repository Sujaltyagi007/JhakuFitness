import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { verifyJWT, ADMIN_COOKIE_NAME } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get(ADMIN_COOKIE_NAME);
    if (!sessionCookie?.value) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    const payload = await verifyJWT(sessionCookie.value);
    if (!payload || (payload.role !== "admin" && !payload.isSuperUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { message, title } = await req.json();
    if (!message) { return NextResponse.json({ error: "Message is required" }, { status: 400 }); }

    await pusherServer.trigger("global-notifications", "new-notification", {
      title: title || "New Notification",
      message,
      timestamp: new Date().toISOString(),
      sender: payload.name || "Admin",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return NextResponse.json(
      { error: "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
