export type CategoryId =
  | "treadmills"
  | "spin-bikes"
  | "cross-trainers"
  | "rowers"
  | "specialty";

export type ModelKind =
  | "treadmill"
  | "spin-bike"
  | "cross-trainer"
  | "rower"
  | "ski-machine"
  | "stair-master"
  | "air-bike";

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  modelKind: ModelKind;
  tagline: string;
  specialFeature: string;
  specs: Record<string, string>;
  featured?: boolean;
  featureBullets: string[];
  imageUrl?: string;
  videoUrl?: string;
  /** Ex-GST price in INR. Optional — used for inventory valuation. */
  price?: number;
  colorway: {
    body: string;
    accent: string;
  };
}

export interface StockEntry {
  productId: string;
  qty: number;
  /** Alert threshold — show "Low Stock" badge when qty <= minQty */
  minQty: number;
}

export type MovementType = "in" | "out" | "adjustment";

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  qty: number;
  note: string;
  date: string; // ISO string
}

