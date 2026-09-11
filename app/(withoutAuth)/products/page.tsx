import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Primitives";
import ProductGrid, { type DbProduct, type DbCategory } from "@/components/products/ProductGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Product Catalog | Jakhu Fitness",
  description: "Browse treadmills, spin bikes, cross trainers, rowers and specialty equipment from Jakhu Fitness, Delhi."
};

export default async function ProductsPage() {
  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      take: 9,
    }),
    prisma.product.count(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="bg-theme-bg pb-24 pt-28 sm:pt-36">
      <Container>
        <SectionHeading eyebrow="Commercial & Home Catalog" title="The Full Equipment Range" description="Every deck, plate-loaded unit, cable crossover, and rack built for boutique studios, commercial floors, and athletic home setups." />
        <div className="mt-10">
          <Suspense fallback={<div className="py-24 text-center text-theme-muted">Loading catalog…</div>}>
            <ProductGrid
              initialProducts={products as unknown as DbProduct[]}
              totalCount={totalCount}
              categories={categories as unknown as DbCategory[]}
            />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
