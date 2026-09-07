import type { Metadata } from "next";
import { Target, Eye, HeartHandshake } from "lucide-react";
import { Container, SectionHeading, Button } from "@/components/ui/Primitives";
import Timeline from "@/components/about/Timeline";

export const metadata: Metadata = {
  title: "About Us | Jakhu Fitness",
  description:
    "Jakhu Fitness is a Delhi-based fitness equipment dealership helping homes, studios and gyms unlock the best version of their training.",
};

export default function AboutPage() {
  return (
    <div className="pb-24 pt-36">
      <Container>
        <SectionHeading eyebrow="About Jakhu Fitness" title="Equipment, chosen and serviced by people who train too"
          description="We started as a small dealership in Alipur and grew by treating every installation like it was going into our own gym."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="rounded-2xl border border-ink/8 bg-white p-7">
            <Target size={22} className="text-gold-deep" />
            <h3 className="mt-4 font-display text-base font-semibold text-ink">Our mission</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              Put reliable, commercial-grade fitness equipment within reach of
              every home, studio and gym in Delhi — with service that
              actually shows up.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/8 bg-white p-7">
            <Eye size={22} className="text-gold-deep" />
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              Our vision
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              To be the dealership Delhi&apos;s gym owners call first — for a
              single treadmill or a full commercial fit-out.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/8 bg-white p-7">
            <HeartHandshake size={22} className="text-gold-deep" />
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              Why choose us
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              Direct pricing, on-site installation, and a team that answers
              the phone when something needs fixing.
            </p>
          </div>
        </div>

        <div className="mt-24">
          <SectionHeading title="Our journey" />
          <Timeline />
        </div>

        <div className="mt-24 rounded-3xl bg-ink px-8 py-14 text-center sm:px-16">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Ready to fit out your space?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
            Tell us about the space and the training you want to support —
            we&apos;ll help you put together the right equipment list.
          </p>
          <div className="mt-7">
            <Button href="/contact">Talk to our team</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
