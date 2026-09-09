"use client";
import { getProducts } from "@/lib/api";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/components/admin/PreferencesProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import CountrieCodeBtn from "@/components/ui/CountrieCodeBtn";
import { COUNTRIES, type Country, formatPhone } from "@/lib/hooks/Countrielist";

const DEFAULT_COUNTRY: Country = COUNTRIES.find((c) => c.code === "IN") || COUNTRIES[0];

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

interface InvoiceTabProps { }

export default function InvoiceTab(_: InvoiceTabProps) {
  const { preferences } = usePreferences();
  const currency = (preferences.currency as "INR" | "USD") || "INR";
  const currencySymbol = currency === "USD" ? "$" : "₹";
  const [catalog, setCatalog] = useState<DbProduct[]>([]);
  useEffect(() => { getProducts().then((data) => setCatalog(data as DbProduct[])).catch(() => { }); }, []);
  const [invoiceNumber, setInvoiceNumber] = useState(`JF-${new Date().getFullYear()}-001`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [gymName, setGymName] = useState("");
  const [customerCountry, setCustomerCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [customerPhone, setCustomerPhone] = useState("");
  const customerPhoneFull = formatPhone(customerCountry, customerPhone);
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [taxRate, setTaxRate] = useState<number>(18);
  const [items, setItems] = useState<InvoiceItem[]>([{
    id: "1",
    name: "LP - BOLD 7000 (Commercial Treadmill)",
    category: "treadmills",
    quantity: 1,
    unitPrice: 165000,
    total: 165000,
  }]);

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
                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">Invoice Date</label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">GST Rate (%)</label>
                <Select value={String(taxRate)} onValueChange={(v) => setTaxRate(Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (Exempt)</SelectItem>
                    <SelectItem value="12">12% GST</SelectItem>
                    <SelectItem value="18">18% GST (Standard)</SelectItem>
                    <SelectItem value="28">28% GST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-steel">Gym / Facility Name</label>
                <Input placeholder="e.g. Iron Forge Gym" value={gymName} onChange={(e) => setGymName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">Contact Person</label>
                <Input placeholder="e.g. Ramesh Kumar" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">Phone / WhatsApp</label>
                <div className="mt-1 flex w-full items-stretch overflow-hidden rounded-xl border border-ink/15 bg-white focus-within:border-gold transition-colors">
                  <CountrieCodeBtn value={customerCountry} onChange={setCustomerCountry} autoDetected={false} onManualChange={() => { }} className="bg-transparent! border-0! rounded-none! px-2.5! py-2 hover:bg-stone-100!" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={customerCountry.len}
                    placeholder="98765 43210"
                    className="w-full min-w-0 bg-transparent px-2.5 py-2 text-sm text-ink outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-steel">GSTIN (Optional)</label>
                <Input placeholder="07AAAAA0000A1Z5" value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-steel">Delivery & Installation Address</label>
              <Input placeholder="e.g. Sector 14, Rohini, New Delhi 110085" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="mt-1" />
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-4">
              <span className="text-xs font-bold uppercase text-steel">
                Quick Add Equipment:
              </span>
              <Select value="" onValueChange={(v) => { if (v) handleAddItemFromCatalog(v); }} className="w-auto">
                <SelectTrigger className="h-8 w-64 gap-1.5 px-3 py-1.5 text-xs"><SelectValue placeholder="-- Select machine from catalog --" /></SelectTrigger>
                <SelectContent className="min-w-60">
                  {catalog.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p?.categoryId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable Invoice Sheet */}
      <div className="jf-print-surface rounded-2xl border border-ink/15 bg-white p-4 sm:p-8 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none">
        {/* Invoice Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-6">
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
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-steel">BILLED TO:</h4>
            <p className="mt-1 text-sm font-bold text-ink">{gymName || "Client Facility"}</p>
            <p className="text-steel">Attn: {customerName || "Purchasing Manager"}</p>
            <p className="text-steel">{customerAddress || "Address on File"}</p>
            <p className="text-steel">Phone: {customerPhoneFull || "N/A"}</p>
            {customerGstin && <p className="font-mono text-steel">GSTIN: {customerGstin}</p>}
          </div>
          <div className="text-left sm:text-right">
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
                <th className="py-2.5 px-3 text-right">Unit Rate ({currencySymbol})</th>
                <th className="py-2.5 px-3 text-right">Amount ({currencySymbol})</th>
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
                    {formatCurrency(item.total, currency)}
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
              <span className="font-semibold text-ink">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-steel">
              <span>GST ({taxRate}%):</span>
              <span className="font-semibold text-ink">{formatCurrency(gstAmount, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/20 pt-2 text-sm font-bold text-ink">
              <span>Grand Total:</span>
              <span className="text-gold-deep">{formatCurrency(grandTotal, currency)}</span>
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
