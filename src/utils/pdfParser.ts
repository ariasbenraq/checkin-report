// src/utils/pdfParser.ts
import type { AreaResumen } from "../features/checkins/types/resumen";
import type { ServiceKey } from "../features/checkins/constants";

// ---------- helpers ----------
function clean(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .trim();
}

const AREA_PATTERNS: Record<string, string> = {
    "Voluntarios CDV > Alabanzas >": "Alabanza",
    "Voluntarios CDV > Alabanzas > Asistente de equipo": "Asistente de equipo",
    "Voluntarios CDV > Producción Lince > Atmósfera": "Atmósfera",
    "Voluntarios CDV > CDV LINCE > Velover": "Velover",
    "Voluntarios CDV > CDV LINCE > Equipo Bienvenida": "Bienvenida",
    "Voluntarios CDV > Producción Lince > Cámaras": "Cámaras",
    "Voluntarios CDV > Contabilidad": "Contabilidad",
    "Voluntarios CDV > CDV LINCE > Crecer": "Crecer",
    "Voluntarios CDV > CDV LINCE > Dedicaciones": "Dedicaciones",
    "Voluntarios CDV > Eventos > Registro": "Registro",
    "Voluntarios CDV > Voluntario ED": "ED",
    "Voluntarios CDV > CDV LINCE > Equipo Médico": "Equipo Médico",
    "Voluntarios CDV > CDV LINCE > Fin de semana inolvidable": "Fin de semana Inolvidable",
    "Voluntarios CDV > CDV LINCE > Hombres CDV": "Hombres CDV",
    "Voluntarios CDV > CDV LINCE > Informes": "Informes",
    // "Kids > Bebes - Lince": "Kids",
    "Voluntarios CDV > Kids Voluntarios": "Kids",
    "Voluntarios CDV > Eventos > Logística": "Logística",
    "Voluntarios CDV > Producción Lince > Luces": "Luces",
    "Voluntarios CDV > CDV LINCE > Mantenimiento": "Mantenimiento",
    "Voluntarios CDV > CDV LINCE > Matrimonios": "Matrimonios",
    "Voluntarios CDV > Producción Lince > Producción": "Producción",
    "Voluntarios CDV > CDV LINCE > Recursos": "Recursos",
    "Voluntarios CDV > CDV LINCE > Reps": "Reps",
    "Voluntarios CDV > Eventos > Sala Verde": "Sala Verde",
    "Voluntarios CDV > CDV LINCE > Seguridad": "Seguridad",
    "Voluntarios CDV > CDV LINCE > Servolución": "Servolución",
    "Voluntarios CDV > Producción Lince > Sonido": "Sonido",
    "Voluntarios CDV > Producción Lince > Voluntario": "Voluntario",
    "Voluntarios CDV > Equipo ministerial > Líder de Servicio": "Líder de Servicio",
    "Voluntarios CDV > Equipo ministerial > IDL": "IDL",
    "Voluntarios CDV > Producción Lince > Visuales": "Visuales",
    "Voluntarios CDV > CDV LINCE > Grupos pequeños": "Grupos pequeños",
    "Voluntarios CDV > Comunicaciones > Comms": "Comms",
};

// ---------- servicios y ventanas ----------
interface ServiceTimeConfig {
    key: ServiceKey;
    heading: string; // después de "Grouped by Time: "
    total: { fromMinutes: number | null; toMinutes: number };
    afterViosMinutes: number;
}
const t = (h: number, m: number, ap: 'a' | 'p') => ((h % 12) + (ap === 'p' ? 12 : 0)) * 60 + m;

const SERVICE_TIMES: ServiceTimeConfig[] = [
    {
        key: 'SUN_8A',
        heading: 'Sunday 8:00a',
        total: { fromMinutes: null, toMinutes: t(8, 0, 'a') }, // <= 8:00a
        afterViosMinutes: t(7, 0, 'a'), // > 7:30a
    },
    {
        key: 'SUN_10A',
        heading: 'Sunday 10:00a',
        total: { fromMinutes: t(9, 0, 'a'), toMinutes: t(10, 0, 'a') }, // 9:00a–10:00a
        afterViosMinutes: t(9, 30, 'a'), // > 9:30a
    },
    {
        key: 'SUN_12P',
        heading: 'Sunday 12:00p',
        total: { fromMinutes: t(11, 0, 'a'), toMinutes: t(12, 0, 'p') }, // 11:00a–12:00p
        afterViosMinutes: t(11, 30, 'a'), // > 11:30a
    },
];

const isInTotal = (min: number, cfg: ServiceTimeConfig) =>
    cfg.total.fromMinutes === null ? min <= cfg.total.toMinutes
        : min >= cfg.total.fromMinutes && min <= cfg.total.toMinutes;
const isAfterVios = (min: number, cfg: ServiceTimeConfig) => min > cfg.afterViosMinutes;

// --------- cortar el PDF en secciones por encabezado ---------
// Robusto aunque no haya saltos de línea; usa índices del regex global.
function splitByServiceSections(text: string): { heading: string; body: string }[] {
    const rx = /Grouped by Time:\s*(Sunday\s+\d{1,2}:\d{2}[ap])/gi;
    const out: { heading: string; body: string }[] = [];
    const matches: Array<{ index: number; heading: string }> = [];

    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) {
        matches.push({ index: m.index, heading: `Grouped by Time: ${m[1]}` });
    }
    if (!matches.length) return [];

    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const slice = text.slice(start, end);
        out.push({ heading: matches[i].heading, body: slice.replace(matches[i].heading, '').trim() });
    }
    return out;
}

function resolveServiceByHeading(fullHeadingLine: string): ServiceTimeConfig | null {
    const m = /Grouped by Time:\s*(.+)$/i.exec(fullHeadingLine.trim());
    if (!m) return null;
    const head = m[1].trim().toLowerCase();
    return SERVICE_TIMES.find(s => s.heading.toLowerCase() === head) ?? null;
}

// ---------- API principal: devuelve 3 arreglos ----------
export function parsePdfTextAllServices(text: string): Record<ServiceKey, AreaResumen[]> {
    const sections = splitByServiceSections(text);

    // acumulador por servicio y por área
    const acc: Record<ServiceKey, Record<string, { total: number; lateCount: number }>> = {
        SUN_8A: {}, SUN_10A: {}, SUN_12P: {}
    };

    // Acepta 7a / 7am / 7:05a / 7:05am / 12p / 12:00p
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(a|am|p|pm)\b/gi;

    for (const sec of sections) {
        const cfg = resolveServiceByHeading(sec.heading);
        if (!cfg) continue; // sección no configurada -> se ignora

        // Divide el cuerpo por bloques de área (tu lógica)
        const areaBlocks = sec.body.split(/(?=(Voluntarios CDV > |Kids > ))/g);

        for (const block of areaBlocks) {
            // 1) ¿qué área es este bloque?
            const matchKey = Object.keys(AREA_PATTERNS)
                .sort((a, b) => b.length - a.length)
                .find((pattern) => clean(block).includes(clean(pattern)));
            if (!matchKey) continue;

            const areaName: string = AREA_PATTERNS[matchKey];
            if (!(areaName in acc[cfg.key])) {
                acc[cfg.key][areaName] = { total: 0, lateCount: 0 };
            }

            // 2) Extraer SOLO horas de llegada (NO las horas que van precedidas de "Sunday ")
            for (const tm of block.matchAll(timeRegex) as IterableIterator<RegExpMatchArray>) {
                // Si justo antes del match aparece "Sunday " => es horario de servicio, se ignora
                const idx = tm.index ?? 0; // tm.index es opcional, por eso el ??
                const before = block.slice(Math.max(0, idx - 8), idx).toLowerCase(); // 8 chars previos
                const isServiceTag = /\bsunday\s$/.test(before);
                if (isServiceTag) continue;

                // Este sí es la hora de llegada -> convertir a minutos
                const hh = Number(tm[1]);
                const mm = tm[2] ? Number(tm[2]) : 0;
                const apRaw = tm[3].toLowerCase();
                const isPm = apRaw.startsWith('p');
                const minutes = ((hh % 12) + (isPm ? 12 : 0)) * 60 + mm;

                // 3) Aplicar reglas del servicio actual (ventana Total & After Vios)
                // 3) Conteo INDEPENDIENTE del horario (la sección define el servicio)
                acc[cfg.key][areaName].total += 1;
                // After Vios por servicio: estrictamente después del umbral de la sección
                if (minutes > cfg.afterViosMinutes) {
                    acc[cfg.key][areaName].lateCount += 1;
                }
            }
        }
    }

    // 4) Pasar a AreaResumen[]
    const toResumen = (m: Record<string, { total: number; lateCount: number }>): AreaResumen[] =>
        Object.entries(m).map(([area, v]) => ({ area, total: v.total, lateCount: v.lateCount }));

    return {
        SUN_8A: toResumen(acc.SUN_8A),
        SUN_10A: toResumen(acc.SUN_10A),
        SUN_12P: toResumen(acc.SUN_12P),
    };
}

