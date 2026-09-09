"use client";
import { Send } from "lucide-react";
import { motion } from "motion/react";
import { useState, FormEvent } from "react";
import { Container } from "@/components/ui/Primitives";

interface NewsletterProps {
  heading?: string;
  subtext?: string;
}

export default function Newsletter({ heading, subtext }: NewsletterProps = {}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("submitted");
    setEmail("");
  };

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <motion.div initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-theme-surface px-8 py-14 sm:px-16"
          style={{ backgroundImage: "radial-gradient(60% 100% at 90% 0%, rgba(201,165,78,0.18), transparent 60%)" }}
        >
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-semibold text-theme-surface-text sm:text-3xl">
              {heading ?? "New arrivals and dealer offers"}
            </h2>
            <p className="mt-3 text-sm text-theme-surface-muted">
              {subtext ?? "Join our list for new models, seasonal offers and studio setup tips. No spam — occasional, useful updates only."}
            </p>

            {status === "submitted" ? (
              <p className="mt-6 text-sm font-medium text-gold">You&apos;re on the list. We&apos;ll be in touch.</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3 sm:flex-row"  >
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full flex-1 rounded-full border border-theme-border bg-theme-bg px-5 py-3 text-sm text-theme-surface-text placeholder:text-theme-surface-muted/60 focus:border-gold focus:outline-none" />
                <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold-bright">Subscribe <Send size={14} /> </button>
              </form>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
