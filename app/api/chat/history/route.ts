import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRBACSession } from "@/lib/rbac";

export const dynamic = 'force-dynamic';

const participantSelect = { select: { id: true, name: true } } as const;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const visitorId = searchParams.get("visitorId");
    const conversationId = searchParams.get("conversationId");
    const targetUserId = searchParams.get("targetUserId");
    const create = searchParams.get("create") === "true";

    if (conversationId) {
      const session = await getRBACSession(req);
      if (!session?.userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          participantA: participantSelect,
          participantB: participantSelect,
        },
      });
      if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      if (conv.type === "INTERNAL" && session.userId !== conv.participantAId && session.userId !== conv.participantBId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      const otherParticipant = conv.type === "INTERNAL"
        ? (conv.participantAId === session.userId ? conv.participantB : conv.participantA)
        : null;

      return NextResponse.json({ messages: conv.messages, conversationId: conv.id, type: conv.type, otherParticipant });
    }

    if (visitorId) {
      const conv = await prisma.conversation.findFirst({
        where: { visitorId, type: "SUPPORT" },
        orderBy: { createdAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (conv) {
        return NextResponse.json({ messages: conv.messages, conversationId: conv.id });
      } else if (create) {
        const newConv = await prisma.conversation.create({ data: { visitorId, type: "SUPPORT" } });
        return NextResponse.json({ messages: [], conversationId: newConv.id });
      } else {
        return NextResponse.json({ messages: [], conversationId: null });
      }
    }

    if (targetUserId) {
      const session = await getRBACSession(req);
      if (!session?.userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      if (targetUserId === session.userId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, name: true } });
      if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const conv = await prisma.conversation.findFirst({
        where: {
          type: "INTERNAL",
          OR: [
            { participantAId: session.userId, participantBId: targetUserId },
            { participantAId: targetUserId, participantBId: session.userId },
          ],
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (conv) {
        return NextResponse.json({ messages: conv.messages, conversationId: conv.id, type: "INTERNAL", otherParticipant: targetUser });
      } else if (create) {
        const newConv = await prisma.conversation.create({
          data: { type: "INTERNAL", participantAId: session.userId, participantBId: targetUserId },
        });
        return NextResponse.json({ messages: [], conversationId: newConv.id, type: "INTERNAL", otherParticipant: targetUser });
      } else {
        return NextResponse.json({ messages: [], conversationId: null, type: "INTERNAL", otherParticipant: targetUser });
      }
    }

    // No params: the admin inbox — every SUPPORT conversation, plus INTERNAL ones the caller participates in.
    const session = await getRBACSession(req);
    if (!session?.userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const limit = parseInt(searchParams.get("limit") || "10");
    const recentConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { type: "SUPPORT" },
          { type: "INTERNAL", OR: [{ participantAId: session.userId }, { participantBId: session.userId }] },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        participantA: participantSelect,
        participantB: participantSelect,
      },
    });

    const conversations = recentConversations.map((c) => ({
      id: c.id,
      type: c.type,
      visitorId: c.visitorId,
      updatedAt: c.updatedAt,
      messages: c.messages,
      otherParticipant: c.type === "INTERNAL"
        ? (c.participantAId === session.userId ? c.participantB : c.participantA)
        : null,
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
