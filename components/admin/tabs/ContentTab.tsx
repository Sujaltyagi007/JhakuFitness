"use client";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { TabButtonSkeleton, ContentHeaderSkeleton, FormFieldSkeleton } from "@/components/ui/Skeletons";
import { getContent, upsertSiteSetting, upsertContentBlock } from "@/lib/api";
import CountrieCodeBtn from "@/components/ui/CountrieCodeBtn";
import { COUNTRIES, type Country } from "@/lib/hooks/Countrielist";
import { AlertTriangle, Loader2, RefreshCw, Save } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface SiteSetting { key: string; value: string }
interface ContentBlock {
  slug: string;
  title: string | null;
  bodyText: string | null;
  mediaUrl: string | null;
  metadata: Record<string, unknown> | null;
}

const AUTOSAVE_DELAY_MS = 900;


function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      maxLength={300}
      className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold resize-none leading-relaxed"
    />
  );
}

const SettingField = memo(function SettingField({ label, settingKey, value, multiline, onChange, className }: {
  label: string;
  settingKey: string;
  value: string;
  multiline?: boolean;
  onChange: (key: string, value: string) => void;
  className?: string;
}) {
  return (
    <div className={`${className}`} >
      <div className="flex items-center justify-between">
        <label className="text-xs px-3 font-semibold text-steel">{label}</label>
      </div>
      {multiline ? (
        <Textarea value={value} onChange={(v) => onChange(settingKey, v)} />
      ) : (
        <Input value={value} onChange={(e) => onChange(settingKey, e.target.value)} minLength={3} maxLength={50} className="mt-1" />
      )}
    </div>
  );
});

const PhoneSettingField = memo(function PhoneSettingField({ label, settingKey, value, onChange, className }: {
  label: string;
  settingKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
  className?: string;
}) {
  const defaultCountry = COUNTRIES.find((c) => c.code === "IN") || COUNTRIES[0];
  const [country, setCountry] = useState<Country>(defaultCountry);

  return (
    <div className={`${className}`} >
      <div className="flex items-center justify-between">
        <label className="text-xs px-3 font-semibold text-steel">{label}</label>
      </div>
      <div className="mt-1 flex h-11 w-full items-stretch overflow-hidden rounded-xl border border-ink/15 bg-white focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30 transition-colors">
        <CountrieCodeBtn
          value={country}
          onChange={setCountry}
          autoDetected={false}
          onManualChange={() => { }}
          className="bg-transparent! border-0! border-r! border-ink/15! rounded-none! px-3.5! py-2! text-sm! text-ink! hover:bg-ink/5!"
        />
        <input
          value={value}
          onChange={(e) => onChange(settingKey, e.target.value)}
          className="w-full bg-transparent px-3.5 py-2 text-sm text-ink outline-none placeholder:text-steel/70 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
});

const BlockField = memo(function BlockField({ label, block, onChange }: {
  label: string; block: ContentBlock;
  onChange: (slug: string, field: "title" | "bodyText", value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-ink/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-steel">{label}</h4>
      </div>
      <div>
        <label className="text-xs font-semibold text-steel">Title / Author</label>
        <Input
          value={block.title ?? ""}
          onChange={(e) => {
            let val = e.target.value;
            val = val.replace(/^\s+/, '').replace(/[0-9]/g, '');
            onChange(block.slug, "title", val);
          }}
          minLength={3}
          maxLength={50}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-steel">Body Text</label>
        <Textarea value={block.bodyText ?? ""} onChange={(v) => onChange(block.slug, "bodyText", v)} rows={3} />
      </div>
    </div>
  );
});

export default function ContentTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [activeTab, setActiveTab] = useState("site-info");
  const [shakeButton, setShakeButton] = useState(false);
  const confirmedSettings = useRef<Record<string, string>>({});
  const confirmedBlocks = useRef<Record<string, ContentBlock>>({});

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getContent();
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

  const handleSettingChange = useCallback((key: string, value: string) => {
    setSettings((p) => ({ ...p, [key]: value }));
  }, []);

  const handleBlockChange = useCallback((slug: string, field: "title" | "bodyText", value: string) => {
    setBlocks((prev) => prev.map((b) => b.slug === slug ? { ...b, [field]: value } : b));
  }, []);

  const saveAll = async () => {
    setIsSavingAll(true);
    try {
      const promises: Promise<unknown>[] = [];
      let successCount = 0;
      let failCount = 0;

      for (const [key, value] of Object.entries(settings)) {
        if (value !== confirmedSettings.current[key]) {
          promises.push(
            upsertSiteSetting(key, value as string)
              .then(() => { confirmedSettings.current[key] = value; successCount++; })
              .catch(() => { failCount++; })
          );
        }
      }

      for (const block of blocks) {
        const confirmed = confirmedBlocks.current[block.slug];
        if (!confirmed || block.title !== confirmed.title || block.bodyText !== confirmed.bodyText || block.mediaUrl !== confirmed.mediaUrl || JSON.stringify(block.metadata) !== JSON.stringify(confirmed.metadata)) {
          promises.push(
            upsertContentBlock({ slug: block.slug, title: block.title ?? undefined, bodyText: block.bodyText ?? undefined, mediaUrl: block.mediaUrl ?? undefined, metadata: block.metadata ?? undefined }).then(() => { confirmedBlocks.current[block.slug] = block; successCount++; }).catch(() => { failCount++; })
          );
        }
      }

      if (promises.length === 0) {
        toast.success("No changes to save");
        setIsSavingAll(false);
        return;
      }
      await Promise.all(promises);
      if (failCount > 0) toast.error(`Failed to save ${failCount} item(s)`);
      else toast.success("All changes saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSavingAll(false);
    }
  };

  const block = useCallback((slug: string) => {
    return blocks.find((b) => b.slug === slug) ?? { slug, title: null, bodyText: null, mediaUrl: null, metadata: null };
  }, [blocks]);

  const hasChanges = useMemo(() => {
    if (Object.keys(settings).length === 0) return false;
    for (const [key, value] of Object.entries(settings)) {
      if (value !== confirmedSettings.current[key]) return true;
    }
    for (const block of blocks) {
      const confirmed = confirmedBlocks.current[block.slug];
      if (
        !confirmed ||
        block.title !== confirmed.title ||
        block.bodyText !== confirmed.bodyText ||
        block.mediaUrl !== confirmed.mediaUrl ||
        JSON.stringify(block.metadata) !== JSON.stringify(confirmed.metadata)
      ) {
        return true;
      }
    }
    return false;
  }, [settings, blocks]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <TabButtonSkeleton widthClass="w-24" />
          <TabButtonSkeleton widthClass="w-32" />
          <TabButtonSkeleton widthClass="w-28" />
          <TabButtonSkeleton widthClass="w-32" />
        </div>
        <div className="flex-1 space-y-8 mt-2">
          <Card>
            <CardHeader>
              <ContentHeaderSkeleton />
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </CardContent>
          </Card>
        </div>
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

  const TABS = [
    { id: "site-info", label: "Site Info" },
    { id: "contact-details", label: "Contact Details" },
    { id: "footer-data", label: "Footer Data" },
    { id: "page-content", label: "Page Content" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide -mx-1 px-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => {
                if (hasChanges && !isActive) {
                  toast.error("Please save or discard your changes first.", 3500);
                  setShakeButton(true);
                  setTimeout(() => setShakeButton(false), 500);
                  return;
                }
                setActiveTab(tab.id);
              }}
                className={`relative shrink-0 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-ink font-semibold" : "text-steel hover:bg-ink/5 hover:text-ink"}`}>
                {isActive && (
                  <motion.div
                    layoutId="active-content-tab"
                    className="absolute inset-0 bg-gold rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 items-center shrink-0">
          {hasChanges && (
            <Button className="text-black! bg-gray-200!" variant="outline" disabled={isSavingAll} onClick={() => {
              setSettings({ ...confirmedSettings.current });
              fetchContent();
            }}>
              Discard
            </Button>
          )}
          <motion.div animate={shakeButton ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
            <Button onClick={saveAll} disabled={isSavingAll || !hasChanges} className={hasChanges ? "bg-green-600 text-white hover:bg-green-700 font-semibold px-4" : "bg-gold text-ink hover:bg-gold/90 font-semibold px-4"}>
              {isSavingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {activeTab === "site-info" && (
          <Fragment>
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Homepage banner text and location badge.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingField label="Headline (use \n for line break)" settingKey="hero.headline" value={settings["hero.headline"] ?? ""} multiline onChange={handleSettingChange} />
                <SettingField label="Sub-text" settingKey="hero.subtext" value={settings["hero.subtext"] ?? ""} multiline onChange={handleSettingChange} />
                <SettingField label="Location Badge" settingKey="hero.locationBadge" value={settings["hero.locationBadge"] ?? ""} onChange={handleSettingChange} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Newsletter Section</CardTitle>
                <CardDescription>CTA heading and subtext for the newsletter sign-up.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingField label="Heading" settingKey="newsletter.heading" value={settings["newsletter.heading"] ?? ""} onChange={handleSettingChange} />
                <SettingField label="Sub-text" settingKey="newsletter.subtext" value={settings["newsletter.subtext"] ?? ""} multiline onChange={handleSettingChange} />
              </CardContent>
            </Card>
          </Fragment>
        )}

        {activeTab === "contact-details" && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>Global contact details used in the header, footer, and contact page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 w-full " >
                <PhoneSettingField label="Phone Number" className="w-full" settingKey="site.phone" value={settings["site.phone"] ?? ""} onChange={handleSettingChange} />
                <SettingField label="Email Address" className="w-full" settingKey="site.email" value={settings["site.email"] ?? ""} onChange={handleSettingChange} />
              </div>
              <SettingField label="Showroom Address" settingKey="site.address" value={settings["site.address"] ?? ""} multiline onChange={handleSettingChange} />
              <SettingField label="Opening Hours" settingKey="site.hours" value={settings["site.hours"] ?? ""} onChange={handleSettingChange} />
              <SettingField label="WhatsApp Link (URL)" settingKey="site.whatsapp" value={settings["site.whatsapp"] ?? ""} onChange={handleSettingChange} />
              <SettingField label="Google Maps Embed URL" settingKey="site.mapUrl" value={settings["site.mapUrl"] ?? ""} onChange={handleSettingChange} />
            </CardContent>
          </Card>
        )}

        {activeTab === "footer-data" && (
          <Card>
            <CardHeader>
              <CardTitle>Footer Data</CardTitle>
              <CardDescription>Description and social links shown in the footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingField label="Footer Description" settingKey="site.footerText" value={settings["site.footerText"] ?? ""} multiline onChange={handleSettingChange} />
              <SettingField label="Facebook URL" settingKey="site.facebook" value={settings["site.facebook"] ?? ""} onChange={handleSettingChange} />
              <SettingField label="Instagram URL" settingKey="site.instagram" value={settings["site.instagram"] ?? ""} onChange={handleSettingChange} />
              <SettingField label="YouTube URL" settingKey="site.youtube" value={settings["site.youtube"] ?? ""} onChange={handleSettingChange} />
            </CardContent>
          </Card>
        )}

        {activeTab === "page-content" && (
          <Fragment>
            <Card>
              <CardHeader>
                <CardTitle>Value Propositions</CardTitle>
                <CardDescription>The four selling points shown on the homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["value.direct-dealer-pricing", "value.on-site-installation", "value.commercial-grade-builds", "value.delhi-wide-delivery"].map((slug) => (
                  <BlockField key={slug} label={slug.replace("value.", "").replace(/-/g, " ")} block={block(slug)} onChange={handleBlockChange} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Customer quotes shown on the homepage. Title = Name · Location.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["testimonial.1", "testimonial.2", "testimonial.3"].map((slug) => (
                  <BlockField key={slug} label={`Testimonial ${slug.split(".")[1]}`} block={block(slug)} onChange={handleBlockChange} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Page Timeline</CardTitle>
                <CardDescription>Company history milestones shown on the About page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["timeline.1", "timeline.2", "timeline.3", "timeline.4"].map((slug, i) => (
                  <BlockField key={slug} label={`Milestone ${i + 1}`} block={block(slug)} onChange={handleBlockChange} />
                ))}
              </CardContent>
            </Card>
          </Fragment>
        )}
      </div>
    </div>
  );
}
