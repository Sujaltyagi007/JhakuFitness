"use client";
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Primitives";
import ContactForm from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock, MessageSquare, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [siteInfo, setSiteInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-info")
      .then(res => res.json())
      .then(data => setSiteInfo(data))
      .catch(console.error);
  }, []);

  const address = siteInfo["site.address"] || "Near Santh Gyaneshware School, Alipur, Delhi 110036";
  const phone = siteInfo["site.phone"] || "+91 93110 37556";
  const email = siteInfo["site.email"] || "hello@jakhufitness.in";
  const hours = siteInfo["site.hours"] || "Mon – Sun, 10:00 AM – 8:00 PM";
  const whatsapp = siteInfo["site.whatsapp"] || `https://wa.me/${phone.replace(/\\D/g, "")}?text=Hello%20Jakhu%20Fitness!`;
  const mapUrl = siteInfo["site.mapUrl"] || `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="bg-theme-bg pb-24 pt-28 sm:pt-36">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-theme-border pb-16 pt-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-100 w-100 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-md">
            <Sparkles size={14} />
            <span>Alipur Showroom & Factory Direct</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-theme-text sm:text-5xl">
            Let&apos;s Plan Your Equipment Setup
          </h1>
          <p className="mt-3 max-w-xl text-base text-theme-muted mx-auto">
            Whether it&apos;s a single treadmill, a custom power rack, or a complete commercial floor fit-out in Delhi NCR, get pricing and CAD layouts within 24 hours.
          </p>
        </Container>
      </section>

      <Container className="mt-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm phone={phone} />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-theme-border bg-theme-surface p-6 backdrop-blur-md">
              <h3 className="font-display text-lg font-bold text-theme-surface-text mb-4">Showroom Details</h3>
              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-theme-surface-muted">Location</p>
                    <p className="text-theme-surface-text font-medium mt-0.5">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-theme-surface-muted">Direct Phone</p>
                    <a href={`tel:${phone.replace(/\\D/g, "")}`} className="text-theme-surface-text font-semibold hover:text-gold transition-colors block mt-0.5">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-theme-surface-muted">Email Inquiry</p>
                    <a href={`mailto:${email}`} className="text-theme-surface-text font-medium hover:text-gold transition-colors block mt-0.5">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-theme-surface-muted">Showroom Hours</p>
                    <p className="text-theme-surface-text font-medium mt-0.5">{hours}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-theme-border">
                <a href={whatsapp}
                  target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] shadow-lg shadow-gold/20"                >
                  <MessageSquare size={18} />
                  Instant WhatsApp Connect
                </a>
              </div>
            </div>

            <div className="h-72 overflow-hidden rounded-3xl border border-theme-border shadow-lg">
              <iframe title="Jakhu Fitness location" src={mapUrl}
                className="h-full w-full grayscale-20 opacity-90" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
