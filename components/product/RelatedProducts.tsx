import { Product } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import { SectionHeading } from "@/components/ui/Primitives";

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-20">
      <SectionHeading title="You might also fit" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
