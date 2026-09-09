import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { categories } from "@/lib/products";
import { Container } from "@/components/ui/Primitives";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["site.phone", "site.email", "site.address", "site.footerText"] } }
  });

  const siteInfo = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const phone = siteInfo["site.phone"] || "+91 93110 37556";
  const email = siteInfo["site.email"] || "jakhufitnessdata@gmail.com";
  const address = siteInfo["site.address"] || "Near Santh Gyaneshware School, Alipur, Delhi 110036";
  const footerText = siteInfo["site.footerText"] || "Unlock the best version. Commercial & home fitness machinery engineered in Alipur, Delhi.";

  return (
    <footer className="border-t border-theme-border bg-theme-surface text-theme-text transition-colors duration-300">
      <Container className="grid grid-cols-1 gap-12 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-bold text-theme-text">Jakhu Fitness</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-theme-muted"> {footerText} </p>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-gold"> Products </p>
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href="/products" className="text-sm text-theme-muted transition-colors hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-gold"> Company </p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/about" className="text-sm text-theme-muted transition-colors hover:text-gold">
                About us
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-sm text-theme-muted transition-colors hover:text-gold">
                Full catalog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-theme-muted transition-colors hover:text-gold">
                Contact &amp; Showroom
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-gold"> Visit Showroom </p>
          <ul className="mt-4 space-y-3 text-sm text-theme-muted">
            <li className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
              {address}
            </li>
            <li className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
              <a href={`tel:${phone.replace(/\D/g, "")}`} className="hover:text-gold transition-colors">
                {phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-gold" />
              <a href={`mailto:${email}`} className="hover:text-gold transition-colors">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-theme-border py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-theme-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Jakhu Fitness. All rights reserved.</p>
        </Container>
      </div>
    </footer>
  );
}
