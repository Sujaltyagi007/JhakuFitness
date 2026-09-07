import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/inventory — all stock entries with product name */
export async function GET() {
  const stock = await prisma.stockEntry.findMany({
    include: { product: { select: { id: true, name: true, categoryId: true, price: true } } },
  });
  return NextResponse.json(stock);
}

/** PATCH /api/admin/inventory — update qty and/or minQty and/or price */
export async function PATCH(req: Request) {
  try {
    const body = await req.json() as { productId: string; qty?: number; minQty?: number; price?: number };
    const { productId, qty, minQty, price } = body;

    // Update StockEntry qty/minQty
    const stockUpdate: { qty?: number; minQty?: number } = {};
    if (qty !== undefined) stockUpdate.qty = qty;
    if (minQty !== undefined) stockUpdate.minQty = minQty;

    if (Object.keys(stockUpdate).length > 0) {
      await prisma.stockEntry.upsert({
        where: { productId },
        create: { productId, qty: qty ?? 0, minQty: minQty ?? 5 },
        update: stockUpdate,
      });
    }

    // Update price on the Product
    if (price !== undefined) {
      await prisma.product.update({ where: { id: productId }, data: { price } });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
