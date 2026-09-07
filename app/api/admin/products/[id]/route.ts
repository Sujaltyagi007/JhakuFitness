import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** PATCH /api/admin/products/[id] — update a product */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        categoryId: body.categoryId,
        modelKind: body.modelKind,
        tagline: body.tagline,
        specialFeature: body.specialFeature,
        specs: body.specs,
        featured: body.featured,
        featureBullets: body.featureBullets,
        imageUrl: body.imageUrl ?? null,
        videoUrl: body.videoUrl ?? null,
        price: body.price ?? null,
        colorwayBody: body.colorwayBody,
        colorwayAccent: body.colorwayAccent,
      },
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** DELETE /api/admin/products/[id] — delete a product */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
