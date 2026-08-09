// src/utils/pdfParser.ts
import { ALL_AREAS, PUNTO_AREAS } from '../domain/areas';
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
    "Voluntarios CDV > Producción Lince > Alabanza": "Alabanza",
    // "Voluntarios CDV > Alabanzas > Asistente de equipo": "Asistente de equipo",
    "Voluntarios CDV > Producción Lince > Atmósfera": "Atmósfera",
    "Voluntarios CDV > CDV > Velover": "Velover (Cafeteria)",
    "Voluntarios CDV > CDV > Equipo Bienvenida": "Bienvenida",
    "Voluntarios CDV > CDV > Bautizos": "Bautismo",
    "Voluntarios CDV > Producción Lince > Cámaras": "Cámaras & Video",
    "Voluntarios CDV > Contabilidad": "Contabilidad (Modulo dar)",
    "Voluntarios CDV > CDV > Crecer": "Crecer",
    "Voluntarios CDV > CDV > Dedicaciones": "Dedicaciones",
    "Voluntarios CDV > Eventos > Registro": "Registro",
    "Voluntarios CDV > Eventos > Desayuno": "Desayuno",
    "Voluntarios CDV > Voluntario ED": "ED",
    "Voluntarios CDV > CDV > Equipo Médico": "Equipo Médico",
    "Voluntarios CDV > CDV > Fin de semana inolvidable": "Fin de semana Inolvidable",
    "Voluntarios CDV > CDV > Hombres CDV": "Hombres CDV",
    "Voluntarios CDV > CDV > Informes": "Informes",
    // "Kids > Bebes - Lince": "Kids",
    "Voluntarios CDV > Kids Voluntarios": "Kids",
    "Voluntarios CDV > Eventos > Logística": "Logística",
    "Voluntarios CDV > Producción Lince > Luces": "Luces",
    "Voluntarios CDV > CDV > Mantenimiento": "Mantenimiento",
    "Voluntarios CDV > CDV > Matrimonios": "Matrimonios",
    "Voluntarios CDV > Producción Lince > Producción": "Producción",
    "Voluntarios CDV > CDV > Recursos": "Recursos",
    "Voluntarios CDV > CDV > Reps": "Reps",
    "Voluntarios CDV > Eventos > Sala Verde": "Sala Verde",
    "Voluntarios CDV > CDV > Seguridad": "Seguridad",
    "Voluntarios CDV > CDV > Servolución": "Servolución",
    "Voluntarios CDV > Producción Lince > Sonido": "Sonido",
    "Voluntarios CDV > Producción Lince > Voluntario": "Staff Pastoral (Voluntario)",
    "Voluntarios CDV > Equipo ministerial > Líder de Servicio": "Líder de Servicio",
    "Voluntarios CDV > Equipo ministerial > IDL": "IDL",
    "Voluntarios CDV > Producción Lince > Visuales": "Visuales",
    "Voluntarios CDV > CDV > Grupos pequeños": "Grupos pequeños",
    "Voluntarios CDV > Comunicaciones > Comms": "Comms",
};

// Áreas del servicio Punto (solo se aplican a secciones "Sunday 8:00p")
const PUNTO_AREA_PATTERNS: Record<string, string> = {
    "Equipo discapacidad > Punto ED": "Punto ED",
    "Voluntarios CDV > Alabanzas": "Alabanzas",
    "Voluntarios CDV > Punto CDV > Comms Punto": "Comms Punto",
    "Voluntarios CDV > Punto CDV > Experiencia Patio": "Experiencia Patio",
    "Voluntarios CDV > Punto CDV > Atmósfera": "Atmósfera",
    "Voluntarios CDV > Punto CDV > Alabanza": "Alabanza",
    "Voluntarios CDV > Punto CDV > Flow Punto": "Flow Punto",
    "Voluntarios CDV > Punto CDV > Líder de servicio": "Líder de servicio",
    "Voluntarios CDV > Punto CDV > Loom": "Loom",
    "Voluntarios CDV > Punto CDV > Cámaras Punto": "Cámaras Punto",
    "Voluntarios CDV > Punto CDV > Crecer Punto": "Crecer Punto",
    "Voluntarios CDV > Punto CDV > Grupos Pequeños": "Grupos Pequeños",
    "Voluntarios CDV > Punto CDV > Logística": "Logística",
    "Voluntarios CDV > Punto CDV > Luces": "Luces",
    "Voluntarios CDV > Punto CDV > Mantenimiento Punto": "Mantenimiento Punto",
    "Voluntarios CDV > Punto CDV > Producción": "Producción",
    "Voluntarios CDV > Punto CDV > Registro Punto": "Registro Punto",
    "Voluntarios CDV > Punto CDV > Reps": "Reps",
    "Voluntarios CDV > Punto CDV > Seguridad": "Seguridad",
    "Voluntarios CDV > Punto CDV > Sonido": "Sonido",
    "Voluntarios CDV > Punto CDV > Visuales": "Visuales",
    "Voluntarios CDV > Punto CDV > Voluntarios": "Voluntarios",
};

// ---------- servicios y ventanas ----------
interface ServiceTimeConfig {
    key: ServiceKey;
    heading: string; // después de "Grouped by Time: "
    total: { fromMinutes: number | null; toMinutes: number };
    afterViosMinutes: number;
}
const t = (h: number, m: number, ap: 'a' | 'p') => ((h % 12) + (ap === 'p' ? 12 : 0)) * 60 + m;

function getServiceTimes(): ServiceTimeConfig[] {
    return [
        {
            key: 'SUN_8A',
            heading: 'Sunday 8:00a',
            total: { fromMinutes: t(7, 0, 'a'), toMinutes: t(8, 0, 'a') },
            afterViosMinutes: t(7, 0, 'a'),
        },
        {
            key: 'SUN_10A',
            heading: 'Sunday 10:00a',
            total: { fromMinutes: t(9, 30, 'a'), toMinutes: t(10, 0, 'a') },
            afterViosMinutes: t(9, 30, 'a'),
        },
        {
            key: 'SUN_12P',
            heading: 'Sunday 12:00p',
            total: { fromMinutes: t(11, 30, 'a'), toMinutes: t(12, 0, 'p') },
            afterViosMinutes: t(11, 30, 'a'),
        },
        {
            key: 'SUN_5P',
            heading: 'Sunday 5:00p',
            total: { fromMinutes: t(4, 0, 'p'), toMinutes: t(5, 0, 'p') },
            afterViosMinutes: t(4, 0, 'p'),
        },
        {
            key: 'SUN_8P',
            heading: 'Sunday 8:00p',
            total: { fromMinutes: t(7, 15, 'p'), toMinutes: t(8, 0, 'p') },
            afterViosMinutes: t(7, 15, 'p'),
        },
        {
            key: 'SUN_8P',
            heading: 'Sunday 7:00p',
            total: { fromMinutes: t(6, 15, 'p'), toMinutes: t(7, 0, 'p') },
            afterViosMinutes: t(6, 15, 'p'),
        },
    ];
}

// Lista canónica de áreas por servicio (SUN_8P usa sus propias áreas)
const AREAS_BY_SERVICE: Record<ServiceKey, readonly string[]> = {
    SUN_8A: ALL_AREAS,
    SUN_10A: ALL_AREAS,
    SUN_12P: ALL_AREAS,
    SUN_5P: ALL_AREAS,
    SUN_8P: PUNTO_AREAS,
};

// const isInTotal = (min: number, cfg: ServiceTimeConfig) =>
//     cfg.total.fromMinutes === null ? min <= cfg.total.toMinutes
//         : min >= cfg.total.fromMinutes && min <= cfg.total.toMinutes;
// const isAfterVios = (min: number, cfg: ServiceTimeConfig) => min > cfg.afterViosMinutes;

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
    return getServiceTimes().find(s => s.heading.toLowerCase() === head) ?? null;
}

export interface DetectedService {
    key: ServiceKey;
    heading: string; // encabezado canónico, ej: "Sunday 7:00p"
    afterViosMinutes: number; // corte VIOS por defecto de ese encabezado
}

// Qué servicios/encabezados aparecen en el PDF (útil para saber si Punto fue a las 7p o 8p)
export function detectServiceHeadings(text: string): DetectedService[] {
    return splitByServiceSections(text)
        .map((sec) => {
            const cfg = resolveServiceByHeading(sec.heading);
            return cfg
                ? { key: cfg.key, heading: cfg.heading, afterViosMinutes: cfg.afterViosMinutes }
                : null;
        })
        .filter((x): x is DetectedService => x !== null);
}

// Corte VIOS manual por servicio (minutos desde medianoche). Si se omite, se usa el default del encabezado.
export type ViosOverrides = Partial<Record<ServiceKey, number>>;

// ---------- API de extracción (parsea el PDF UNA vez) ----------
// Devuelve, por encabezado de servicio (ej: "Sunday 8:00p"), las horas de llegada
// en minutos por área. Permite recalcular el corte VIOS sin volver a procesar el PDF.
export interface SectionAreaTimes {
    // nombre de área (canónico o detectado) -> minutos de llegada desde medianoche
    [area: string]: number[];
}
export type TimesBySection = {
    // encabezado canónico del servicio, ej: "Sunday 8:00p"
    [heading: string]: SectionAreaTimes;
};

export function extractArrivalTimes(text: string): TimesBySection {
    const sections = splitByServiceSections(text);
    const times: TimesBySection = {};

    // Acepta 7a / 7am / 7:05a / 7:05am / 12p / 12:00p
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(a|am|p|pm)\b/gi;

    for (const sec of sections) {
        const cfg = resolveServiceByHeading(sec.heading);
        if (!cfg) continue; // sección no configurada -> se ignora

        // Divide el cuerpo por bloques de área (tu lógica).
        // Punto además separa bloques que inician con "Equipo discapacidad > " (ej: Punto ED).
        const splitRx =
            cfg.key === 'SUN_8P'
                ? /(?=(Voluntarios CDV > |Kids > |Equipo discapacidad > ))/g
                : /(?=(Voluntarios CDV > |Kids > ))/g;
        const areaBlocks = sec.body.split(splitRx);

        for (const block of areaBlocks) {
            // 1) ¿qué área es este bloque?
            // Solo Punto usa sus patrones; los servicios clásicos quedan intactos
            const patterns = cfg.key === 'SUN_8P' ? PUNTO_AREA_PATTERNS : AREA_PATTERNS;
            const matchKey = Object.keys(patterns)
                .sort((a, b) => b.length - a.length)
                .find((pattern) => clean(block).includes(clean(pattern)));
            if (!matchKey) continue;

            const areaName: string = patterns[matchKey];

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

                if (!times[cfg.heading]) times[cfg.heading] = {};
                if (!times[cfg.heading][areaName]) times[cfg.heading][areaName] = [];
                times[cfg.heading][areaName].push(minutes);
            }
        }
    }

    return times;
}

// Recalcula los resúmenes a partir de las horas de llegada (sin reprocesar el PDF).
// El corte VIOS manual por servicio (si se pasa) gana; si no, se usa el default del encabezado.
export function computeResumen(
    times: TimesBySection,
    viosOverrides?: ViosOverrides
): Record<ServiceKey, AreaResumen[]> {
    // acumulador por servicio y por área
    const acc: Record<ServiceKey, Record<string, { total: number; lateCount: number }>> = {
        SUN_8A: {}, SUN_10A: {}, SUN_12P: {}, SUN_5P: {}, SUN_8P: {}
    };

    (Object.keys(acc) as ServiceKey[]).forEach((svc) => {
        for (const area of AREAS_BY_SERVICE[svc]) {
            acc[svc][area] = { total: 0, lateCount: 0 };
        };
    });

    for (const heading of Object.keys(times)) {
        const cfg = getServiceTimes().find((s) => s.heading === heading);
        if (!cfg) continue; // encabezado sin configuración -> se ignora

        // Corte VIOS: el manual (si se pasa) gana; si no, el default del encabezado
        const afterVios = viosOverrides?.[cfg.key] ?? cfg.afterViosMinutes;

        for (const areaName of Object.keys(times[heading])) {
            // Acumulador a prueba de fallos: si el área no está inicializada, se crea.
            if (!acc[cfg.key][areaName]) {
                acc[cfg.key][areaName] = { total: 0, lateCount: 0 };
            }
            const minutes = times[heading][areaName];
            acc[cfg.key][areaName].total += minutes.length;
            acc[cfg.key][areaName].lateCount += minutes.filter((m) => m > afterVios).length;
        }
    }

    // Pasar a AreaResumen[] mapeando SIEMPRE sobre la lista canónica (fija orden y asegura 0s)
    // Cualquier área extra detectada en el PDF se agrega al final (flexibilidad ante áreas nuevas).
    const toResumen = (
        svc: ServiceKey,
        m: Record<string, { total: number; lateCount: number }>
    ): AreaResumen[] => {
        const canonical = AREAS_BY_SERVICE[svc];
        const rows: AreaResumen[] = canonical.map((area) => ({
            area,
            total: m[area]?.total ?? 0,
            lateCount: m[area]?.lateCount ?? 0,
        }));
        for (const area of Object.keys(m)) {
            if (!canonical.includes(area)) {
                rows.push({
                    area,
                    total: m[area].total,
                    lateCount: m[area].lateCount,
                });
            }
        }
        return rows;
    };

    return {
        SUN_8A: toResumen('SUN_8A', acc.SUN_8A),
        SUN_10A: toResumen('SUN_10A', acc.SUN_10A),
        SUN_12P: toResumen('SUN_12P', acc.SUN_12P),
        SUN_5P: toResumen('SUN_5P', acc.SUN_5P),
        SUN_8P: toResumen('SUN_8P', acc.SUN_8P),
    };
}

// ---------- API principal: devuelve los resúmenes por servicio ----------
export function parsePdfTextAllServices(
    text: string,
    viosOverrides?: ViosOverrides
): Record<ServiceKey, AreaResumen[]> {
    return computeResumen(extractArrivalTimes(text), viosOverrides);
}
