"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { type CategoryId } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcons";
import ProductCard, { type CardProduct } from "./ProductCard";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

export interface DbCategory { id: CategoryId; name: string; blurb: string }
export interface DbProduct extends CardProduct {
  categoryId: string;
  specs: Record<string, string>;
}

type SortKey = "name" | "weight" | "featured";

function getMaxWeight(specs: Record<string, string>) {
  const raw = specs["Max User Weight"];
  if (!raw) return 0;
  const match = raw.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

interface ProductGridProps {
  products: DbProduct[];
  categories: DbCategory[];
}

export default function ProductGrid({ products, categories }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [minWeight, setMinWeight] = useState(0);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all") list = list.filter((p) => p.categoryId === activeCategory);
    if (minWeight > 0) list = list.filter((p) => getMaxWeight(p.specs) >= minWeight);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "weight") list.sort((a, b) => getMaxWeight(b.specs) - getMaxWeight(a.specs));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, activeCategory, sort, minWeight]);

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => setActiveCategory("all")}
          className={clsx("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all backdrop-blur-md",
            activeCategory === "all" ? "border-gold bg-gold text-ink shadow-lg shadow-gold/20" : "border-theme-border bg-theme-surface text-theme-muted hover:bg-theme-surface-hover hover:text-theme-text")}>
          All Equipment
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={clsx("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all backdrop-blur-md",
              activeCategory === c.id ? "border-gold bg-gold text-ink shadow-lg shadow-gold/20" : "border-theme-border bg-theme-surface text-theme-muted hover:bg-theme-surface-hover hover:text-theme-text")}>
            <CategoryIcon category={c.id} className="h-4 w-4" />
            {c.name}
          </button>
        ))}
      </div>

      {/* toolbar */}
      <div className="mt-6 flex flex-col gap-4 border-y border-theme-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-theme-muted">
          <SlidersHorizontal size={15} />
          <label className="flex items-center gap-2">
            Min. user weight
            <select value={minWeight} onChange={(e) => setMinWeight(Number(e.target.value))}
              className="rounded-lg border border-theme-border bg-theme-surface px-2 py-1.5 text-sm text-theme-text outline-none focus:border-gold">
              <option value={0}>Any</option>
              <option value={130}>130 kg+</option>
              <option value={150}>150 kg+</option>
              <option value={200}>200 kg+</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-theme-muted">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-theme-border bg-theme-surface px-2 py-1.5 text-sm text-theme-text outline-none focus:border-gold">
              <option value="featured">Popularity</option>
              <option value="name">Name</option>
              <option value="weight">Weight capacity</option>
            </select>
          </label>
          <div className="flex overflow-hidden rounded-lg border border-theme-border">
            <button onClick={() => setView("grid")} aria-label="Grid view"
              className={clsx("flex h-8 w-9 items-center justify-center transition-colors", view === "grid" ? "bg-theme-text text-theme-bg" : "text-theme-muted hover:bg-theme-surface-hover")}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView("list")} aria-label="List view"
              className={clsx("flex h-8 w-9 items-center justify-center transition-colors", view === "list" ? "bg-theme-text text-theme-bg" : "text-theme-muted hover:bg-theme-surface-hover")}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-theme-muted">{filtered.length} {filtered.length === 1 ? "model" : "models"}</p>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-theme-border py-16 text-center text-theme-muted">
          No equipment matches these filters yet. Try widening your search.
        </div>
      ) : (
        <motion.div layout className={clsx("mt-6 grid gap-6", view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:max-w-3xl")}>
          {filtered.map((product) => (
            <motion.div key={product.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
