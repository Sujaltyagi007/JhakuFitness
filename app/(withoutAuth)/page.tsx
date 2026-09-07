import { prisma } from "@/lib/prisma";
import type { ModelKind } from "@/lib/types";
import Hero from "@/components/home/Hero";
import CategoryNav from "@/components/home/CategoryNav";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import ValueProps from "@/components/home/ValueProps";
import Testimonials from "@/components/home/Testimonials";
import LocationSection from "@/components/home/LocationSection";
import Newsletter from "@/components/home/Newsletter";

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getPageData() {
  const [products, categories, contentData] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.$transaction([
      prisma.siteSetting.findMany(),
      prisma.contentBlock.findMany(),
    ]),
  ]);

  const [settings, blocks] = contentData;
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return { products, categories, settingsMap, blocks };
}

export default async function HomePage() {
  const { products, categories, settingsMap, blocks } = await getPageData();

  const featured = products
    .filter((p) => p.featured)
    .map((p) => ({ ...p, modelKind: p.modelKind as ModelKind }));

  const valueProps = ["value.direct-dealer-pricing", "value.on-site-installation", "value.commercial-grade-builds", "value.delhi-wide-delivery"]
    .map((slug) => blocks.find((b) => b.slug === slug))
    .filter(Boolean) as typeof blocks;

  const testimonials = ["testimonial.1", "testimonial.2", "testimonial.3"]
    .map((slug) => blocks.find((b) => b.slug === slug))
    .filter(Boolean) as typeof blocks;

  return (
    <>
      <Hero
        headline={settingsMap["hero.headline"] ?? "Unlock the\nbest version."}
        subtext={settingsMap["hero.subtext"] ?? "Premium equipment for homes, studios and commercial floors across Delhi."}
        locationBadge={settingsMap["hero.locationBadge"] ?? "Showroom open in Alipur, Delhi"}
      />
      <CategoryNav categories={categories} />
      <FeaturedCarousel products={featured} />
      <ValueProps items={valueProps} />
      <Testimonials items={testimonials} />
      <LocationSection
        address={settingsMap["location.address"] ?? "Near Santh Gyaneshware School, Alipur, Delhi 110036"}
        phone={settingsMap["location.phone"] ?? "9311037556"}
        hours={settingsMap["location.hours"] ?? "Mon – Sun, 10:00 AM – 8:00 PM"}
      />
      <Newsletter
        heading={settingsMap["newsletter.heading"] ?? "New arrivals and dealer offers"}
        subtext={settingsMap["newsletter.subtext"] ?? "Join our list for new models, seasonal offers and studio setup tips."}
      />
    </>
  );
}