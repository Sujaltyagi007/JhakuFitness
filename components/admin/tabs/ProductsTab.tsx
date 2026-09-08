"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryId, ModelKind } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, Edit2, ExternalLink, Image as ImageIcon, Video, Check, X, Plus, Trash2, Loader2, Star } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

interface DbCategory {
  id: string;
  name: string;
  blurb: string;
}

interface DbProduct {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  modelKind: string;
  tagline: string;
  specialFeature: string;
  specs: Record<string, string>;
  featured: boolean;
  featureBullets: string[];
  imageUrl: string | null;
  videoUrl: string | null;
  price: number | null;
  colorwayBody: string;
  colorwayAccent: string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ProductsTab() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
      setProducts(pData);
      setCategories(cData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialFeature.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          categoryId: editingProduct.categoryId,
          modelKind: editingProduct.modelKind,
          tagline: editingProduct.tagline,
          specialFeature: editingProduct.specialFeature,
          specs: editingProduct.specs,
          featured: editingProduct.featured,
          featureBullets: editingProduct.featureBullets,
          imageUrl: editingProduct.imageUrl,
          videoUrl: editingProduct.videoUrl,
          price: editingProduct.price,
          colorwayBody: editingProduct.colorwayBody,
          colorwayAccent: editingProduct.colorwayAccent,
        }),
      });
      if (res.ok) {
        const updated: DbProduct = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setEditingProduct(null); }, 900);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSpecChange = (key: string, value: string) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, [key]: value } });
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    if (!editingProduct) return;
    const newSpecs = { ...editingProduct.specs };
    delete newSpecs[keyToRemove];
    setEditingProduct({ ...editingProduct, specs: newSpecs });
  };

  const handleAddSpec = () => {
    if (!editingProduct) return;
    const key = prompt("Enter spec property name (e.g. Incline, Weight):");
    if (!key) return;
    setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, [key]: "" } });
  };

  const handleBulletChange = (i: number, value: string) => {
    if (!editingProduct) return;
    const bullets = [...editingProduct.featureBullets];
    bullets[i] = value;
    setEditingProduct({ ...editingProduct, featureBullets: bullets });
  };

  const handleAddBullet = () => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, featureBullets: [...editingProduct.featureBullets, ""] });
  };

  const handleRemoveBullet = (i: number) => {
    if (!editingProduct) return;
    const bullets = editingProduct.featureBullets.filter((_, idx) => idx !== i);
    setEditingProduct({ ...editingProduct, featureBullets: bullets });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Equipment Catalog</CardTitle>
            <CardDescription>
              {loading ? "Loading from database…" : `${products.length} products in the live database.`}
            </CardDescription>
          </div>
          <div className="w-full sm:w-72 relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search equipment..."
              className="pl-9"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel/60" />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col space-y-4 py-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-ink/8">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink/8 bg-ink/3 text-xs uppercase text-steel">
                  <tr>
                    <th className="px-4 py-3">Machine</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3">Media</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-ink/2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-ink">{p.name}</div>
                        <div className="text-xs text-steel line-clamp-1">{p.tagline}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="capitalize">
                          {p.categoryId.replace(/-/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {p.featured && (
                          <span className="inline-flex items-center gap-1 rounded bg-gold/15 px-1.5 py-0.5 text-xs font-semibold text-gold-deep">
                            <Star size={10} /> Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-steel">
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${p.imageUrl ? "bg-emerald-50 text-emerald-700" : "bg-ink/5 text-steel/70"}`}>
                            <ImageIcon size={12} /> {p.imageUrl ? "Image" : "3D"}
                          </span>
                          {p.videoUrl && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                              <Video size={12} /> Video
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingProduct(p)} className="h-8 gap-1 text-xs">
                            <Edit2 size={12} /> Edit
                          </Button>
                          <Link href={`/products/${p.slug}`} target="_blank"
                            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-gold-deep hover:bg-gold/10">
                            <ExternalLink size={12} />
                          </Link>
                          <button onClick={() => handleDelete(p.id)} className="inline-flex h-8 items-center rounded-md px-2 text-xs text-red-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-ink/10">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Edit Equipment</h2>
                <p className="text-xs text-steel">Saves directly to the live database.</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="rounded-lg p-1 text-steel hover:bg-ink/5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-steel">Machine Name</label>
                  <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-steel">Category</label>
                  <select value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value as CategoryId })}
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-steel">Model Kind</label>
                <select value={editingProduct.modelKind}
                  onChange={(e) => setEditingProduct({ ...editingProduct, modelKind: e.target.value as ModelKind })}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold">
                  {["treadmill", "spin-bike", "cross-trainer", "rower", "ski-machine", "stair-master", "air-bike"].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-steel">Tagline</label>
                <Input value={editingProduct.tagline} onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })} required className="mt-1" />
              </div>

              <div>
                <label className="text-xs font-semibold text-steel">Special Feature Highlight</label>
                <Input value={editingProduct.specialFeature} onChange={(e) => setEditingProduct({ ...editingProduct, specialFeature: e.target.value })} required className="mt-1" />
              </div>

              {/* Colorway */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-steel">Body Color</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" value={editingProduct.colorwayBody} onChange={(e) => setEditingProduct({ ...editingProduct, colorwayBody: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-ink/15" />
                    <Input value={editingProduct.colorwayBody} onChange={(e) => setEditingProduct({ ...editingProduct, colorwayBody: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-steel">Accent Color</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" value={editingProduct.colorwayAccent} onChange={(e) => setEditingProduct({ ...editingProduct, colorwayAccent: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-ink/15" />
                    <Input value={editingProduct.colorwayAccent} onChange={(e) => setEditingProduct({ ...editingProduct, colorwayAccent: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="rounded-xl border border-ink/10 bg-paper/50 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-steel">Media Assets</h4>
                <div>
                  <label className="text-xs font-semibold text-steel flex items-center gap-1.5"><ImageIcon size={14} className="text-gold-deep" /> Image URL</label>
                  <Input value={editingProduct.imageUrl || ""} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value || null })} placeholder="/uploads/treadmill.jpg or CDN URL" className="mt-1 font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-steel flex items-center gap-1.5"><Video size={14} className="text-gold-deep" /> Video URL</label>
                  <Input value={editingProduct.videoUrl || ""} onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value || null })} placeholder="/uploads/walkthrough.mp4 or YouTube URL" className="mt-1 font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-steel">Price (₹, ex-GST)</label>
                  <Input type="number" min={0} value={editingProduct.price ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value ? Number(e.target.value) : null })} placeholder="e.g. 85000" className="mt-1 text-xs" />
                </div>
              </div>

              {/* Specs */}
              <div className="rounded-xl border border-ink/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-steel">Specifications</h4>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSpec} className="h-7 gap-1 text-xs"><Plus size={12} /> Add Spec</Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(editingProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-32 shrink-0 truncate text-xs font-medium text-steel">{key}</span>
                      <Input value={val} onChange={(e) => handleSpecChange(key, e.target.value)} className="h-8 text-xs" />
                      <button type="button" onClick={() => handleRemoveSpec(key)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Bullets */}
              <div className="rounded-xl border border-ink/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-steel">Feature Bullets</h4>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddBullet} className="h-7 gap-1 text-xs"><Plus size={12} /> Add</Button>
                </div>
                <div className="space-y-2">
                  {editingProduct.featureBullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={b} onChange={(e) => handleBulletChange(i, e.target.value)} className="h-8 text-xs" />
                      <button type="button" onClick={() => handleRemoveBullet(i)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-ink/10">
                <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer">
                  <input type="checkbox" checked={!!editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded border-ink/20 text-gold focus:ring-gold" />
                  Feature on Homepage Carousel
                </label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                  <Button type="submit" variant="gold" className="gap-1.5" disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <><Check size={14} /> Saved</> : "Save to DB"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
