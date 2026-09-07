"use client";
import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Primitives";

interface ContentBlock {
  slug: string;
  title: string | null;  // format: "Name · Place"
  bodyText: string | null;
}

interface TestimonialsProps {
  items: ContentBlock[];
}

export default function Testimonials({ items }: TestimonialsProps) {
  return (
    <section className="bg-ink py-20 sm:py-24">
      <Container>
        <SectionHeading
          title="Trusted across Delhi's gym floors"
          description="A few notes from the studios and homes we've fitted out."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {items.map((t, i) => {
            const [name, place] = (t.title ?? " · ").split(" · ");
            return (
              <motion.figure
                key={t.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/3 p-7"
              >
                <Quote size={20} className="text-gold" />
                <blockquote className="mt-4 text-sm leading-relaxed text-white/75">
                  {t.bodyText}
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-medium text-white">{name}</span>
                  {place && <span className="text-white/40"> · {place}</span>}
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
