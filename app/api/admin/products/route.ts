import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/products — list all products with stock */
export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, stock: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(products);
}

/** POST /api/admin/products — create a new product */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        slug: body.slug,
        name: body.name,
        categoryId: body.categoryId,
        modelKind: body.modelKind,
        tagline: body.tagline,
        specialFeature: body.specialFeature,
        specs: body.specs ?? {},
        featured: body.featured ?? false,
        featureBullets: body.featureBullets ?? [],
        imageUrl: body.imageUrl ?? null,
        videoUrl: body.videoUrl ?? null,
        price: body.price ?? null,
        colorwayBody: body.colorwayBody ?? "#1b1b1d",
        colorwayAccent: body.colorwayAccent ?? "#c9a54e",
        stock: { create: { qty: 0, minQty: 5 } },
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
