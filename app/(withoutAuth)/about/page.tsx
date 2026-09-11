"use client";

import { motion } from "motion/react";
import { Target, Eye, HeartHandshake, ShieldCheck, Award, Factory, Users, ChevronRight, Ruler, Wrench, PaintBucket, CheckCircle2, BadgeCheck, FileCheck, Quote, Star } from "lucide-react";
import { Container, Button } from "@/components/ui/Primitives";
import Timeline from "@/components/about/Timeline";

const STATS = [
  { label: "Delhi Gym Outfits", value: "350+", icon: Factory },
  { label: "Active Equipment Units", value: "4,200+", icon: Award },
  { label: "Commercial Warranty", value: "10 Years", icon: ShieldCheck },
  { label: "Technician Dispatch", value: "< 24 Hrs", icon: Users },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Steel Sourcing & Cutting",
    description: "11-gauge structural steel tubing is sourced and laser-cut to precise tolerances for every rack, bench, and frame.",
    icon: Ruler,
  },
  {
    step: "02",
    title: "Welding & Fabrication",
    description: "In-house welders join every joint by hand, reinforcing high-stress points designed for repeated heavy commercial loading.",
    icon: Wrench,
  },
  {
    step: "03",
    title: "Electrostatic Powder Coating",
    description: "Frames are stripped, primed, and finished with electrostatic powder coating for a scratch- and rust-resistant surface.",
    icon: PaintBucket,
  },
  {
    step: "04",
    title: "Quality Testing & Assembly",
    description: "Each unit is load-tested and inspected before dispatch, then assembled and calibrated on-site by our technicians.",
    icon: CheckCircle2,
  },
];

const CERTIFICATIONS = [
  {
    title: "ISO 9001:2015 Certified",
    description: "Our fabrication workshop follows a documented quality management system audited to ISO 9001:2015 standards.",
    icon: BadgeCheck,
  },
  {
    title: "BIS-Grade Steel",
    description: "Only BIS-compliant structural steel is used across our pin-loaded, plate-loaded, and rack product lines.",
    icon: ShieldCheck,
  },
  {
    title: "10-Year Structural Warranty",
    description: "Every frame is backed by a decade-long structural warranty, with upholstery and cable warranties on top.",
    icon: FileCheck,
  },
];

const TESTIMONIALS = [
  {
    quote: "Jakhu built out our entire 6,000 sq ft strength floor. Two years of daily heavy use and the frames still look factory new.",
    name: "Rohit Malhotra",
    role: "Owner, Ironclad Fitness Studio",
  },
  {
    quote: "Same-day technician dispatch actually means same-day. When a cable snapped on a Saturday, their team was on-site within hours.",
    name: "Simran Kaur",
    role: "Facility Manager, PowerHouse Gym Chain",
  },
  {
    quote: "We compared five manufacturers before choosing Jakhu. The weld quality and powder coat finish were noticeably above the rest.",
    name: "Aman Bhatia",
    role: "Director, Alpha Strength Studios",
  },
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
      <section className="py-24 sm:py-28 border-t border-theme-border">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Our Philosophy</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-theme-text sm:text-4xl">
              Why Commercial Gyms Choose Jakhu
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-3xl border border-theme-border bg-theme-surface p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <Target size={24} />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-theme-text">Our Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                Put indestructible, biometrically aligned strength and cardio machinery within reach of every commercial floor, studio, and home in Delhi NCR — backed by same-day technician support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative rounded-3xl border border-theme-border bg-theme-surface p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <Eye size={24} />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-theme-text">Our Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                To be the primary manufacturing and dealership partner across North India for turnkey athletic facility fit-outs, custom powder-coated colorways, and heavy plate-loaded setups.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative rounded-3xl border border-theme-border bg-theme-surface p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <HeartHandshake size={24} />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-theme-text">Direct Factory Commitment</h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                Zero middleman markup, custom laser-cut 11-gauge steel tube engineering, electrostatic powder coating, and on-site assembly by experienced technicians.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Manufacturing Process Section */}
      <section className="py-24 sm:py-28 border-t border-theme-border bg-theme-surface/40">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">How It&apos;s Built</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-theme-text sm:text-4xl">
              From Raw Steel to Showroom Floor
            </h2>
            <p className="mt-4 text-sm text-theme-muted sm:text-base leading-relaxed">
              Every machine that leaves our Alipur workshop passes through the same four-stage process, built to survive years of continuous commercial use.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative rounded-3xl border border-theme-border bg-theme-surface p-6 backdrop-blur-md hover:border-gold/50 transition-all shadow-lg"
                >
                  <span className="font-display text-3xl font-extrabold text-gold/25">{s.step}</span>
                  <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-theme-text">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-theme-muted">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Certifications & Compliance Section */}
      <section className="py-24 sm:py-28 border-t border-theme-border">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Trust & Compliance</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-theme-text sm:text-4xl">
              Certified Quality, Backed on Paper
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CERTIFICATIONS.map((c, idx) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center rounded-3xl border border-theme-border bg-theme-surface p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                    <Icon size={26} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-theme-text">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-theme-muted">{c.description}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Interactive Timeline Section */}
      <section className="border-t border-theme-border py-24 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">Milestones</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-theme-text sm:text-4xl">
              The Evolution of Jakhu Fitness
            </h2>
            <p className="mt-2 text-sm text-theme-muted">
              How our workshop evolved into Delhi&apos;s most relied-upon commercial fitness equipment hub.
            </p>
          </div>

          <div className="mt-12">
            <Timeline />
          </div>
        </Container>
      </section>

      {/* Client Testimonials Section */}
      <section className="border-t border-theme-border py-24 sm:py-28">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Client Voices</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-theme-text sm:text-4xl">
              What Gym Owners Say
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col rounded-3xl border border-theme-border bg-theme-surface p-8 backdrop-blur-md hover:border-gold/50 transition-all shadow-lg"
              >
                <Quote size={28} className="text-gold/40" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-theme-muted">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 border-t border-theme-border pt-4">
                  <p className="font-display text-sm font-bold text-theme-text">{t.name}</p>
                  <p className="mt-0.5 text-xs text-theme-muted">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Bottom CTA Banner */}
      <Container className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-linear-to-r from-gold/20 via-gold/10 to-transparent p-10 sm:p-16 backdrop-blur-xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold text-theme-text sm:text-4xl">
              Ready to Fit Out Your Training Floor?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-theme-muted leading-relaxed">
              Visit our live showroom in Alipur, Delhi, test the weight stacks, and get a CAD floor layout quote directly from our engineering team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/contact" className="px-8! py-3.5! font-semibold">
                Talk to our team <ChevronRight size={16} />
              </Button>
              <Button href="/products" variant="ghost" className="border-theme-border! text-theme-text! hover:bg-theme-surface-hover!">
                Explore catalog
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
