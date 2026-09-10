import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * GET /api/admin/products — list all products with stock.
 * Pass ?page= to get a paginated, search-filtered page instead of the full catalog
 * (optional &pageSize= and &search=).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("page");

  if (!pageParam) {
    const products = await prisma.product.findMany({
      include: { category: true, stock: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(products);
  }

  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("pageSize") ?? "", 10) || DEFAULT_PAGE_SIZE));
  const search = searchParams.get("search")?.trim() || "";

  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { categoryId: { contains: search, mode: "insensitive" } },
          { specialFeature: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, stock: true },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
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
