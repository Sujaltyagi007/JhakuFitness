"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Loader2, RefreshCw, Save } from "lucide-react";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { toast } from "@/components/ui/Toast";

// ─── types ────────────────────────────────────────────────────────────────────

interface SiteSetting { key: string; value: string }
interface ContentBlock {
  slug: string;
  title: string | null;
  bodyText: string | null;
  mediaUrl: string | null;
  metadata: Record<string, unknown> | null;
}

const AUTOSAVE_DELAY_MS = 900;

// ─── helpers ─────────────────────────────────────────────────────────────────

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold resize-none leading-relaxed"
    />
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ state, error, onRetry }: { state: SaveState; error?: string; onRetry: () => void }) {
  if (state === "saving") return <span className="inline-flex items-center gap-1 text-xs text-steel"><Loader2 size={12} className="animate-spin" /> Saving…</span>;
  if (state === "saved") return <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><Check size={12} /> Saved</span>;
  if (state === "error") {
    return (
      <button onClick={onRetry} className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline" title={error}>
        <AlertTriangle size={12} /> Save failed — retry
      </button>
    );
  }
  return null;
}

// ─── section: site settings ──────────────────────────────────────────────────

function SettingField({ label, settingKey, value, multiline, onChange, onSave, saveState, error }: {
  label: string;
  settingKey: string;
  value: string;
  multiline?: boolean;
  onChange: (key: string, value: string) => void;
  onSave: (key: string) => void;
  saveState: SaveState;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-steel">{label}</label>
        <SaveIndicator state={saveState} error={error} onRetry={() => onSave(settingKey)} />
      </div>
      {multiline ? (
        <Textarea value={value} onChange={(v) => onChange(settingKey, v)} />
      ) : (
        <Input value={value} onChange={(e) => onChange(settingKey, e.target.value)} className="mt-1" />
      )}
      <Button
        size="sm"
        variant="outline"
        className="mt-2 h-7 gap-1.5 text-xs"
        onClick={() => onSave(settingKey)}
        disabled={saveState === "saving"}
      >
        <Save size={12} />
        Save now
      </Button>
    </div>
  );
}

// ─── section: content block ───────────────────────────────────────────────────

function BlockField({ label, block, onChange, onSave, saveState, error }: {
  label: string;
  block: ContentBlock;
  onChange: (slug: string, field: "title" | "bodyText", value: string) => void;
  onSave: (slug: string) => void;
  saveState: SaveState;
  error?: string;
}) {
  return (
    <div className="rounded-xl border border-ink/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-steel">{label}</h4>
        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} error={error} onRetry={() => onSave(block.slug)} />
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => onSave(block.slug)} disabled={saveState === "saving"}>
            <Save size={12} /> Save now
          </Button>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-steel">Title / Author</label>
        <Input value={block.title ?? ""} onChange={(e) => onChange(block.slug, "title", e.target.value)} className="mt-1" />
      </div>
      <div>
        <label className="text-xs font-semibold text-steel">Body Text</label>
        <Textarea value={block.bodyText ?? ""} onChange={(v) => onChange(block.slug, "bodyText", v)} rows={3} />
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ContentTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});

  // Last server-confirmed values, used to roll back an optimistic edit if the save fails.
  const confirmedSettings = useRef<Record<string, string>>({});
  const confirmedBlocks = useRef<Record<string, ContentBlock>>({});

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/content");
      if (!res.ok) throw new Error(`Failed to load content (${res.status})`);
      const data = await res.json();
      const settingsMap: Record<string, string> = {};
      for (const s of data.settings as SiteSetting[]) settingsMap[s.key] = s.value;
      const blockList = data.blocks as ContentBlock[];
      const blockMap: Record<string, ContentBlock> = {};
      for (const b of blockList) blockMap[b.slug] = b;

      confirmedSettings.current = settingsMap;
      confirmedBlocks.current = blockMap;
      setSettings(settingsMap);
      setBlocks(blockList);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const saveSetting = useCallback(async (key: string) => {
    setSaveStates((p) => ({ ...p, [key]: "saving" }));
    setSaveErrors((p) => { const rest = { ...p }; delete rest[key]; return rest; });
    const value = settings[key] ?? "";
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "setting", key, value }),
      });

      if (!res.ok) throw new Error(`Server rejected the save (${res.status})`);
      confirmedSettings.current[key] = value;
      setSaveStates((p) => ({ ...p, [key]: "saved" }));
      toast.success("Setting saved successfully");
    } catch (err) {
      // Roll back the optimistic edit to the last known-good value.
      setSettings((p) => ({ ...p, [key]: confirmedSettings.current[key] ?? "" }));
      setSaveStates((p) => ({ ...p, [key]: "error" }));
      const msg = err instanceof Error ? err.message : "Save failed";
      setSaveErrors((p) => ({ ...p, [key]: msg }));
      toast.error(msg);
    }
  }, [settings]);

  const saveBlock = useCallback(async (slug: string) => {
    const block = blocks.find((b) => b.slug === slug);
    if (!block) return;
    setSaveStates((p) => ({ ...p, [slug]: "saving" }));
    setSaveErrors((p) => { const rest = { ...p }; delete rest[slug]; return rest; });
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "block", slug, title: block.title, bodyText: block.bodyText, mediaUrl: block.mediaUrl, metadata: block.metadata }),
      });
      if (!res.ok) throw new Error(`Server rejected the save (${res.status})`);
      confirmedBlocks.current[slug] = block;
      setSaveStates((p) => ({ ...p, [slug]: "saved" }));
      toast.success("Content block saved");
    } catch (err) {
      const fallback = confirmedBlocks.current[slug] ?? { slug, title: null, bodyText: null, mediaUrl: null, metadata: null };
      setBlocks((prev) => prev.map((b) => b.slug === slug ? fallback : b));
      setSaveStates((p) => ({ ...p, [slug]: "error" }));
      const msg = err instanceof Error ? err.message : "Save failed";
      setSaveErrors((p) => ({ ...p, [slug]: msg }));
      toast.error(msg);
    }
  }, [blocks]);

  const debouncedSaveSetting = useDebouncedCallback(saveSetting, AUTOSAVE_DELAY_MS);
  const debouncedSaveBlock = useDebouncedCallback(saveBlock, AUTOSAVE_DELAY_MS);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    debouncedSaveSetting(key);
  };

  const handleBlockChange = (slug: string, field: "title" | "bodyText", value: string) => {
    setBlocks((prev) => prev.map((b) => b.slug === slug ? { ...b, [field]: value } : b));
    debouncedSaveBlock(slug);
  };

  const block = (slug: string): ContentBlock =>
    blocks.find((b) => b.slug === slug) ?? { slug, title: null, bodyText: null, mediaUrl: null, metadata: null };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-steel">
        <Loader2 size={20} className="animate-spin" /> Loading content from database…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertTriangle className="text-red-500" size={24} />
        <p className="text-sm text-steel">{loadError}</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={fetchContent}>
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Homepage banner text and location badge. Changes auto-save as you type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingField label="Headline (use \\n for line break)" settingKey="hero.headline" value={settings["hero.headline"] ?? ""} multiline onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["hero.headline"] ?? "idle"} error={saveErrors["hero.headline"]} />
          <SettingField label="Sub-text" settingKey="hero.subtext" value={settings["hero.subtext"] ?? ""} multiline onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["hero.subtext"] ?? "idle"} error={saveErrors["hero.subtext"]} />
          <SettingField label="Location Badge" settingKey="hero.locationBadge" value={settings["hero.locationBadge"] ?? ""} onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["hero.locationBadge"] ?? "idle"} error={saveErrors["hero.locationBadge"]} />
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Contact</CardTitle>
          <CardDescription>Showroom address, phone number, and opening hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingField label="Address" settingKey="location.address" value={settings["location.address"] ?? ""} onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["location.address"] ?? "idle"} error={saveErrors["location.address"]} />
          <SettingField label="Phone Number" settingKey="location.phone" value={settings["location.phone"] ?? ""} onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["location.phone"] ?? "idle"} error={saveErrors["location.phone"]} />
          <SettingField label="Opening Hours" settingKey="location.hours" value={settings["location.hours"] ?? ""} onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["location.hours"] ?? "idle"} error={saveErrors["location.hours"]} />
        </CardContent>
      </Card>

      {/* Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Section</CardTitle>
          <CardDescription>CTA heading and subtext for the newsletter sign-up.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingField label="Heading" settingKey="newsletter.heading" value={settings["newsletter.heading"] ?? ""} onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["newsletter.heading"] ?? "idle"} error={saveErrors["newsletter.heading"]} />
          <SettingField label="Sub-text" settingKey="newsletter.subtext" value={settings["newsletter.subtext"] ?? ""} multiline onChange={handleSettingChange} onSave={saveSetting} saveState={saveStates["newsletter.subtext"] ?? "idle"} error={saveErrors["newsletter.subtext"]} />
        </CardContent>
      </Card>

      {/* Value Props */}
      <Card>
        <CardHeader>
          <CardTitle>Value Propositions</CardTitle>
          <CardDescription>The four selling points shown on the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["value.direct-dealer-pricing","value.on-site-installation","value.commercial-grade-builds","value.delhi-wide-delivery"].map((slug) => (
            <BlockField key={slug} label={slug.replace("value.", "").replace(/-/g, " ")} block={block(slug)} onChange={handleBlockChange} onSave={saveBlock} saveState={saveStates[slug] ?? "idle"} error={saveErrors[slug]} />
          ))}
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>Customer quotes shown on the homepage. Title = Name · Location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["testimonial.1","testimonial.2","testimonial.3"].map((slug) => (
            <BlockField key={slug} label={`Testimonial ${slug.split(".")[1]}`} block={block(slug)} onChange={handleBlockChange} onSave={saveBlock} saveState={saveStates[slug] ?? "idle"} error={saveErrors[slug]} />
          ))}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>About Page Timeline</CardTitle>
          <CardDescription>Company history milestones shown on the About page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["timeline.1","timeline.2","timeline.3","timeline.4"].map((slug, i) => (
            <BlockField key={slug} label={`Milestone ${i + 1}`} block={block(slug)} onChange={handleBlockChange} onSave={saveBlock} saveState={saveStates[slug] ?? "idle"} error={saveErrors[slug]} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
