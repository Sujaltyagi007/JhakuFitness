"use client";

import { motion } from "motion/react";
import { MapPin, Phone, Clock } from "lucide-react";
import { Container, Button } from "@/components/ui/Primitives";

const MAPS_QUERY = encodeURIComponent("Near Santh Gyaneshware School, Alipur, Delhi 110036");

interface LocationSectionProps {
  address?: string;
  phone?: string;
  hours?: string;
}

export default function LocationSection({
  address = "Near Santh Gyaneshware School, Alipur, Delhi 110036",
  phone = "9311037556",
  hours = "Mon – Sun, 10:00 AM – 8:00 PM",
}: LocationSectionProps) {
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Visit the Jakhu showroom
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-steel">
            See the full lineup in person, test the decks and bikes on the
            floor, and talk through a setup with our team.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold-deep" />
              <p className="text-sm text-ink">{address}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-gold-deep" />
              <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-sm text-ink hover:text-gold-deep">
                {phone}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-gold-deep" />
              <p className="text-sm text-ink">{hours}</p>
            </div>
          </div>

          <div className="mt-8">
            <Button href="/contact">Get directions &amp; contact us</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="h-85 overflow-hidden rounded-2xl border border-ink/10 sm:h-100"
        >
          <iframe
            title="Jakhu Fitness location"
            src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`}
            className="h-full w-full grayscale-20"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </Container>
    </section>
  );
}
