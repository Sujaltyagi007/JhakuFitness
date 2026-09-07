import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { categories } from "@/lib/products";
import { Container } from "@/components/ui/Primitives";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-semibold">Jakhu Fitness</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            Unlock the best version. Fitness equipment for homes, studios and
            commercial gyms across Delhi.
          </p>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-gold">
            Products
          </p>
          <ul className="mt-4 space-y-2.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href="/products"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-gold">
            Company
          </p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/about" className="text-sm text-white/70 hover:text-white">
                About us
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-sm text-white/70 hover:text-white">
                Full catalog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-white/70 hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-gold">
            Visit the showroom
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
              Near Santh Gyaneshware School, Alipur, Delhi 110036
            </li>
            <li className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
              <a href="tel:9311037556" className="hover:text-white">
                93110 37556
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-gold" />
              <a href="mailto:hello@jakhufitness.in" className="hover:text-white">
                hello@jakhufitness.in
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Jakhu Fitness. All rights reserved.</p>
          <p>Near Santh Gyaneshware School, Alipur, Delhi 110036</p>
        </Container>
      </div>
    </footer>
  );
}
