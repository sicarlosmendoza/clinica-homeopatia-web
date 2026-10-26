"use client";

import { useState } from "react";

// Recibimos las consultas desde la base de datos
export default function HistorialConsultas({ consultas }: { consultas: any[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null); // Guarda el ID de la consulta abierta

  // Filtramos en tiempo real por motivo, caso clínico o medicamento
  const consultasFiltradas = consultas.filter((c) => {
    const texto = busqueda.toLowerCase();
    const coincideMotivo = c.motivo_consulta?.toLowerCase().includes(texto);
    const coincideCaso = c.caso_clinico?.toLowerCase().includes(texto);
    const coincideMedicamento = c.tratamientos?.some((t: any) => 
      t.medicamento.toLowerCase().includes(texto)
    );
    return coincideMotivo || coincideCaso || coincideMedicamento;
  });

  if (consultas.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border text-center border-dashed border-slate-300">
        <h3 className="text-lg font-bold text-slate-700">Sin consultas previas</h3>
        <p className="text-slate-500 mt-2">Haz clic en "+ Iniciar Consulta" para registrar la primera visita.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por síntoma, motivo o medicamento (ej. Sulphur, Cistitis)..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Consultas */}
      <div className="space-y-4">
        {consultasFiltradas.map((consulta) => {
          const estaAbierto = expandido === consulta.id;
          const fecha = new Date(consulta.fecha_consulta).toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          });

          return (
            <div key={consulta.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-purple-200">
              
              {/* Cabecera (Siempre visible) */}
              <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50"
                onClick={() => setExpandido(estaAbierto ? null : consulta.id)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded uppercase">
                      {consulta.folio_consulta}
                    </span>
                    <span className="text-sm font-medium text-slate-500 capitalize">{fecha}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">{consulta.motivo_consulta}</h4>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="hidden md:block text-right">
                    <p className="font-semibold text-purple-700">
                      {consulta.tratamientos[0]?.medicamento || "Sin receta"}
                    </p>
                    {consulta.tratamientos.length > 1 && (
                      <p className="text-xs text-slate-400">+{consulta.tratamientos.length - 1} más</p>
                    )}
                  </div>
                  <svg className={`w-6 h-6 text-slate-400 transition-transform ${estaAbierto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Contenido Expandible (Detalle de la consulta) */}
              {estaAbierto && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2">
                  
                  {/* Signos Vitales */}
                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    {consulta.peso && <span className="bg-white border px-3 py-1 rounded-lg"><strong>Peso:</strong> {Number(consulta.peso)} kg</span>}
                    {consulta.talla && <span className="bg-white border px-3 py-1 rounded-lg"><strong>Talla:</strong> {Number(consulta.talla)} cm</span>}
                    {consulta.presion_arterial && <span className="bg-white border px-3 py-1 rounded-lg"><strong>TA:</strong> {consulta.presion_arterial}</span>}
                    {consulta.frecuencia_cardiaca && <span className="bg-white border px-3 py-1 rounded-lg"><strong>FC:</strong> {consulta.frecuencia_cardiaca} lpm</span>}
                  </div>

                  {/* Caso y Síntomas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="font-bold text-slate-700 mb-2">Narrativa Clínica</h5>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{consulta.caso_clinico || "No registrada."}</p>
                    </div>
                    <div className="space-y-3">
                      {consulta.sintomas_mentales && (
                        <div className="bg-pink-50/50 p-3 rounded-lg border border-pink-100">
                          <h6 className="text-xs font-bold text-pink-800 uppercase">Mentales</h6>
                          <p className="text-sm text-slate-700">{consulta.sintomas_mentales}</p>
                        </div>
                      )}
                      {consulta.sintomas_generales && (
                        <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                          <h6 className="text-xs font-bold text-purple-800 uppercase">Generales</h6>
                          <p className="text-sm text-slate-700">{consulta.sintomas_generales}</p>
                        </div>
                      )}
                      {consulta.sintomas_particulares && (
                        <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-100">
                          <h6 className="text-xs font-bold text-sky-800 uppercase">Particulares</h6>
                          <p className="text-sm text-slate-700">{consulta.sintomas_particulares}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Repertorización y Tratamiento */}
                  <div className="bg-white border border-purple-100 rounded-xl p-5">
                    <div className="flex flex-wrap gap-4 mb-4 text-xs">
                      {consulta.miasma_predisponente && <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded">Predisponente: {consulta.miasma_predisponente}</span>}
                      {consulta.miasma_secundario && <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded">Secundario: {consulta.miasma_secundario}</span>}
                      {consulta.tipo_caso && <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded">Caso: {consulta.tipo_caso}</span>}
                    </div>

                    <h5 className="font-bold text-slate-800 mb-3 border-b pb-2">Receta Médica</h5>
                    <div className="space-y-3">
                      {consulta.tratamientos?.map((t: any, i: number) => (
                        <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm items-center bg-slate-50 p-2 rounded-lg">
                          <div className="col-span-2 font-bold text-purple-900 flex items-center gap-2">
                            <span className="bg-purple-200 text-purple-800 w-5 h-5 flex items-center justify-center rounded-full text-xs">{i+1}</span>
                            {t.medicamento}
                          </div>
                          <div><span className="text-xs text-slate-400 block">Potencia</span>{t.escala_potencia || "-"}</div>
                          <div><span className="text-xs text-slate-400 block">Dosis</span>{t.cantidad_sucusion || "-"}</div>
                          <div><span className="text-xs text-slate-400 block">Frecuencia</span>{t.frecuencia || "-"}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {consultasFiltradas.length === 0 && busqueda !== "" && (
          <p className="text-center text-slate-500 py-8">No se encontraron consultas con "{busqueda}"</p>
        )}
      </div>
    </div>
  );
}