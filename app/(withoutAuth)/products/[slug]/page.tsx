import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, Phone } from "lucide-react";
import { products, getProductBySlug, getRelated, getCategory } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { Container, Button } from "@/components/ui/Primitives";
import SpecsTable from "@/components/product/SpecsTable";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductDetailViewer from "@/components/product/ProductDetailViewer";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Jakhu Fitness`,
    description: product.tagline,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelated(product);
  const category = getCategory(product.category);

  const phoneSetting = await prisma.siteSetting.findUnique({
    where: { key: "site.phone" },
  });
  const phone = phoneSetting?.value || "+91 93110 37556";

  return (
    <div className="pb-24 pt-28">
      <Container>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-steel transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} /> Back to {category?.name ?? "catalog"}
        </Link>
      </Container>

      <div className="mt-6 lg:flex lg:items-stretch">
        <div className="h-72 w-full sm:h-96 lg:h-160 lg:w-[65%]">
          <ProductDetailViewer kind={product.modelKind} colorway={product.colorway} />
        </div>
        <div className="w-full px-5 py-8 sm:px-6 lg:w-[35%] lg:px-10 lg:py-10">
          <p className="text-sm font-medium text-gold-deep">{category?.name}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl">{product.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-steel sm:text-base">{product.tagline}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button href="/contact" className="w-full sm:w-auto lg:w-full">
              Request a quote
            </Button>
            <Button href={`tel:${phone.replace(/\\D/g, "")}`} variant="ghost" className="w-full gap-2 sm:w-auto lg:w-full" >
              <Phone size={15} /> Call {phone}
            </Button>
          </div>

          <ul className="mt-8 space-y-3">
            {product.featureBullets.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                <Check size={16} className="mt-0.5 shrink-0 text-gold-deep" />                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Container className="mt-16">
        <h2 className="font-display text-xl font-semibold text-ink">
          Technical specifications
        </h2>
        <div className="mt-5 max-w-xl">
          <SpecsTable specs={product.specs} />
        </div>

        <RelatedProducts products={related} />
      </Container>
    </div>
  );
}
