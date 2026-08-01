import * as React from "react";
import { type ServiceKey, getServiceLabel } from "../features/checkins/constants";
import { ChevronDown } from "lucide-react";

type Counts = Partial<Record<ServiceKey, number>>;

export function ServicePicker({
  value,
  onChange,
  counts,
  className = "",
  showCounts = true,
}: {
  value: ServiceKey;
  onChange: (next: ServiceKey) => void;
  counts?: Counts;
  className?: string;
  showCounts?: boolean;
}) {
  const options: { key: ServiceKey; short: string }[] = [
    { key: "SUN_8A", short: "1er Servicio" },
    { key: "SUN_10A", short: "2do Servicio" },
    { key: "SUN_12P", short: "3er Servicio" },
    { key: "SUN_5P", short: "Noche CDV" },
  ];

  const getDisabled = (k: ServiceKey) =>
    typeof counts?.[k] === "number" && (counts?.[k] ?? 0) <= 0;

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = options.findIndex((o) => o.key === value);
    const nextIdx =
      e.key === "ArrowRight"
        ? (idx + 1) % options.length
        : (idx - 1 + options.length) % options.length;
    let tries = 0;
    let chosen = nextIdx;
    while (tries < options.length && getDisabled(options[chosen].key)) {
      chosen = (chosen + (e.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
      tries++;
    }
    if (!getDisabled(options[chosen].key)) onChange(options[chosen].key);
  };

  return (
    <div className={className}>
      <div className="sm:hidden">
        <label className="block text-label-caps text-on-surface-variant mb-2 uppercase tracking-wider">
          Servicio
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as ServiceKey)}
            className="w-full appearance-none bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 pl-4 pr-10 text-body-md focus:ring-primary focus:border-primary"
          >
            {options.map(({ key, short }) => (
              <option key={key} value={key} disabled={getDisabled(key)}>
                {short} — {getServiceLabel(key)}
                {showCounts && typeof counts?.[key] === "number" ? ` (${counts?.[key]})` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
        </div>
      </div>

      <div
        className="hidden sm:flex items-center justify-start"
        role="radiogroup"
        aria-label="Elegir servicio"
        onKeyDown={handleKeyDown}
      >
        <div className="inline-flex rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm overflow-hidden">
          {options.map(({ key, short }, i) => {
            const selected = value === key;
            const disabled = getDisabled(key);
            return (
              <label
                key={key}
                className={[
                  "relative cursor-pointer select-none px-4 py-2.5 text-body-md flex items-center gap-2 transition-all",
                  i > 0 ? "border-l border-outline-variant/30" : "",
                  disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-surface-container-high/50",
                  selected ? "bg-primary text-on-primary font-semibold" : "bg-surface-container-lowest text-on-surface",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="service"
                  value={key}
                  className="sr-only"
                  disabled={disabled}
                  checked={selected}
                  onChange={() => onChange(key)}
                />
                <span>{short}</span>
                {showCounts && typeof counts?.[key] === "number" && (
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      selected ? "bg-on-primary/20" : "bg-primary-fixed/20 text-primary",
                    ].join(" ")}
                    title={getServiceLabel(key)}
                  >
                    {counts?.[key]}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
