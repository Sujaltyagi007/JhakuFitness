import { createPortal } from 'react-dom'
import { ChevronDown, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { COUNTRIES, type Country } from '@/lib/hooks/Countrielist';

type PickerProps = {
    value: Country;
    onChange: (country: Country) => void;
    autoDetected: boolean;
    onManualChange: () => void;
    className?: string;
}

const DROPDOWN_WIDTH = 288;

export const FlagImg = ({ code, className = "" }: { code: string; className?: string }) => (
    <img src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} alt={code} aria-hidden="true" className={`inline-block object-contain ${className}`} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
);

const CountrieCodeBtn = ({ value, onChange, autoDetected, onManualChange, className }: PickerProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const clickedInsideWrapper = wrapperRef.current?.contains(target);
            const clickedInsideDropdown = dropdownRef.current?.contains(target);
            if (!clickedInsideWrapper && !clickedInsideDropdown) { setOpen(false); }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener("mousedown", handler);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    useEffect(() => {
        const updatePosition = () => {
            if (open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const margin = 8;
                setDropdownPos({
                    top: rect.bottom + 6,
                    left: Math.max(margin, Math.min(rect.left, window.innerWidth - DROPDOWN_WIDTH - margin)),
                });
            }
        };

        if (open) {
            updatePosition();
            setTimeout(() => searchRef.current?.focus(), 50);
            window.addEventListener('scroll', updatePosition, true);
        } else {
            setDropdownPos(null);
            setQuery("");
            window.removeEventListener('scroll', updatePosition, true);
        }

        return () => window.removeEventListener('scroll', updatePosition, true);
    }, [open]);

    const filtered = React.useMemo(() => {
        if (!query.trim()) return COUNTRIES;
        const searchTerm = query.toLowerCase().trim();
        return COUNTRIES.filter((c) =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.dial.includes(searchTerm) ||
            c.code.toLowerCase().includes(searchTerm)
        );
    }, [query]);

    const handleCountrySelect = (country: Country) => {
        if (country.code !== value.code) {
            onChange(country);
            onManualChange();
        }
        setOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative shrink-0 h-full">
            <button ref={buttonRef} type="button" onClick={() => setOpen((o) => !o)} className={`${className} flex items-center gap-1.5 h-full px-2 py-1 bg-stone-100 rounded-lg border transition-all text-sm font-medium text-stone-800 whitespace-nowrap ${open ? "border-stone-400 ring-2 ring-stone-200" : "border-transparent hover:border-stone-300"}`} aria-haspopup="listbox" aria-expanded={open} aria-label={`Country code: ${value.name} ${value.dial}`}            >
                <FlagImg code={value.code} className="w-5 h-auto" />
                <span className="text-stone-700 text-[14px] ">{value.dial}</span>
                <ChevronDown size={13} className={`text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {open && dropdownPos && createPortal(
                <div ref={dropdownRef} style={{
                    position: 'fixed',
                    top: `${dropdownPos.top}px`,
                    left: `${dropdownPos.left}px`,
                    zIndex: 9999,
                    width: `${DROPDOWN_WIDTH}px`,
                    maxWidth: 'calc(100vw - 16px)'
                }} className="bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-100 bg-stone-50">
                        <Search size={14} className="text-stone-400 shrink-0" aria-hidden="true" />
                        <input ref={searchRef} type="text"
                            placeholder="Search country or dial code…"
                            value={query} onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm text-stone-800 placeholder:text-stone-400"
                            aria-label="Search countries"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery("")}
                                className="text-stone-400 hover:text-stone-600 text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-stone-200"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <ul className="max-h-56 overflow-y-auto divide-y divide-stone-50" role="listbox" aria-label="Select country code">
                        {filtered.length === 0 && (
                            <li className="px-4 py-8 text-sm text-stone-400 text-center" role="status">
                                No countries found for "{query}"
                            </li>
                        )}
                        {filtered.map((c) => (
                            <li key={c.code} role="none">
                                <button type="button" role="option" aria-selected={c.code === value.code} onClick={() => handleCountrySelect(c)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${c.code === value.code ? "bg-stone-100 font-semibold" : "hover:bg-stone-50"}`}
                                >
                                    <FlagImg code={c.code} className="w-6 h-auto" />
                                    <span className="flex-1 text-stone-800 truncate">{c.name}</span>
                                    <span className="text-stone-400 text-xs shrink-0 tabular-nums">{c.dial}</span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Show total countries count */}
                    {filtered.length > 0 && (
                        <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-100 text-[10px] text-stone-400 text-center">
                            {filtered.length} country{filtered.length !== 1 ? 's' : ''} found
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}

export default CountrieCodeBtn;