import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/categories — list all categories */
export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

/** POST /api/admin/categories — create a category */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const category = await prisma.category.create({
      data: { id: body.id, name: body.name, blurb: body.blurb },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
