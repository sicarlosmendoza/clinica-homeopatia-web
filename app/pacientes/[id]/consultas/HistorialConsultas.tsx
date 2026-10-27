"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Definimos la estructura de datos que esperamos recibir de Prisma
type Tratamiento = {
  medicamento: string;
  escala_potencia: string | null;
  cantidad_sucusion: string | null;
  frecuencia: string | null;
  duracion: string | null;
};

type Consulta = {
  id: string;
  folio_consulta: string;
  fecha_consulta: Date;
  origen: string | null;
  peso: number | null;
  talla: number | null;
  presion_arterial: string | null;
  motivo_consulta: string | null;
  caso_clinico: string | null;
  sintomas_mentales: string | null;
  sintomas_generales: string | null;
  sintomas_particulares: string | null;
  tratamientos: Tratamiento[];
};

export default function HistorialConsultas({ consultas }: { consultas: Consulta[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [expandidas, setExpandidas] = useState<string[]>([]);

  // Función para abrir/cerrar un acordeón
  const toggleConsulta = (id: string) => {
    setExpandidas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Filtrado simple por motivo o padecimiento
  const consultasFiltradas = consultas.filter((c) => {
    const textoBuscado = busqueda.toLowerCase();
    const motivo = c.motivo_consulta?.toLowerCase() || "";
    const caso = c.caso_clinico?.toLowerCase() || "";
    return motivo.includes(textoBuscado) || caso.includes(textoBuscado);
  });

  if (consultas.length === 0) {
    return (
      <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-300 text-center mt-6">
        <h3 className="text-lg font-bold text-slate-700">Sin historial clínico</h3>
        <p className="text-slate-500 mt-2">El paciente aún no cuenta con consultas registradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar síntoma, motivo o diagnóstico en el historial..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Lista de Consultas */}
      <div className="space-y-4">
        {consultasFiltradas.map((consulta) => {
          const isExpanded = expandidas.includes(consulta.id);
          const fechaFormat = format(new Date(consulta.fecha_consulta), "EEEE d 'de' MMMM, yyyy", { locale: es });
          
          // Extraemos el primer medicamento para mostrarlo en el encabezado
          const rxPrincipal = consulta.tratamientos[0]?.medicamento || "Sin medicamento";

          return (
            <div key={consulta.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              
              {/* Encabezado del Acordeón (Clicable) */}
              <div
                onClick={() => toggleConsulta(consulta.id)}
                className="p-5 cursor-pointer hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">
                      {consulta.folio_consulta}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 capitalize">
                      {fechaFormat}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {consulta.motivo_consulta || "Consulta general"}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden md:block">
                    <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider">Prescripción</span>
                    <strong className="text-purple-700">{rxPrincipal}</strong>
                  </div>
                  <div className="text-slate-400 font-bold ml-2">
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </div>
              </div>

              {/* Contenido Expandido */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2">
                  
                  {/* Fila 1: Signos Vitales */}
                  <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2 text-sm bg-white p-3 rounded-xl border border-slate-100">
                    {consulta.peso && <div><span className="text-slate-500 font-bold mr-1">Peso:</span>{Number(consulta.peso)} kg</div>}
                    {consulta.talla && <div><span className="text-slate-500 font-bold mr-1">Talla:</span>{Number(consulta.talla)} m</div>}
                    {consulta.presion_arterial && <div><span className="text-slate-500 font-bold mr-1">TA:</span>{consulta.presion_arterial}</div>}
                    {consulta.origen && <div><span className="text-slate-500 font-bold mr-1">Origen:</span>{consulta.origen}</div>}
                  </div>

                  {/* Fila 2: Narrativa y Síntomas (Columnas) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {consulta.caso_clinico && (
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-1 border-b pb-1">Narrativa Clínica</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{consulta.caso_clinico}</p>
                      </div>
                    )}
                    
                    {/* Fila 3: Receta Detallada e Impresión */}
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 mt-6 relative">
                    
                    {/* Botón de Imprimir Receta */}
                    <div className="absolute top-4 right-4">
                      <a 
                        href={`/pacientes/${consulta.paciente_id}/consultas/${consulta.id}/receta`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                      >
                        🖨️ Imprimir Receta
                      </a>
                    </div>

                    <h4 className="text-xs font-black uppercase text-purple-800 mb-3 flex items-center gap-1">
                      <span>💊</span> Receta Médica Emitida
                    </h4>
                    
                    <div className="space-y-3 pr-40">
                      {consulta.tratamientos.map((t, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                          <div>
                            <strong className="text-purple-900 block md:inline text-base">{t.medicamento}</strong>
                            {t.escala_potencia && <span className="text-purple-700 ml-0 md:ml-2 text-sm font-semibold">{t.escala_potencia}</span>}
                          </div>
                          
                          <div className="text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {t.cantidad_sucusion && <span><b className="text-slate-400">Dosis:</b> {t.cantidad_sucusion}</span>}
                            {t.frecuencia && <span><b className="text-slate-400">Frec:</b> {t.frecuencia}</span>}
                            {t.duracion && <span><b className="text-slate-400">Dur:</b> {t.duracion}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                    <div className="space-y-4">
                      {consulta.sintomas_mentales && (
                        <div>
                          <h4 className="text-xs font-black uppercase text-blue-500 mb-1">Mentales</h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap italic">{consulta.sintomas_mentales}</p>
                        </div>
                      )}
                      {consulta.sintomas_generales && (
                        <div>
                          <h4 className="text-xs font-black uppercase text-amber-600 mb-1">Generales</h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap italic">{consulta.sintomas_generales}</p>
                        </div>
                      )}
                      {consulta.sintomas_particulares && (
                        <div>
                          <h4 className="text-xs font-black uppercase text-emerald-600 mb-1">Particulares</h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap italic">{consulta.sintomas_particulares}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fila 3: Receta Detallada */}
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-xs font-black uppercase text-purple-800 mb-3 flex items-center gap-1">
                      <span>💊</span> Receta Médica Emitida
                    </h4>
                    
                    <div className="space-y-3">
                      {consulta.tratamientos.map((t, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <strong className="text-purple-900 block md:inline text-base">{t.medicamento}</strong>
                            {t.escala_potencia && <span className="text-purple-700 ml-0 md:ml-2 text-sm font-semibold">{t.escala_potencia}</span>}
                          </div>
                          
                          <div className="text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {t.cantidad_sucusion && <span><b className="text-slate-400">Dosis:</b> {t.cantidad_sucusion}</span>}
                            {t.frecuencia && <span><b className="text-slate-400">Frec:</b> {t.frecuencia}</span>}
                            {t.duracion && <span><b className="text-slate-400">Dur:</b> {t.duracion}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}