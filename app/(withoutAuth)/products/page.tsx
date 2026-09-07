import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Primitives";
import ProductGrid, { type DbProduct, type DbCategory } from "@/components/products/ProductGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Product Catalog | Jakhu Fitness",
  description:
    "Browse treadmills, spin bikes, cross trainers, rowers and specialty equipment from Jakhu Fitness, Delhi.",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="pb-24 pt-36">
      <Container>
        <SectionHeading
          title="The full equipment range"
          description="Every deck, bike and rower we carry, built for home setups, boutique studios and full commercial floors."
        />
        <div className="mt-10">
          <Suspense fallback={<div className="py-24 text-center text-steel">Loading catalog…</div>}>
            <ProductGrid 
              products={products as unknown as DbProduct[]} 
              categories={categories as unknown as DbCategory[]} 
            />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
