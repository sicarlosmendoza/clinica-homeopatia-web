"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cambiarEstadoCita } from "./actions";

interface CitaAccionesProps {
  citaId: string;
  pacienteId: string | null;
  estado: string;
}

export default function BotonAccionesCita({ citaId, pacienteId, estado }: CitaAccionesProps) {
  const [isPending, startTransition] = useTransition();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleCambiarEstado = (nuevoEstado: "Programada" | "Confirmada" | "Cancelada") => {
    setMenuAbierto(false);
    startTransition(async () => {
      await cambiarEstadoCita(citaId, nuevoEstado);
    });
  };

  return (
    <div className="relative flex items-center justify-end gap-2">
      {/* Botón Ver Expediente */}
      {pacienteId && (
        <Link
          href={`/pacientes/${pacienteId}`}
          className="text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
        >
          Expediente
        </Link>
      )}

      {/* CASO 1: Cita Programada */}
      {estado === "Programada" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleCambiarEstado("Confirmada")}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
        >
          <span>✓</span> {isPending ? "..." : "Confirmar"}
        </button>
      )}

      {/* CASO 2: Cita Confirmada (mismo alto, sin play, alineado) */}
      {estado === "Confirmada" && pacienteId && (
        <Link
          href={`/pacientes/${pacienteId}/nueva-consulta?citaId=${citaId}`}
          className="text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 border border-purple-700 px-3 py-1.5 rounded-xl shadow-sm transition-all whitespace-nowrap inline-flex items-center justify-center"
        >
          ▶️ I n i c i a r
        </Link>
      )}

      {/* Menú contextual (•••) */}
      {estado !== "Completada" && (
        <div className="relative">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-xl border border-slate-200 transition-colors h-[30px] w-[30px] flex items-center justify-center"
            title="Opciones de gestión"
          >
            •••
          </button>

          {menuAbierto && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setMenuAbierto(false)} 
              />

              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                {estado !== "Confirmada" && (
                  <button
                    type="button"
                    onClick={() => handleCambiarEstado("Confirmada")}
                    className="w-full text-left px-3 py-2 text-emerald-700 hover:bg-emerald-50 font-semibold flex items-center gap-2"
                  >
                    <span>✓</span> Marcar Confirmada
                  </button>
                )}

                {estado !== "Programada" && (
                  <button
                    type="button"
                    onClick={() => handleCambiarEstado("Programada")}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                  >
                    <span>↩</span> Revertir a Programada
                  </button>
                )}

                {estado !== "Cancelada" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("¿Estás seguro de cancelar esta cita? El horario volverá a quedar disponible en la web pública.")) {
                        handleCambiarEstado("Cancelada");
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-semibold border-t border-slate-100 flex items-center gap-2"
                  >
                    <span>✕</span> Cancelar Cita
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}