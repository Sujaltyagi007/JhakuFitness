"use client";

import { motion } from "motion/react";
import { Target, Eye, HeartHandshake, ShieldCheck, Award, Factory, Users, ChevronRight } from "lucide-react";
import { Container, Button } from "@/components/ui/Primitives";
import Timeline from "@/components/about/Timeline";

const STATS = [
  { label: "Delhi Gym Outfits", value: "350+", icon: Factory },
  { label: "Active Equipment Units", value: "4,200+", icon: Award },
  { label: "Commercial Warranty", value: "10 Years", icon: ShieldCheck },
  { label: "Technician Dispatch", value: "< 24 Hrs", icon: Users },
];

export default function AboutPage() {
  return (
    <div className="bg-theme-bg text-theme-text transition-colors duration-300 pb-24 pt-28 sm:pt-36">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-theme-border pb-20 pt-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-112.5 w-112.5 -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]" />
        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-md"
            >
              <Award size={14} />
              <span>Alipur, Delhi Direct Manufacturer & Dealer</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-theme-text sm:text-5xl lg:text-6xl"
            >
              Built by Lifters. <br />
              <span className="bg-linear-to-r from-gold via-gold-bright to-theme-text bg-clip-text text-transparent">
                Engineered for Commercial Heavy Loads.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-base text-theme-muted sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
            >
              We started as a specialized engineering workshop in Alipur and grew into Delhi&apos;s leading commercial gym equipment dealer by building machinery that handles extreme training stress without compromise.
            </motion.p>
          </div>

          {/* Key Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {STATS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-theme-border bg-theme-surface p-6 backdrop-blur-md text-center transition-all hover:border-gold/50 shadow-lg"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30 mb-3">
                    <Icon size={20} />
                  </div>
                  <p className="font-display text-2xl font-extrabold text-theme-text sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-gold font-semibold">{s.label}</p>
                </div>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* Core Values Section */}
      <section className="py-24 sm:py-28 border-t border-white/10">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Our Philosophy</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Why Commercial Gyms Choose Jakhu
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-3xl border border-white/12 bg-linear-to-b from-white/8 to-white/2 p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <Target size={24} />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-white">Our Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Put indestructible, biometrically aligned strength and cardio machinery within reach of every commercial floor, studio, and home in Delhi NCR — backed by same-day technician support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative rounded-3xl border border-white/12 bg-linear-to-b from-white/8 to-white/2 p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <Eye size={24} />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-white">Our Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                To be the primary manufacturing and dealership partner across North India for turnkey athletic facility fit-outs, custom powder-coated colorways, and heavy plate-loaded setups.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative rounded-3xl border border-white/12 bg-linear-to-b from-white/8 to-white/2 p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <HeartHandshake size={24} />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-white">Direct Factory Commitment</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Zero middleman markup, custom laser-cut 11-gauge steel tube engineering, electrostatic powder coating, and on-site assembly by experienced technicians.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Interactive Timeline Section */}
      <section className="border-t border-white/10 py-24 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">Milestones</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              The Evolution of Jakhu Fitness
            </h2>
            <p className="mt-2 text-sm text-white/60">
              How our workshop evolved into Delhi&apos;s most relied-upon commercial fitness equipment hub.
            </p>
          </div>

          <div className="mt-12">
            <Timeline />
          </div>
        </Container>
      </section>

      {/* Bottom CTA Banner */}
      <Container className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-linear-to-r from-gold/20 via-gold/10 to-transparent p-10 sm:p-16 backdrop-blur-xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Fit Out Your Training Floor?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed">
              Visit our live showroom in Alipur, Delhi, test the weight stacks, and get a CAD floor layout quote directly from our engineering team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/contact" className="px-8! py-3.5! font-semibold">
                Talk to our team <ChevronRight size={16} />
              </Button>
              <Button href="/products" variant="ghost" className="border-white/20! text-white! hover:bg-white/10!">
                Explore catalog
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
