// src/types/api.ts
export type DetallePayload = {
    area: string;
    total_voluntarios: number;
    post_vios: number;
    observaciones?: string;
};

export type CreateListaPayload = {
    nombre: string;
    fecha: string;         // 'YYYY-MM-DD'
    estado?: 'procesado' | 'pendiente' | 'error';
    checksum?: string;     // SHA-256 opcional para idempotencia
    detalles: DetallePayload[];
};
