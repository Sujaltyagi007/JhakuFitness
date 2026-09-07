"use client";
import { motion } from "motion/react";
import { ShieldCheck, Wrench, Truck, BadgeIndianRupee, type LucideIcon } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Primitives";

const ICON_MAP: Record<string, LucideIcon> = {
  BadgeIndianRupee,
  Wrench,
  ShieldCheck,
  Truck,
};

interface ContentBlock {
  slug: string;
  title: string | null;
  bodyText: string | null;
  metadata?: unknown;
}

interface ValuePropsProps {
  items: ContentBlock[];
}

export default function ValueProps({ items }: ValuePropsProps) {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          title="Why gyms and homes choose Jakhu"
          description="Every piece of equipment we sell is backed by service, not just a warranty card."
        />
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((v, i) => {
            const meta = typeof v.metadata === "object" && v.metadata !== null ? (v.metadata as Record<string, unknown>) : null;
            const iconKey = typeof meta?.icon === "string" ? meta.icon : "ShieldCheck";
            const Icon = ICON_MAP[iconKey] ?? ShieldCheck;
            return (
              <motion.div
                key={v.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-gold">
                  <Icon size={19} />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{v.bodyText}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
