import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 50;

function getMaxWeight(specs: unknown): number {
  if (!specs || typeof specs !== "object") return 0;
  const raw = (specs as Record<string, unknown>)["Max User Weight"];
  if (typeof raw !== "string") return 0;
  const match = raw.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") ?? "featured";
    const minWeight = Math.max(0, parseInt(searchParams.get("minWeight") ?? "0", 10) || 0);
    const search = searchParams.get("search")?.trim() || "";
    const where: Prisma.ProductWhereInput = {};
    if (category && category !== "all") { where.categoryId = category; }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { specialFeature: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minWeight > 0 || sort === "weight") {
      const allMatching = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "asc" },
      });

      let filtered = allMatching;
      if (minWeight > 0) { filtered = filtered.filter((p) => getMaxWeight(p.specs) >= minWeight); }
      if (sort === "name") { filtered.sort((a, b) => a.name.localeCompare(b.name)); }
      else if (sort === "weight") { filtered.sort((a, b) => getMaxWeight(b.specs) - getMaxWeight(a.specs)); }
      else { filtered.sort((a, b) => Number(b.featured) - Number(a.featured)); }
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      return NextResponse.json({ products: paginated, total, page, pageSize, totalPages });
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = sort === "name" ? [{ name: "asc" }] : [{ featured: "desc" }, { createdAt: "asc" }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({ products, total, page, pageSize, totalPages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
