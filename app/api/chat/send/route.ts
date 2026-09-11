import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getRBACSession } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, conversationId: bodyConversationId, senderId: clientSenderId, senderType: clientSenderType } = await req.json();
    if (!content) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const session = await getRBACSession(req);
    let senderId: string;
    let senderType: "VISITOR" | "ADMIN";
    let conv;

    if (session?.userId) {
      if (!bodyConversationId) return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
      conv = await prisma.conversation.findUnique({ where: { id: bodyConversationId } });
      if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      if (conv.type === "INTERNAL" && session.userId !== conv.participantAId && session.userId !== conv.participantBId) return NextResponse.json({ error: "Access denied" }, { status: 403 });
      senderId = session.userId;
      senderType = "ADMIN";
    } else {
      if (!clientSenderId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      if (clientSenderType && clientSenderType !== "VISITOR") return NextResponse.json({ error: "Authentication required to send as admin" }, { status: 401 });
      senderId = clientSenderId;
      senderType = "VISITOR";

      if (bodyConversationId) {
        conv = await prisma.conversation.findUnique({ where: { id: bodyConversationId } });
        if (!conv || conv.type !== "SUPPORT" || conv.visitorId !== senderId) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
      } else {
        conv = await prisma.conversation.findFirst({ where: { visitorId: senderId, type: "SUPPORT" }, orderBy: { createdAt: "desc" } });
        if (!conv) {
          conv = await prisma.conversation.create({ data: { visitorId: senderId, type: "SUPPORT" } });
        }
      }
    }

    const savedMessage = await prisma.message.create({
      data: { content, senderId, senderType, conversationId: conv.id },
    });

    await prisma.conversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });

    const payload = {
      id: savedMessage.id,
      content,
      senderId,
      senderType,
      conversationId: conv.id,
      createdAt: savedMessage.createdAt.toISOString()
    };

    const channels = [`chat-${conv.id}`, "admin-chat-inbox"];
    if (conv.type === "SUPPORT" && conv.visitorId) channels.push(`chat-visitor-${conv.visitorId}`);
    const uniqueChannels = [...new Set(channels)]
    try {
      await pusherServer.trigger(uniqueChannels, "new-message", payload);
    } catch (pusherErr) { console.error("Pusher trigger failed:", pusherErr) }

    return NextResponse.json({ success: true, message: payload });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
