const STOCK_KEY = "jf_stock";
const MOVEMENTS_KEY = "jf_movements";
import { products } from "./products";
import { StockEntry, StockMovement, MovementType } from "./types";

function buildDefaults(): StockEntry[] {
  return products.map((p) => ({ productId: p.id, qty: 0, minQty: 2 }));
}

export function loadStock(): StockEntry[] {
  if (typeof window === "undefined") return buildDefaults();
  try {
    const raw = localStorage.getItem(STOCK_KEY);
    if (!raw) return buildDefaults();
    const stored: StockEntry[] = JSON.parse(raw);
    const storedIds = new Set(stored.map((e) => e.productId));
    const missing = products.filter((p) => !storedIds.has(p.id)).map((p) => ({ productId: p.id, qty: 0, minQty: 2 }));
    return [...stored, ...missing];
  } catch {
    return buildDefaults();
  }
}

export function saveStock(entries: StockEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STOCK_KEY, JSON.stringify(entries));
}

export function getStockEntry(entries: StockEntry[], productId: string): StockEntry {
  return (
    entries.find((e) => e.productId === productId) ?? { productId, qty: 0, minQty: 2, }
  );
}

export function updateEntry(entries: StockEntry[], updated: StockEntry): StockEntry[] {
  const exists = entries.some((e) => e.productId === updated.productId);
  if (exists) return entries.map((e) => e.productId === updated.productId ? updated : e);
  return [...entries, updated];
}

export function loadMovements(): StockMovement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMovements(movements: StockMovement[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements.slice(-200)));
}

export function recordMovement(
  movements: StockMovement[],
  productId: string,
  type: MovementType,
  qty: number,
  note: string
): StockMovement[] {
  const entry: StockMovement = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId,
    type,
    qty,
    note,
    date: new Date().toISOString(),
  };
  return [...movements, entry];
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(entry: StockEntry): StockStatus {
  if (entry.qty <= 0) return "out-of-stock";
  if (entry.qty <= entry.minQty) return "low-stock";
  return "in-stock";
}

export function totalStockUnits(entries: StockEntry[]): number {
  return entries.reduce((sum, e) => sum + e.qty, 0);
}
