import Modal from "./Modal";
import { useMemo } from "react";

export default function ListaDetailModal({
    record,
    onClose,
}: {
    record: any; // trae .detalles
    onClose: () => void;
}) {
    // Si ya tienes "sortedDetails", usa ese array en lugar de "details".
    const details = useMemo(() => [...(record?.detalles ?? [])], [record]);

    const totalVol = useMemo(
        () => details.reduce((acc, d) => acc + (Number(d.total_voluntarios) || 0), 0),
        [details]
    );
    const totalPost = useMemo(
        () => details.reduce((acc, d) => acc + (Number(d.post_vios) || 0), 0),
        [details]
    );
    return (
        <Modal
            open={!!record}
            onClose={onClose}
            // title={`Detalle #${record?.id} — ${record?.nombre ?? ""}`}
            title={`${record?.nombre ?? ""}`}
            maxWidth="2xl"
        >
            {/* Cabecera del detalle */}
            <div className="text-sm text-gray-600 mb-3 space-y-1">
                <div>
                    <strong>Fecha:</strong>{" "}
                    {record?.fecha ? String(record.fecha).slice(0, 10) : "-"}
                </div>
                {record?.estado && (
                    <div>
                        <strong>Estado:</strong> {record.estado}
                    </div>
                )}
                {/* {record?.checksum && (
                    <div className="truncate">
                        <strong>Checksum:</strong> {record.checksum}
                    </div>
                )} */}
            </div>

            {/* Tabla con scroll y thead sticky */}
            <div className="border rounded-xl overflow-hidden">
                <div className="max-h-[55vh] overflow-y-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 text-left whitespace-nowrap">Área</th>
                                <th className="px-3 py-2 text-right whitespace-nowrap">Total voluntarios</th>
                                <th className="px-3 py-2 text-right whitespace-nowrap">Post-víos</th>
                                <th className="px-3 py-2 text-left whitespace-nowrap">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {[...(record?.detalles ?? [])]
                                .sort((a, b) =>
                                    (a.area ?? '').localeCompare(b.area ?? '', 'es', { sensitivity: 'base' }) ||
                                    (a.subarea ?? '').localeCompare(b.subarea ?? '', 'es', { sensitivity: 'base' })
                                )
                                .map((d: any, idx: number) => (
                                    <tr key={idx} className="border-t hover:bg-gray-50">
                                        <td className="px-3 py-2">{d.area}</td>
                                        <td className="px-3 py-2 text-right">{d.total_voluntarios}</td>
                                        <td className="px-3 py-2 text-right">{d.post_vios}</td>
                                        <td className="px-3 py-2">{d.observaciones ?? ""}</td>
                                    </tr>
                                ))}
                            {(!record?.detalles || record.detalles.length === 0) && (
                                <tr>
                                    <td className="px-3 py-4 text-gray-500" colSpan={5}>
                                        Sin detalles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {/* 👇 Footer con totales (sticky en la parte baja del scroll) */}
                        <tfoot className="bg-gray-100 sticky bottom-0 z-10">
                            <tr className="border-t font-semibold">
                                {/* ← ocupa SOLO la 1a columna */}
                                <td className="px-3 py-2 text-right">Totales:</td>
                                {/* ← totales bajo sus columnas correctas */}
                                <td className="px-3 py-2 text-right">
                                    {totalVol.toLocaleString("es-PE")}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {totalPost.toLocaleString("es-PE")}
                                </td>
                                {/* ← Observaciones en blanco para completar 4 columnas */}
                                <td className="px-3 py-2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Footer (acciones) */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={onClose}
                    className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                    Cerrar
                </button>
            </div>
        </Modal>
    );
}
