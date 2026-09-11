"use client";
import clsx from "clsx";
import { type CategoryId } from "@/lib/types";
import { getPublicProducts } from "@/lib/api";
import { motion, type Transition } from "motion/react";
import { CategoryIcon } from "@/components/ui/CategoryIcons";
import ProductCard, { type CardProduct } from "./ProductCard";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";

export interface DbCategory {
  id: CategoryId;
  name: string;
  blurb: string;
}

export interface DbProduct extends CardProduct {
  categoryId: string;
  specs: Record<string, string>;
}

type SortKey = "name" | "weight" | "featured";

const PAGE_SIZE = 9;

interface ProductGridProps {
  products?: DbProduct[];
  initialProducts?: DbProduct[];
  totalCount?: number;
  categories: DbCategory[];
}

const layoutTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.35,
};

export default function ProductGrid({ products, initialProducts, totalCount, categories }: ProductGridProps) {
  const initialItems = initialProducts ?? products ?? [];
  const [items, setItems] = useState<DbProduct[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [minWeight, setMinWeight] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(totalCount ?? initialItems.length);
  const [loading, setLoading] = useState(false);
  const isFirstMount = useRef(true);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (targetPage: number, cat: string, s: SortKey, weight: number) => {
    setLoading(true);
    try {
      const res = await getPublicProducts<DbProduct>({ page: targetPage, pageSize: PAGE_SIZE, category: cat, sort: s, minWeight: weight, });
      setItems(res.products);
      setTotal(res.total);
    } catch (err: unknown) { console.error("Failed to fetch products:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    fetchPage(page, activeCategory, sort, minWeight);
  }, [page, activeCategory, sort, minWeight, fetchPage]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId); setPage(1);
  };

  const handleSortChange = (newSort: SortKey) => {
    setSort(newSort);
    setPage(1);
  };

  const handleMinWeightChange = (newWeight: number) => {
    setMinWeight(newWeight);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => { setPage(newPage); gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div ref={gridTopRef} className="scroll-mt-28">
      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => handleCategoryChange("all")} className={clsx("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all backdrop-blur-md", activeCategory === "all" ? "border-gold bg-gold text-ink shadow-lg shadow-gold/20" : "border-theme-border bg-theme-surface text-theme-muted hover:bg-theme-surface-hover hover:text-theme-text")} >
          All Equipment
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => handleCategoryChange(c.id)} className={clsx("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all backdrop-blur-md", activeCategory === c.id ? "border-gold bg-gold text-ink shadow-lg shadow-gold/20" : "border-theme-border bg-theme-surface text-theme-muted hover:bg-theme-surface-hover hover:text-theme-text")} >
            <CategoryIcon category={c.id} className="h-4 w-4" />
            {c.name}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-4 border-y border-theme-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-theme-muted">
          <SlidersHorizontal size={15} />
          <span className="flex items-center gap-2">
            Min. user weight
            <Select value={String(minWeight)} onValueChange={(v) => handleMinWeightChange(Number(v))} className="w-32">
              <SelectTrigger className="h-8 rounded-lg px-2 py-1.5 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="130">130 kg+</SelectItem>
                <SelectItem value="150">150 kg+</SelectItem>
                <SelectItem value="200">200 kg+</SelectItem>
              </SelectContent>
            </Select>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm text-theme-muted">
            Sort by
            <Select value={sort} onValueChange={(v) => handleSortChange(v as SortKey)} className="w-40">
              <SelectTrigger className="h-8 rounded-lg px-2 py-1.5 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Popularity</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="weight">Weight capacity</SelectItem>
              </SelectContent>
            </Select>
          </span>
          <div className="flex overflow-hidden rounded-lg border border-theme-border">
            <button onClick={() => setView("grid")} aria-label="Grid view" className={clsx("flex h-8 w-9 items-center justify-center transition-colors", view === "grid" ? "bg-theme-text text-theme-bg" : "text-theme-muted hover:bg-theme-surface-hover")}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView("list")} aria-label="List view" className={clsx("flex h-8 w-9 items-center justify-center transition-colors", view === "list" ? "bg-theme-text text-theme-bg" : "text-theme-muted hover:bg-theme-surface-hover")}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-theme-muted">{total} {total === 1 ? "model" : "models"}</p>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gold">
            <Loader2 size={14} className="animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {items.length === 0 && !loading ? (
        <div className="mt-10 rounded-2xl border border-dashed border-theme-border py-16 text-center text-theme-muted">
          No equipment matches these filters yet. Try widening your search.
        </div>
      ) : (
        <motion.div layout transition={layoutTransition} className={clsx("mt-6 grid gap-6 transition-opacity duration-200",
          loading && "opacity-60", view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {items.map((product) => (
            <motion.div key={product.id} layout transition={layoutTransition} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <ProductCard product={product} view={view} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center sm:justify-between gap-4 border-t border-theme-border pt-6">
          <p className="text-xs sm:text-sm text-theme-muted">
            Showing <span className="font-semibold text-theme-text">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
            <span className="font-semibold text-theme-text">
              {Math.min(page * PAGE_SIZE, total)}
            </span>{" "}
            of <span className="font-semibold text-theme-text">{total}</span> models
          </p>

          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"} />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink isActive={p === page} onClick={() => handlePageChange(p)} className="cursor-pointer">
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (Math.abs(p - page) === 2) {
                  return (<PaginationItem key={p}><PaginationEllipsis /></PaginationItem>);
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
