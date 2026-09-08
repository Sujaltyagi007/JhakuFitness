"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  Layers,
  BarChart2,
  Star,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DbCategory { id: string; name: string }
interface DbProduct { id: string; categoryId: string; featured: boolean }
interface StockEntry { productId: string; qty: number; minQty: number; product: { name: string; price: number | null } }

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

function getStockStatus(s: StockEntry): StockStatus {
  if (s.qty === 0) return "out-of-stock";
  if (s.qty <= s.minQty) return "low-stock";
  return "in-stock";
}

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  if (n >= 10_00_000)
    return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000)
    return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
}



// ─── sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, accent }: {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-steel">{label}</CardTitle>
        <Icon size={18} className={accent ?? "text-gold-deep"} />
      </CardHeader>
      <CardContent>
        <div className="font-display text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-steel">{sub}</p>
      </CardContent>
    </Card>
  );
}

// Horizontal bar chart — pure CSS, no library
function HBarChart({
  data,
  maxValue,
  colorClass,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-xs text-ink font-medium">
            {d.label}
          </span>
          <div className="flex-1 rounded-full bg-ink/8 h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
              style={{ width: `${maxValue ? (d.value / maxValue) * 100 : 0}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs font-semibold text-ink">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Donut-style segmented bar
function StockHealthBar({
  inStock,
  lowStock,
  outOfStock,
  total,
}: {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  total: number;
}) {
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  return (
    <div className="space-y-4">
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct(inStock)}%` }}
          title={`In Stock: ${inStock}`}
        />
        <div
          className="bg-amber-400 transition-all duration-500"
          style={{ width: `${pct(lowStock)}%` }}
          title={`Low Stock: ${lowStock}`}
        />
        <div
          className="bg-red-400 transition-all duration-500"
          style={{ width: `${pct(outOfStock)}%` }}
          title={`Out of Stock: ${outOfStock}`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-steel">
            In Stock — <strong className="text-ink">{inStock}</strong>{" "}
            <span className="text-steel/60">({pct(inStock)}%)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="text-steel">
            Low Stock — <strong className="text-ink">{lowStock}</strong>{" "}
            <span className="text-steel/60">({pct(lowStock)}%)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" />
          <span className="text-steel">
            Out of Stock — <strong className="text-ink">{outOfStock}</strong>{" "}
            <span className="text-steel/60">({pct(outOfStock)}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function AnalyticsTab() {
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/inventory").then(r => r.json()),
      fetch("/api/admin/products").then(r => r.json()),
      fetch("/api/admin/categories").then(r => r.json()),
    ]).then(([sData, pData, cData]) => {
      setStock(sData);
      setProducts(pData);
      setCategories(cData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // KPI derivations
  const totalUnits = stock.reduce((sum, s) => sum + s.qty, 0);
  const totalValue = stock.reduce((sum, s) => sum + s.qty * (s.product.price ?? 0), 0);
  const inStockCount = stock.filter((e) => getStockStatus(e) === "in-stock").length;
  const lowStockCount = stock.filter((e) => getStockStatus(e) === "low-stock").length;
  const outCount = stock.filter((e) => getStockStatus(e) === "out-of-stock").length;
  const featuredCount = products.filter((p) => p.featured).length;

  // Category breakdown
  const categoryBreakdown = categories.map((c) => ({
    label: c.name,
    value: products.filter((p) => p.categoryId === c.id).length,
  }));
  const maxCatValue = Math.max(...categoryBreakdown.map((d) => d.value), 1);

  // Stock by category
  const stockByCategory = categories.map((c) => {
    const ids = products.filter((p) => p.categoryId === c.id).map((p) => p.id);
    const units = stock.filter((s) => ids.includes(s.productId)).reduce((sum, s) => sum + s.qty, 0);
    return { label: c.name, value: units };
  });
  const maxStockValue = Math.max(...stockByCategory.map((d) => d.value), 1);

  // Top stocked
  const topStocked = [...stock].sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Low stock alerts
  const lowAlerts = stock
    .filter((e) => getStockStatus(e) !== "in-stock")
    .map((e) => ({ ...e, status: getStockStatus(e) }));

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Total Products"
          value={products.length}
          sub="In active catalog"
          icon={Package}
        />
        <KpiCard
          label="Featured Flagships"
          value={featuredCount}
          sub="Pinned on carousel"
          icon={Star}
        />
        <KpiCard
          label="Total Stock Units"
          value={totalUnits}
          sub="Across all SKUs"
          icon={Layers}
        />
        <KpiCard
          label="Inventory Value"
          value={fmtCurrency(totalValue)}
          sub="Ex-GST estimate"
          icon={IndianRupee}
          accent={totalValue > 0 ? "text-emerald-600" : "text-steel"}
        />
      </div>

      {/* Stock health + category breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 size={16} className="text-gold-deep" />
              Stock Health Overview
            </CardTitle>
            <CardDescription>
              Distribution across {products.length} SKUs (live database)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockHealthBar
              inStock={inStockCount}
              lowStock={lowStockCount}
              outOfStock={outCount}
              total={products.length}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={16} className="text-gold-deep" />
              Catalog by Category
            </CardTitle>
            <CardDescription>Products per equipment class</CardDescription>
          </CardHeader>
          <CardContent>
            <HBarChart
              data={categoryBreakdown}
              maxValue={maxCatValue}
              colorClass="bg-gold"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stock units by category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold-deep" />
            Stock Units by Category
          </CardTitle>
          <CardDescription>
            Total units on hand per equipment class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HBarChart
            data={stockByCategory}
            maxValue={maxStockValue}
            colorClass="bg-emerald-500"
          />
        </CardContent>
      </Card>

      {/* Top stocked */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Stocked SKUs</CardTitle>
            <CardDescription>Highest quantity on hand</CardDescription>
          </CardHeader>
          <CardContent>
            {topStocked.every((e) => e.qty === 0) ? (
              <p className="text-sm text-steel">
                No stock recorded yet. Go to the Inventory tab to add units.
              </p>
            ) : (
              <ol className="space-y-2">
                {topStocked.map((e, i) => (
                  <li key={e.productId} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold-deep">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-ink">
                      {e.product.name}
                    </span>
                    <span className="font-display text-lg font-bold text-ink">
                      {e.qty}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Low stock / out alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Reorder Alerts
            </CardTitle>
            <CardDescription>
              SKUs at or below minimum threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowAlerts.length === 0 ? (
              <p className="text-sm text-emerald-700 font-medium">
                ✓ All products are above their reorder threshold.
              </p>
            ) : (
              <ul className="space-y-2">
                {lowAlerts.map((e) => (
                  <li
                    key={e.productId}
                    className="flex items-center justify-between rounded-lg border border-ink/8 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-ink truncate">
                      {e.product.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-sm font-bold text-ink">{e.qty} units</span>
                      {e.status === "out-of-stock" ? (
                        <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-600">
                          Out
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Low
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
