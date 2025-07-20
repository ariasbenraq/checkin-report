interface AreaResumen {
    area: string;
    total: number;
    lateCount: number;
}

function clean(str: string): string {
    return str
        .normalize("NFD")                    // Elimina tildes
        .replace(/[\u0300-\u036f]/g, "")     // Elimina marcas diacríticas
        .replace(/\s+/g, " ")                // Colapsa múltiples espacios
        .toLowerCase()                       // Ignora mayúsculas
        .trim();
}


// Diccionario de encabezado (patrón en PDF) => Nombre simplificado de área
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
    "Voluntarios CDV > Eventos > Desayuno": "Desayuno",
    "Voluntarios CDV > Voluntario ED": "ED",
    "Voluntarios CDV > CDV LINCE > Equipo Médico": "Equipo Médico",
    "Voluntarios CDV > CDV LINCE > Fin de semana inolvidable": "Fin de semana Inolvidable",
    "Voluntarios CDV > Eventos > Registro": "Registro",
    "Voluntarios CDV > CDV LINCE > Hombres CDV": "Hombres CDV",
    "Voluntarios CDV > CDV LINCE > Informes": "Informes",
    "Kids > Bebes - Lince": "Kids",
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

    // Aquí puedes agregar más áreas después
};

export function parsePdfText(text: string): AreaResumen[] {

    const areaBlocks: Record<string, { total: number; lateCount: number }> = {};
    const timeRegex = /(\d{1,2}):(\d{2})(am|pm)/gi;

    const sections = text.split(/(?=(Voluntarios CDV > |Kids > ))/g); // divide por bloque de área

    for (const block of sections) {
        console.log("📄 Bloque analizado:", block);

        // Verifica si el bloque comienza con alguna de las áreas
        const matchKey = Object.keys(AREA_PATTERNS)
            .sort((a, b) => b.length - a.length) // prioritiza subáreas específicas
            .find((pattern) =>
                clean(block).includes(clean(pattern))
            );


        if (!matchKey) continue;

        const area = AREA_PATTERNS[matchKey];
        if (!areaBlocks[area]) {
            areaBlocks[area] = { total: 0, lateCount: 0 };
        }

        const matches = [...block.matchAll(timeRegex)];

        for (const match of matches) {
            const hour = parseInt(match[1], 10);
            const minute = parseInt(match[2], 10);
            const ampm = match[3].toLowerCase();

            let hour24 = hour % 12;
            if (ampm === "pm") hour24 += 12;

            const arrivalMinutes = hour24 * 60 + minute;
            const isLate = arrivalMinutes > 450;

            areaBlocks[area].total += 1;
            if (isLate) areaBlocks[area].lateCount += 1;
        }
    }

    return Object.entries(areaBlocks).map(([area, stats]) => ({
        area,
        total: stats.total,
        lateCount: stats.lateCount,
    }));
}
