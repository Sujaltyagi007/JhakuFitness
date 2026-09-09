"use client";

import { useState, FormEvent, Fragment } from "react";
import { Lock, KeyRound, AlertCircle, Loader2, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { type AdminUser } from "@/lib/useAdminAuth";

interface AdminLoginProps {
  onSuccess: (user?: AdminUser) => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) { setError(res.error); }
      else if (res?.ok) { onSuccess(); }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-ink/10 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep">
            <Lock size={26} />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Enter your user credentials or system key to access admin controls.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-xs font-medium uppercase tracking-wider text-steel">
                Email Address <span className="normal-case text-steel/60 font-normal">(Optional for master key)</span>
              </label>
              <div className="relative">
                <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="superadmin@jhakufitness.com" disabled={loading} />
                <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel/60" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-medium uppercase tracking-wider text-steel">Password</label>
              <div className="relative">
                <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password..." disabled={loading} />
                <KeyRound size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel/60" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Fragment>
                  <Loader2 size={16} className="animate-spin" /> Verifying...
                </Fragment>
              ) : (
                "Unlock Dashboard"
              )}
            </Button>

            {/* <div className="flex flex-col items-center text-start w-full text-xs text-steel/70">
              <p>Default Super User:</p>
              <div className="flex gap-3 bg-stone-200 items-center px-2 rounded-xl " >
                <code className="rounded py-0.5 font-mono text-ink">superadmin@jhakufitness.com</code> / <code className="rounded py-0.5 font-mono text-ink">Jhaku@SuperAdmin2026!</code>
              </div>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
