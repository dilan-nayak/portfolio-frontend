
export function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
      />
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const colorValue = value.startsWith("#") ? value : "#000000";
  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 rounded border border-[var(--border-1)] bg-[var(--surface-2)] cursor-pointer"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
          placeholder="#A63A2D"
        />
      </div>
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <textarea
        ref={textareaRef}
        value={value}
        rows={rows}
        onChange={(e) => {
          onChange(e.target.value);
          e.currentTarget.style.height = "auto";
          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
        }}
        className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] resize-none overflow-hidden text-sm"
      />
    </div>
  );
}

export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
      />
    </div>
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ArrayEditor({
  label,
  items,
  onChange,
  placeholder,
  confirmAction,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  confirmAction?: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }) => Promise<boolean>;
}) {
  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex gap-1.5">
            <input
              value={item}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes(",")) {
                  const split = value
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter(Boolean);
                  const next = [...items];
                  next.splice(index, 1, ...split);
                  onChange(next);
                  return;
                }
                const next = [...items];
                next[index] = value;
                onChange(next);
              }}
              placeholder={placeholder}
              className="flex-1 rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
            />
            <button
              type="button"
              onClick={async () => {
                const shouldRemove = confirmAction
                  ? await confirmAction({
                      title: "Remove Item",
                      message: "Are you sure you want to remove this item?",
                      confirmText: "Remove",
                    })
                  : window.confirm("Are you sure you want to remove this item?");
                if (!shouldRemove) return;
                onChange(items.filter((_, i) => i !== index));
              }}
              className="rounded-lg px-2.5 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition text-xs font-medium"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white transition text-sm"
      >
        Add
      </button>
    </div>
  );
}

export function ImageUploadField({
  label,
  onFileSelected,
}: {
  label: string;
  onFileSelected: (file: File) => Promise<void>;
}) {
  return (
    <div>
      <label className="block text-xs theme-text-2 mb-1">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await onFileSelected(file);
        }}
        className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 text-sm"
      />
    </div>
  );
}
import { useLayoutEffect, useRef } from "react";
