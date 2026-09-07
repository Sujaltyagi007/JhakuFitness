"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/Toast";

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
  interest: "Treadmills",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Please share your name.";
    if (!form.phone.trim() && !form.email.trim())
      next.email = "Add a phone number or email so we can reach you.";
    if (form.email && !form.email.includes("@"))
      next.email = "That email doesn't look right.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please complete required form fields.");
    }
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // No backend is wired up yet — this simply confirms receipt in the UI.
    // Connect this handler to your CRM, email service, or form endpoint.
    setSubmitted(true);
    toast.success("Enquiry sent! We will contact you shortly.");
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-ink/8 bg-white px-8 py-16 text-center">
        <CheckCircle2 size={36} className="text-gold-deep" />
        <h3 className="mt-4 font-display text-lg font-semibold text-ink">
          Thanks, {form.name.split(" ")[0]}.
        </h3>
        <p className="mt-2 max-w-sm text-sm text-steel">
          We&apos;ve received your enquiry and will get back to you shortly. For
          anything urgent, call us directly at 93110 37556.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-ink/8 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink">Full name</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
            placeholder="98xxxxxxxx"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Email</label>
        <input
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
          placeholder="you@email.com"
        />
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1 text-xs text-red-600"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Interested in</label>
        <select
          value={form.interest}
          onChange={(e) => update("interest", e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
        >
          <option>Treadmills</option>
          <option>Spin bikes</option>
          <option>Cross trainers</option>
          <option>Rowers</option>
          <option>Specialty equipment</option>
          <option>Full gym setup</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Message</label>
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
          placeholder="Tell us about your space and what you're looking for"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold-bright sm:w-auto"
      >
        Send enquiry
      </button>
    </form>
  );
}
