import prisma from "@/lib/prisma";
import Link from "next/link";

// ¡La solución al error de Next.js de bloqueo!
export const instant = false;

export default async function PacienteResumenPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // Solo traemos LA ÚLTIMA consulta para mostrar en el resumen rápido
  const ultimaConsulta = await prisma.consulta.findFirst({
    where: { paciente_id: pacienteId },
    orderBy: { fecha_consulta: "desc" },
    include: { tratamientos: true },
  });

  // Si no hay consultas, mostramos la invitación a crear la primera
  if (!ultimaConsulta) {
    return (
      <div className="bg-white p-12 rounded-2xl border text-center border-dashed border-slate-300 mt-4">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌱</div>
        <h3 className="text-lg font-bold text-slate-700">Expediente Nuevo</h3>
        <p className="text-slate-500 mt-2 mb-6">Este paciente aún no tiene consultas registradas.</p>
        
        {/* BOTÓN ARREGLADO: Disfrazamos un Link de Next.js como si fuera un botón */}
        <Link 
          href={`/pacientes/${pacienteId}/nueva-consulta`}
          className="inline-flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-200 rounded-xl h-11 px-6 font-semibold transition-all hover:-translate-y-0.5"
        >
          + Iniciar Primera Consulta
        </Link>
      </div>
    );
  }

  // Si sí hay consultas, mostramos el Dashboard de la última visita
  return (
    <div className="pb-12 mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TARJETA 1: TRATAMIENTO ACTIVO */}
        <div className="md:col-span-2 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              💊 Tratamiento Activo
            </h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
              Última visita: {new Date(ultimaConsulta.fecha_consulta).toLocaleDateString('es-MX')}
            </span>
          </div>
          
          <div className="space-y-3">
            {ultimaConsulta.tratamientos.length > 0 ? (
              ultimaConsulta.tratamientos.map((t: any, i: number) => (
                <div key={i} className="bg-white/10 p-3 rounded-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="font-bold text-lg">{t.medicamento} <span className="text-purple-200 text-sm font-normal">({t.escala_potencia})</span></div>
                  <div className="text-sm text-purple-100 text-right">
                    {t.cantidad_sucusion} • {t.frecuencia}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-purple-200 text-sm">No se recetó medicamento en la última visita.</p>
            )}
          </div>
        </div>

        {/* TARJETA 2: PERFIL HOMEOPÁTICO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Perfil Homeopático</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <span className="text-slate-500 block text-xs">Miasma Predisponente</span>
              <strong className="text-slate-700">{ultimaConsulta.miasma_predisponente || "No definido"}</strong>
            </li>
            <li>
              <span className="text-slate-500 block text-xs">Miasma Secundario</span>
              <strong className="text-slate-700">{ultimaConsulta.miasma_secundario || "No definido"}</strong>
            </li>
            <li>
              <span className="text-slate-500 block text-xs">Tipo de Caso</span>
              <strong className="text-slate-700">{ultimaConsulta.tipo_caso || "No definido"}</strong>
            </li>
          </ul>
        </div>

        {/* TARJETA 3: ÚLTIMOS SIGNOS VITALES */}
        <div className="md:col-span-3 bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-4">🩺 Última Somatometría y Vitales</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            {ultimaConsulta.peso && <div><span className="text-blue-700/70 block text-xs">Peso</span><strong className="text-blue-950 text-lg">{Number(ultimaConsulta.peso)} kg</strong></div>}
            {ultimaConsulta.talla && <div><span className="text-blue-700/70 block text-xs">Talla</span><strong className="text-blue-950 text-lg">{Number(ultimaConsulta.talla)} cm</strong></div>}
            {ultimaConsulta.presion_arterial && <div><span className="text-blue-700/70 block text-xs">Presión A.</span><strong className="text-blue-950 text-lg">{ultimaConsulta.presion_arterial}</strong></div>}
            {ultimaConsulta.frecuencia_cardiaca && <div><span className="text-blue-700/70 block text-xs">Frec. Cardíaca</span><strong className="text-blue-950 text-lg">{ultimaConsulta.frecuencia_cardiaca} lpm</strong></div>}
            {ultimaConsulta.temperatura && <div><span className="text-blue-700/70 block text-xs">Temperatura</span><strong className="text-blue-950 text-lg">{Number(ultimaConsulta.temperatura)} °C</strong></div>}
          </div>
        </div>

      </div>
    </div>
  );
}