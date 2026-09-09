"use client";
import { useState, FormEvent } from "react";
import { toast } from "@/components/ui/Toast";
import { CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CountrieCodeBtn from "@/components/ui/CountrieCodeBtn";
import { COUNTRIES, type Country } from "@/lib/hooks/Countrielist";

interface FormState {
  name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
}

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  interest: "Pin Loaded Series",
  message: "",
};

export default function ContactForm({ phone = "+91 93110 37556" }: { phone?: string }) {
  const defaultCountry = COUNTRIES.find((c) => c.code === "IN") || COUNTRIES[0];
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    const nameLen = form.name.trim().length;
    if (!nameLen) next.name = "Please share your name.";
    else if (nameLen < 3 || nameLen > 55) next.name = "Name must be between 3 and 55 characters.";

    if (!form.phone.trim() && !form.email.trim())
      next.email = "Add a phone number or email so we can reach you.";
    else if (form.email) {
      const emailLen = form.email.trim().length;
      if (emailLen < 3 || emailLen > 55) next.email = "Email must be between 3 and 55 characters.";
      else if (!form.email.includes("@")) next.email = "That email doesn't look right.";
    }

    if (form.message && form.message.length > 300) {
      next.message = "Message must not exceed 300 characters.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please complete required form fields.");
    }
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    toast.success("Enquiry sent! We will contact you shortly.");
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gold/40 bg-theme-surface p-12 text-center backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20 text-gold border border-gold/30">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold text-theme-text">Enquiry Received, {form.name.split(" ")[0]}!</h3>
        <p className="mt-3 max-w-sm text-sm text-theme-muted leading-relaxed">
          Our engineering &amp; sales team in Alipur, Delhi will review your specs and contact you within 24 hours.
        </p>
        <p className="mt-4 text-xs font-semibold text-gold">Urgent? Call directly: {phone}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-theme-border bg-theme-surface p-8 backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold px-3 uppercase tracking-wider text-theme-muted">Full Name *</label>
          <input value={form.name} onChange={(e) => { const val = e.target.value.replace(/^\s+/, '').replace(/[0-9]/g, '').slice(0, 55); update("name", val); }} maxLength={55} className="mt-0 w-full rounded-2xl border border-theme-border bg-theme-bg px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted/50 focus:border-gold focus:outline-none" placeholder="Your name" />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold px-3 uppercase tracking-wider text-theme-muted">Phone Number *</label>
          <div className="mt-0 flex w-full items-stretch overflow-hidden rounded-2xl border border-theme-border bg-theme-bg focus-within:border-gold transition-colors">
            <CountrieCodeBtn value={country} onChange={setCountry} autoDetected={false} onManualChange={() => { }} className="bg-transparent! border-0! rounded-none! px-3! py-3 text-theme-text! hover:bg-theme-border/30!" />
            <input value={form.phone} onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              update("phone", val);
            }} maxLength={country.len} className="w-full bg-transparent px-2 py-3 text-sm text-theme-text placeholder:text-theme-muted/50 focus:outline-none" placeholder="98xxxxxxxx"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold px-3 uppercase tracking-wider text-theme-muted">Email Address</label>
        <input value={form.email} onChange={(e) => update("email", e.target.value.slice(0, 55))} maxLength={55}
          className="mt-0 w-full rounded-2xl border border-theme-border bg-theme-bg px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted/50 focus:border-gold focus:outline-none"
          placeholder="you@company.com"
        />
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 text-xs text-red-400 font-medium"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="text-xs font-semibold px-3 uppercase tracking-wider text-theme-muted">Equipment Series / Inquiry Type</label>
        <select value={form.interest} onChange={(e) => update("interest", e.target.value)} className="mt-0 w-full rounded-2xl border border-theme-border bg-theme-bg px-4 py-3 text-sm text-theme-text focus:border-gold focus:outline-none">
          <option>Pin Loaded Series</option>
          <option>Hammer Plate-Loaded</option>
          <option>Benches &amp; Utility Racks</option>
          <option>Multi-Jungle Cable Crossover</option>
          <option>Custom Full Commercial Gym Setup</option>
          <option>Luxury Home Gym</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center px-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted">Setup Details / Message</label>
          <span className="text-xs text-theme-muted/50">{form.message.length}/500</span>
        </div>
        <textarea value={form.message} onChange={(e) => update("message", e.target.value.slice(0, 500))} rows={4} maxLength={500}
          className="mt-1 w-full rounded-2xl border border-theme-border bg-theme-bg px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted/50 focus:border-gold focus:outline-none" placeholder="Tell us about your floor area (sq ft), target timeline, or specific machine requirements..."
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.message}</p>
        )}
      </div>

      <button type="submit" className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gold px-8 py-4 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] shadow-lg shadow-gold/20">
        Send Specification Request <Send size={15} />
      </button>
    </form>
  );
}
