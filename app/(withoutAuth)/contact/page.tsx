import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Primitives";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Jakhu Fitness",
  description:
    "Get in touch with Jakhu Fitness in Alipur, Delhi for treadmills, spin bikes, cross trainers, rowers and specialty gym equipment.",
};

const MAPS_QUERY = encodeURIComponent(
  "Near Santh Gyaneshware School, Alipur, Delhi 110036"
);

export default function ContactPage() {
  return (
    <div className="pb-24 pt-36">
      <Container>
        <SectionHeading
          title="Let's plan your setup"
          description="Whether it's a single treadmill or a full commercial floor, tell us what you need and we'll get back with pricing and availability."
        />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-ink/8 bg-white p-6">
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-gold-deep" />
                  <p className="text-ink">
                    Near Santh Gyaneshware School, Alipur, Delhi 110036
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={17} className="mt-0.5 shrink-0 text-gold-deep" />
                  <a href="tel:9311037556" className="text-ink hover:text-gold-deep">
                    93110 37556
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-gold-deep" />
                  <a
                    href="mailto:hello@jakhufitness.in"
                    className="text-ink hover:text-gold-deep"
                  >
                    hello@jakhufitness.in
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={17} className="mt-0.5 shrink-0 text-gold-deep" />
                  <p className="text-ink">Mon – Sun, 10:00 AM – 8:00 PM</p>
                </div>
              </div>
            </div>

            <div className="h-75 overflow-hidden rounded-2xl border border-ink/10">
              <iframe title="Jakhu Fitness location" src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`} className="h-full w-full grayscale-20" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
