"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Printer, Plus, Trash2, FileSpreadsheet, ShieldCheck } from "lucide-react";

interface DbProduct {
  id: string;
  name: string;
  categoryId: string;
  price: number | null;
}

interface InvoiceItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceTabProps {}

export default function InvoiceTab(_: InvoiceTabProps) {
  const [catalog, setCatalog] = useState<DbProduct[]>([]);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data: DbProduct[]) => setCatalog(data))
      .catch(() => {});
  }, []);
  const [invoiceNumber, setInvoiceNumber] = useState(`JF-${new Date().getFullYear()}-001`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [gymName, setGymName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [taxRate, setTaxRate] = useState<number>(18); // Default 18% GST

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      name: "LP - BOLD 7000 (Commercial Treadmill)",
      category: "treadmills",
      quantity: 1,
      unitPrice: 165000,
      total: 165000,
    },
  ]);

  const handleAddItemFromCatalog = (productId: string) => {
    const product = catalog.find((p) => p.id === productId);
    if (!product) return;

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: `${product.name} (${product.categoryId})`,
      category: product.categoryId,
      quantity: 1,
      unitPrice: product.price ?? 120000,
      total: product.price ?? 120000,
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (
    index: number,
    field: "name" | "quantity" | "unitPrice",
    val: string | number
  ) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === "name") {
      item.name = String(val);
    } else if (field === "quantity") {
      item.quantity = Number(val) || 1;
      item.total = item.quantity * item.unitPrice;
    } else if (field === "unitPrice") {
      item.unitPrice = Number(val) || 0;
      item.total = item.quantity * item.unitPrice;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const gstAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + gstAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Editor Controls (hidden during print) */}
      <div className="print:hidden space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Invoice & Quotation Generator</CardTitle>
              <CardDescription>
                Create branded GST invoices and estimate slips for gym setup clients.
              </CardDescription>
            </div>
            <Button variant="gold" onClick={handlePrint} className="gap-2">
              <Printer size={16} /> Print / Save PDF
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-steel">Invoice / Quote #</label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">Invoice Date</label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">GST Rate (%)</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST (Standard)</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-steel">Gym / Facility Name</label>
                <Input
                  placeholder="e.g. Iron Forge Gym"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">Contact Person</label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">Phone / WhatsApp</label>
                <Input
                  placeholder="e.g. +91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">GSTIN (Optional)</label>
                <Input
                  placeholder="07AAAAA0000A1Z5"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-steel">Delivery & Installation Address</label>
              <Input
                placeholder="e.g. Sector 14, Rohini, New Delhi 110085"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Quick Catalog Adder */}
            <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-4">
              <span className="text-xs font-bold uppercase text-steel">
                Quick Add Equipment:
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddItemFromCatalog(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  -- Select machine from catalog --
                </option>
                {catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p?.categoryId})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable Invoice Sheet */}
      <div className="rounded-2xl border border-ink/15 bg-white p-8 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none">
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b-2 border-ink pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-ink font-black">
                JF
              </div>
              <span className="font-display text-2xl font-black tracking-tight text-ink">
                JAKHU FITNESS
              </span>
            </div>
            <p className="mt-1 text-xs text-steel">
              Premium Commercial & Studio Fitness Equipment Dealership
            </p>
            <p className="text-xs text-steel">
              GT Karnal Road, Alipur, North Delhi, Delhi 110036
            </p>
            <p className="text-xs text-steel">
              Hotline: +91 93110 37556 | info@jhakufitness.com
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-md bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              TAX INVOICE / ESTIMATE
            </span>
            <p className="mt-2 text-xs font-mono font-bold text-ink">
              INV: {invoiceNumber}
            </p>
            <p className="text-xs text-steel">Date: {invoiceDate}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="my-6 grid grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-steel">BILLED TO:</h4>
            <p className="mt-1 text-sm font-bold text-ink">{gymName || "Client Facility"}</p>
            <p className="text-steel">Attn: {customerName || "Purchasing Manager"}</p>
            <p className="text-steel">{customerAddress || "Address on File"}</p>
            <p className="text-steel">Phone: {customerPhone || "N/A"}</p>
            {customerGstin && <p className="font-mono text-steel">GSTIN: {customerGstin}</p>}
          </div>
          <div className="text-right">
            <h4 className="font-bold uppercase tracking-wider text-steel">SUPPLIER INFO:</h4>
            <p className="mt-1 font-bold text-ink">Jakhu Fitness Equipment Co.</p>
            <p className="text-steel">GSTIN: 07ABCDE1234F1Z5</p>
            <p className="text-steel">State Code: 07 (Delhi)</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-ink/20 bg-paper py-2 uppercase tracking-wider text-steel">
              <tr>
                <th className="py-2.5 px-3">Item / Equipment Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 text-right print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {items.map((item, idx) => (
                <tr key={item.id} className="align-top">
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                      className="w-full bg-transparent font-medium text-ink focus:outline-none focus:ring-1 focus:ring-gold rounded px-1"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      className="w-16 bg-transparent text-center font-medium text-ink focus:outline-none focus:ring-1 focus:ring-gold rounded"
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                      className="w-24 bg-transparent text-right font-medium text-ink focus:outline-none focus:ring-1 focus:ring-gold rounded"
                    />
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-ink">
                    ₹{item.total.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-3 text-right print:hidden">
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="mt-6 flex flex-col items-end border-t border-ink/10 pt-4 text-xs">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-steel">
              <span>Subtotal:</span>
              <span className="font-semibold text-ink">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-steel">
              <span>GST ({taxRate}%):</span>
              <span className="font-semibold text-ink">₹{gstAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t border-ink/20 pt-2 text-sm font-bold text-ink">
              <span>Grand Total:</span>
              <span className="text-gold-deep">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Terms & Footer */}
        <div className="mt-8 border-t border-ink/10 pt-4 text-[11px] text-steel">
          <p className="font-bold text-ink">Terms & Conditions:</p>
          <ul className="list-disc pl-4 mt-1 space-y-0.5">
            <li>100% genuine factory warranty with on-site commercial technician support in Delhi NCR.</li>
            <li>50% advance along with confirmed purchase order; balance before dispatch.</li>
            <li>Delivery and assembly arranged directly by certified Jakhu Fitness engineers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
