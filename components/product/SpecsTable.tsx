export default function SpecsTable({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs);
  return (
    <dl className="divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-white">
      {entries.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5">
          <dt className="text-sm text-steel">{label}</dt>
          <dd className="text-right text-sm font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
