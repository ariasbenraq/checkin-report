// src/components/ServicePicker.tsx
import * as React from "react";
import type { ServiceKey } from "../features/checkins/constants";
import { SERVICE_LABEL } from "../features/checkins/constants";

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
	counts?: Counts;          // ej: { SUN_8A: 12, SUN_10A: 9, SUN_12P: 0 }
	className?: string;
	showCounts?: boolean;
}) {
	const options: { key: ServiceKey; short: string }[] = [
		{ key: "SUN_8A", short: "1er Servicio" },
		{ key: "SUN_10A", short: "2do Servicio" },
		{ key: "SUN_12P", short: "3er Servicio" },
	];

	const getDisabled = (k: ServiceKey) =>
		typeof counts?.[k] === "number" && (counts?.[k] ?? 0) <= 0;

	// Accesibilidad con flechas ← → dentro del radiogrupo
	const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
		e.preventDefault();
		const idx = options.findIndex(o => o.key === value);
		const nextIdx =
			e.key === "ArrowRight"
				? (idx + 1) % options.length
				: (idx - 1 + options.length) % options.length;
		// si el siguiente está disabled, busca el siguiente habilitado
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
			{/* Compacto en móvil: SELECT nativo */}
			<div className="sm:hidden">
				<label className="block text-sm font-medium mb-1">Servicio</label>
				<select
					value={value}
					onChange={(e) => onChange(e.target.value as ServiceKey)}
					className="w-full rounded-md border px-3 py-2"
				>
					{options.map(({ key, short }) => (
						<option key={key} value={key} disabled={getDisabled(key)}>
							{short} — {SERVICE_LABEL[key]}
							{showCounts && typeof counts?.[key] === "number" ? ` (${counts?.[key]})` : ""}
						</option>
					))}
				</select>
			</div>

			{/* Segmented control en ≥sm */}
			<div
				className="hidden sm:flex items-center justify-start"
				role="radiogroup"
				aria-label="Elegir servicio"
				onKeyDown={handleKeyDown}
			>
				<div className="inline-flex rounded-lg border bg-white shadow-sm overflow-hidden">
					{options.map(({ key, short }, i) => {
						const selected = value === key;
						const disabled = getDisabled(key);
						return (
							<label
								key={key}
								className={[
									"relative cursor-pointer select-none px-3 py-2 text-sm flex items-center gap-2",
									i > 0 ? "border-l" : "",
									disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50",
									selected ? "bg-indigo-600 text-white hover:bg-indigo-600" : "bg-white text-gray-800",
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
								<span className="font-medium">{short}</span>
								{/* badge horario corto */}
								<span
									className={[
										"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border",
										selected ? "border-white/50" : "border-gray-300 text-gray-600",
									].join(" ")}
									title={SERVICE_LABEL[key]}
								>
									{SERVICE_LABEL[key].replace(/^Domingo\s/, "")}
								</span>
								{/* contador */}
								{/* {showCounts && typeof counts?.[key] === "number" && (
									<span
										className={[
											"ml-1 inline-flex items-center justify-center rounded-full min-w-5 h-5 text-[11px] px-1 border",
											selected ? "bg-white text-indigo-700 border-white" : "bg-gray-100 text-gray-700 border-gray-300",
										].join(" ")}
										aria-label={`Total registros ${counts?.[key]}`}
										title={`Total: ${counts?.[key]}`}
									>
										{counts?.[key]}
									</span>
								)} */}
							</label>
						);
					})}
				</div>
			</div>
		</div>
	);
}
