"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Package, TrendingUp, TrendingDown, RotateCcw,
  ChevronDown, ChevronUp, AlertTriangle, IndianRupee, Loader2, RefreshCw,
} from "lucide-react";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { toast } from "@/components/ui/Toast";

// ─── types ────────────────────────────────────────────────────────────────────

interface StockRow {
  productId: string;
  qty: number;
  minQty: number;
  price: number | null;
  product: { id: string; name: string; categoryId: string; price: number | null };
}

interface Movement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  qty: number;
  note: string | null;
  date: string;
  product: { name: string };
}

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

const MIN_QTY_DEBOUNCE_MS = 600;

// ─── helpers ─────────────────────────────────────────────────────────────────

function getStatus(row: StockRow): StockStatus {
  if (row.qty === 0) return "out-of-stock";
  if (row.qty <= row.minQty) return "low-stock";
  return "in-stock";
}

function fmt(n: number) { return new Intl.NumberFormat("en-IN").format(n); }

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: StockStatus }) {
  if (status === "in-stock") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">In Stock</span>;
  if (status === "low-stock") return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"><AlertTriangle size={10} /> Low</span>;
  return <span className="inline-flex items-center gap-1 rounded-full text-nowrap bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 border border-red-200">Out of Stock</span>;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function InventoryTab() {
  const [stock, setStock] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  // Rows with a mutation in flight — used to disable their action buttons so a
  // double-click can't fire two overlapping movements against the same SKU.
  const [pendingRows, setPendingRows] = useState<Set<string>>(new Set());

  const setRowPending = (productId: string, pending: boolean) => {
    setPendingRows((prev) => {
      const next = new Set(prev);
      if (pending) next.add(productId); else next.delete(productId);
      return next;
    });
  };

  const setRowError = (productId: string, message: string | null) => {
    setRowErrors((prev) => {
      if (!message) {
        const rest = { ...prev };
        delete rest[productId];
        return rest;
      }
      return { ...prev, [productId]: message };
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [sRes, mRes] = await Promise.all([
        fetch("/api/admin/inventory"),
        fetch("/api/admin/movements"),
      ]);
      if (!sRes.ok || !mRes.ok) throw new Error("Failed to load inventory data.");
      const [sData, mData] = await Promise.all([sRes.json(), mRes.json()]);
      setStock(sData);
      setMovements(mData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyMovement = async (productId: string, type: "IN" | "OUT" | "ADJUSTMENT", qty: number, note: string) => {
    if (pendingRows.has(productId)) return;
    setRowPending(productId, true);
    setRowError(productId, null);

    const delta = type === "IN" ? qty : type === "OUT" ? -qty : qty;
    const previousStock = stock;
    const productName = stock.find((s) => s.productId === productId)?.product.name ?? "";

    setStock((prev) => prev.map((s) => s.productId === productId ? { ...s, qty: Math.max(0, s.qty + delta) } : s));

    try {
      const res = await fetch("/api/admin/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, type, qty: Math.abs(qty), note }),
      });
      if (!res.ok) throw new Error(`Server rejected the movement (${res.status})`);
      const saved = await res.json() as Movement;
      setMovements((prev) => [{ ...saved, product: { name: productName } }, ...prev]);
      toast.success(`Stock updated: ${productName} (${type === "IN" ? "+" : type === "OUT" ? "-" : ""}${Math.abs(qty)})`);
    } catch (err) {
      // Roll back the optimistic qty change.
      setStock(previousStock);
      const errMsg = err instanceof Error ? err.message : "Movement failed";
      setRowError(productId, errMsg);
      toast.error(errMsg);
    } finally {
      setRowPending(productId, false);
    }
  };

  const applyCustomQty = async (productId: string) => {
    const raw = qtyInputs[productId] ?? "";
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed === 0) return;
    const note = noteInputs[productId] ?? "";
    const type = parsed > 0 ? "IN" : "OUT";
    await applyMovement(productId, type, Math.abs(parsed), note || (parsed > 0 ? "Restock" : "Stock out"));
    setQtyInputs((p) => ({ ...p, [productId]: "" }));
    setNoteInputs((p) => ({ ...p, [productId]: "" }));
  };

  const saveMinQty = useCallback(async (productId: string, minQty: number) => {
    const previousStock = stock;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, minQty }),
      });
      if (!res.ok) throw new Error(`Server rejected the update (${res.status})`);
    } catch (err) {
      setStock(previousStock);
      setRowError(productId, err instanceof Error ? err.message : "Update failed");
    }
  }, [stock]);

  const debouncedSaveMinQty = useDebouncedCallback(saveMinQty, MIN_QTY_DEBOUNCE_MS);

  const applyMinQty = (productId: string, minQty: number) => {
    setStock((prev) => prev.map((s) => s.productId === productId ? { ...s, minQty } : s));
    debouncedSaveMinQty(productId, minQty);
  };

  const applyPrice = async (productId: string) => {
    const raw = priceInputs[productId] ?? "";
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    const previousStock = stock;
    setStock((prev) => prev.map((s) => s.productId === productId ? { ...s, price: parsed, product: { ...s.product, price: parsed } } : s));
    setPriceInputs((p) => ({ ...p, [productId]: "" }));
    setEditingPrice(null);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, price: parsed }),
      });
      if (!res.ok) throw new Error(`Server rejected the price update (${res.status})`);
    } catch (err) {
      setStock(previousStock);
      setRowError(productId, err instanceof Error ? err.message : "Price update failed");
    }
  };

  const totalUnits = stock.reduce((sum, s) => sum + s.qty, 0);
  const totalValue = stock.reduce((sum, s) => sum + s.qty * (s.product.price ?? 0), 0);
  const lowCount = stock.filter((s) => getStatus(s) === "low-stock").length;
  const outCount = stock.filter((s) => getStatus(s) === "out-of-stock").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-steel">
        <Loader2 size={20} className="animate-spin" /> Loading inventory from database…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertTriangle className="text-red-500" size={24} />
        <p className="text-sm text-steel">{loadError}</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={fetchData}>
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="hover:border-gold/30 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-steel">Total Units</CardTitle>
            <Package size={18} className="text-gold-deep" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{fmt(totalUnits)}</div>
            <p className="mt-1 text-xs text-steel">Across all SKUs</p>
          </CardContent>
        </Card>
        <Card className="hover:border-gold/30 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-steel">Stock Value</CardTitle>
            <IndianRupee size={18} className="text-gold-deep" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{fmtCurrency(totalValue)}</div>
            <p className="mt-1 text-xs text-steel">Ex-GST valuation</p>
          </CardContent>
        </Card>
        <Card className="hover:border-amber-500/30 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-steel">Low Stock</CardTitle>
            <AlertTriangle size={18} className="text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold text-amber-600">{lowCount}</div>
            <p className="mt-1 text-xs text-steel">Below threshold</p>
          </CardContent>
        </Card>
        <Card className="hover:border-red-400/30 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-steel">Out of Stock</CardTitle>
            <Package size={18} className="text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold text-red-600">{outCount}</div>
            <p className="mt-1 text-xs text-steel">Zero units on hand</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>
            Live inventory from the database. Negative custom qty = stock out.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/8 bg-ink/5 text-xs uppercase text-steel">
                <tr>
                  <th className="px-4 py-4 font-semibold tracking-wider">Product</th>
                  <th className="px-4 py-4 text-center font-semibold tracking-wider">Status</th>
                  <th className="px-4 py-4 font-semibold tracking-wider text-center">Qty</th>
                  <th className="px-4 py-4 font-semibold tracking-wider text-center">Min</th>
                  <th className="px-4 py-4 text-center font-semibold tracking-wider">Price (₹)</th>
                  <th className="px-4 py-4 font-semibold tracking-wider">Quick Actions</th>
                  <th className="px-4 py-4 font-semibold tracking-wider">Custom Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {stock.map((s) => {
                  const status = getStatus(s);
                  const price = s.product.price;
                  const isPending = pendingRows.has(s.productId);
                  const rowError = rowErrors[s.productId];
                  return (
                    <tr key={s.productId} className="hover:bg-ink/5 transition-all group">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-ink leading-tight">{s.product.name}</div>
                        <div className="text-xs text-steel capitalize mt-0.5">{s.product.categoryId.replace(/-/g, " ")}</div>
                        {rowError && (
                          <button onClick={() => setRowError(s.productId, null)} className="mt-1 flex items-center gap-1 text-xs text-red-600 hover:underline" title="Dismiss">
                            <AlertTriangle size={10} /> {rowError}
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-4 text-center"><StatusBadge status={status} /></td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-display text-xl font-bold text-ink group-hover:text-gold-deep transition-colors">{s.qty}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Input type="number" min={0} value={s.minQty}
                          onChange={(e) => applyMinQty(s.productId, parseInt(e.target.value) || 0)}
                          className="h-8 w-16 text-center text-xs mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        {editingPrice === s.productId ? (
                          <div className="flex items-center gap-1">
                            <Input type="number" min={0} value={priceInputs[s.productId] ?? ""}
                              onChange={(e) => setPriceInputs((prev) => ({ ...prev, [s.productId]: e.target.value }))}
                              placeholder="e.g. 85000" className="h-8 w-28 text-xs" autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") applyPrice(s.productId); if (e.key === "Escape") setEditingPrice(null); }} />
                            <button onClick={() => applyPrice(s.productId)} className="text-xs text-emerald-700 font-semibold px-1">✓</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingPrice(s.productId); setPriceInputs((prev) => ({ ...prev, [s.productId]: price?.toString() ?? "" })); }}
                            className="text-xs text-ink/60 hover:text-gold-deep underline-offset-2 hover:underline">
                            {price ? fmtCurrency(price) : "Set price"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {[1, 5, 10].map((n) => (
                            <button key={n} onClick={() => applyMovement(s.productId, "IN", n, `Quick +${n}`)}
                              disabled={isPending}
                              className="flex h-8 px-2.5 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none">
                              +{n}
                            </button>
                          ))}
                          <div className="w-px h-5 bg-ink/10 mx-1" />
                          <button onClick={() => applyMovement(s.productId, "OUT", 1, "Quick -1")}
                            disabled={isPending || s.qty === 0}
                            className="flex h-8 px-2.5 items-center justify-center rounded-full bg-red-500/10 text-xs font-bold text-red-600 hover:bg-red-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                            -1
                          </button>
                          {isPending && <Loader2 size={14} className="animate-spin text-steel ml-1" />}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Input type="number" value={qtyInputs[s.productId] ?? ""}
                            onChange={(e) => setQtyInputs((prev) => ({ ...prev, [s.productId]: e.target.value }))}
                            placeholder="± Qty" className="h-9 w-20 text-xs rounded-xl bg-ink/5 border-transparent focus:bg-white transition-colors" />
                          <Input value={noteInputs[s.productId] ?? ""}
                            onChange={(e) => setNoteInputs((prev) => ({ ...prev, [s.productId]: e.target.value }))}
                            placeholder="Note (opt)" className="h-9 w-28 text-xs rounded-xl bg-ink/5 border-transparent focus:bg-white transition-colors" />
                          <Button variant="default" size="sm"
                            className="h-9 text-xs px-4 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                            onClick={() => applyCustomQty(s.productId)} disabled={isPending || !qtyInputs[s.productId]}>
                            Apply
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Movement Log */}
      <Card>
        <CardHeader>
          <button className="flex w-full items-center justify-between text-left" onClick={() => setShowLog((v) => !v)}>
            <div>
              <CardTitle>Movement Log</CardTitle>
              <CardDescription className="mt-0.5">Last {Math.min(movements.length, 50)} stock movements (from database)</CardDescription>
            </div>
            {showLog ? <ChevronUp size={18} className="text-steel" /> : <ChevronDown size={18} className="text-steel" />}
          </button>
        </CardHeader>
        {showLog && (
          <CardContent className="p-0">
            {movements.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-steel">No movements recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-ink/8 bg-ink/3 text-xs uppercase text-steel">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/8">
                    {movements.slice(0, 50).map((m) => (
                      <tr key={m.id} className="hover:bg-ink/2 transition-colors">
                        <td className="px-4 py-2.5 text-xs text-steel whitespace-nowrap">{fmtDate(m.date)}</td>
                        <td className="px-4 py-2.5"><span className="font-medium text-ink">{m.product.name}</span></td>
                        <td className="px-4 py-2.5">
                          {m.type === "IN" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><TrendingUp size={12} /> IN</span>
                          ) : m.type === "OUT" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><TrendingDown size={12} /> OUT</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-steel"><RotateCcw size={12} /> ADJ</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">{m.qty}</td>
                        <td className="px-4 py-2.5 text-xs text-steel">{m.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
