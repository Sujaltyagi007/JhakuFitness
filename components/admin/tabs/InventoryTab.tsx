"use client";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { formatCurrency, formatTime } from "@/lib/utils";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { usePreferences } from "@/components/admin/PreferencesProvider";
import { getInventory, getMovements, updateInventory, recordMovement } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton, ContentHeaderSkeleton, TableRowSkeleton } from "@/components/ui/Skeletons";
import { Package, TrendingUp, TrendingDown, RotateCcw, ChevronDown, ChevronUp, AlertTriangle, IndianRupee, RefreshCw, Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

function getStatus(row: StockRow): StockStatus {
  if (row.qty === 0) return "out-of-stock";
  if (row.qty <= row.minQty) return "low-stock";
  return "in-stock";
}

function fmt(n: number) { return new Intl.NumberFormat("en-IN").format(n); }

function StatusBadge({ status }: { status: StockStatus }) {
  if (status === "in-stock") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">In Stock</span>;
  if (status === "low-stock") return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"><AlertTriangle size={10} /> Low</span>;
  return <span className="inline-flex items-center gap-1 rounded-full text-nowrap bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 border border-red-200">Out of Stock</span>;
}

export default function InventoryTab() {
  const { preferences } = usePreferences();
  const currency = (preferences.currency as "INR" | "USD") || "INR";
  const timeFormat = (preferences.timeFormat as "12h" | "24h") || "12h";
  const fmtCurrency = (n: number) => formatCurrency(n, currency);
  const fmtDate = (iso: string) => formatTime(iso, timeFormat);
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
  const [pendingRows, setPendingRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
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
      const [sData, mData] = await Promise.all([getInventory(), getMovements()]);
      setStock(sData as StockRow[]);
      setMovements(mData as Movement[]);
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
      const saved = await recordMovement({ productId, type, qty: Math.abs(qty), note }) as Movement;
      setMovements((prev) => [{ ...saved, product: { name: productName } }, ...prev]);
      toast.success(`Stock updated: ${productName} (${type === "IN" ? "+" : type === "OUT" ? "-" : ""}${Math.abs(qty)})`);
    } catch (err) {
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
      await updateInventory({ productId, minQty });
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
      await updateInventory({ productId, price: parsed });
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <Card>
          <CardHeader>
            <ContentHeaderSkeleton />
          </CardHeader>
          <CardContent className="space-y-4">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </CardContent>
        </Card>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Units" value={fmt(totalUnits)} sub="Across all SKUs" icon={Package}
          className="hover:border-gold/30 hover:shadow-md" />
        <StatCard label="Stock Value" value={fmtCurrency(totalValue)} sub="Ex-GST valuation" icon={IndianRupee}
          className="hover:border-gold/30 hover:shadow-md" />
        <StatCard label="Low Stock" value={lowCount} sub="Below threshold" icon={AlertTriangle}
          iconClassName="text-amber-500" valueClassName="text-amber-600"
          className="hover:border-amber-500/30 hover:shadow-md" />
        <StatCard label="Out of Stock" value={outCount} sub="Zero units on hand" icon={Package}
          iconClassName="text-red-400" valueClassName="text-red-600"
          className="hover:border-red-400/30 hover:shadow-md" />
      </div>

      <Card>
        <CardHeader className="py-4! px-6! " >
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>
            Live inventory from the database. Negative custom qty = stock out.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0! ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/8 bg-ink/5 text-xs uppercase text-steel">
                <tr>
                  <th className="px-4 py-4 font-semibold tracking-wider">Product</th>
                  <th className="px-4 py-4 text-center font-semibold tracking-wider">Status</th>
                  <th className="px-4 py-4 font-semibold tracking-wider text-center">Qty</th>
                  <th className="px-4 py-4 font-semibold tracking-wider text-center">Min</th>
                  <th className="px-4 py-4 text-center font-semibold tracking-wider">Price (₹)</th>
                  <th className="px-4 py-4 font-semibold tracking-wider">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {stock.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((s) => {
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
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-lg bg-ink/5 p-0.5 border border-ink/5 shadow-sm">
                            <button onClick={() => applyMovement(s.productId, "OUT", 1, "Quick -1")} disabled={isPending || s.qty === 0} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white text-steel hover:text-red-600 disabled:opacity-50 transition-colors font-medium">
                              -1
                            </button>
                            <div className="w-px h-4 bg-ink/10 mx-0.5" />
                            <button onClick={() => applyMovement(s.productId, "IN", 1, "Quick +1")} disabled={isPending} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white text-steel hover:text-emerald-600 disabled:opacity-50 transition-colors font-medium">
                              +1
                            </button>
                            <button onClick={() => applyMovement(s.productId, "IN", 5, "Quick +5")} disabled={isPending} className="flex h-7 w-8 items-center justify-center rounded-md hover:bg-white text-steel hover:text-emerald-600 font-medium text-[10px] disabled:opacity-50 transition-colors">
                              +5
                            </button>
                          </div>

                          <div className="flex items-center h-8 rounded-lg border border-ink/10 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gold/30 transition-shadow shadow-sm">
                            <input
                              type="number"
                              value={qtyInputs[s.productId] ?? ""}
                              onChange={(e) => setQtyInputs((prev) => ({ ...prev, [s.productId]: e.target.value }))}
                              placeholder="± Qty"
                              className="w-16 h-full text-xs text-center border-none focus:outline-none bg-transparent"
                            />
                            <div className="w-px h-full bg-ink/10" />
                            <input
                              type="text"
                              value={noteInputs[s.productId] ?? ""}
                              onChange={(e) => setNoteInputs((prev) => ({ ...prev, [s.productId]: e.target.value }))}
                              placeholder="Note..."
                              className="w-24 h-full text-xs px-2 border-none focus:outline-none bg-transparent hidden lg:block"
                            />
                            <button
                              onClick={() => applyCustomQty(s.productId)}
                              disabled={isPending || !qtyInputs[s.productId]}
                              className="h-full px-3 text-xs font-medium bg-ink/5 hover:bg-ink/10 text-ink disabled:opacity-50 transition-colors flex items-center justify-center min-w-12"
                            >
                              {isPending ? <Loader2 size={12} className="animate-spin" /> : "Set"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {stock.length > 0 && (
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 border-t border-ink/8 px-4 py-3">
              <div className="text-sm text-steel">
                Showing <span className="font-medium text-ink">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-medium text-ink">
                  {Math.min(page * ITEMS_PER_PAGE, stock.length)}
                </span>{" "}
                of <span className="font-medium text-ink">{stock.length}</span> items (Total Pages: {Math.ceil(stock.length / ITEMS_PER_PAGE)})
              </div>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>

                  {Array.from({ length: Math.ceil(stock.length / ITEMS_PER_PAGE) }).map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === Math.ceil(stock.length / ITEMS_PER_PAGE) || Math.abs(p - page) <= 1) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (Math.abs(p - page) === 2) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(Math.ceil(stock.length / ITEMS_PER_PAGE), p + 1))}
                      className={page === Math.ceil(stock.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
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
                        <td className="px-4 py-2.5"> {m.type === "IN" ? (<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><TrendingUp size={12} /> IN</span>) : m.type === "OUT" ? (<span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><TrendingDown size={12} /> OUT</span>) : (<span className="inline-flex items-center gap-1 text-xs font-semibold text-steel"><RotateCcw size={12} /> ADJ</span>)}
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
