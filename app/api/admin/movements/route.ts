import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/movements — last 200 movements */
export async function GET() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { date: "desc" },
    take: 200,
    include: { product: { select: { name: true } } },
  });
  return NextResponse.json(movements);
}

/** POST /api/admin/movements — record a stock movement and update qty */
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      productId: string;
      type: "IN" | "OUT" | "ADJUSTMENT";
      qty: number;
      note?: string;
    };
    const { productId, type, qty, note } = body;

    // Determine delta
    const delta = type === "IN" ? qty : type === "OUT" ? -qty : qty;

    // Get current stock
    const current = await prisma.stockEntry.findUnique({ where: { productId } });
    const newQty = Math.max(0, (current?.qty ?? 0) + delta);

    // Update stock + record movement in a transaction
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: { productId, type, qty: Math.abs(qty), note: note ?? null },
      }),
      prisma.stockEntry.upsert({
        where: { productId },
        create: { productId, qty: newQty, minQty: 5 },
        update: { qty: newQty },
      }),
    ]);

    return NextResponse.json(movement, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
