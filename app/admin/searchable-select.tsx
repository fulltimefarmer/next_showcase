"use client";

import { useState } from "react";

export type SearchableOption = { value: string; label: string };

export function SearchableSelect({
  name,
  options,
  placeholder = "Search...",
  value,
  disabled,
  onChange,
}: {
  name: string;
  options: SearchableOption[];
  placeholder?: string;
  value?: string | number | null;
  disabled?: boolean;
  onChange?: (option: SearchableOption | null) => void;
}) {
  const initial =
    options.find((o) => String(o.value) === String(value ?? "")) ?? null;
  const [selected, setSelected] = useState<SearchableOption | null>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  if (disabled) {
    return (
      <div>
        <input type="hidden" name={name} value={selected?.value ?? ""} />
        <input
          disabled
          value={selected?.label ?? ""}
          className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected?.value ?? ""} />
      <input
        value={selected ? selected.label : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
          setOpen(true);
          onChange?.(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">No results</li>
          ) : (
            filtered.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelected(option);
                    setQuery("");
                    setOpen(false);
                    onChange?.(option);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
