import { obtenerEstadisticasDashboard } from "@/app/actions/dashboard.actions";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export const instant = false;

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ vista?: string }> 
}) {
  const resolvedSearchParams = await searchParams;
  const vista = resolvedSearchParams.vista || "hoy"; // "hoy", "semana" o "mes"

  const session = await auth();
  const estadisticas = await obtenerEstadisticasDashboard();
  
  const primerNombre = session?.user?.name?.split(" ")[0] || "Doctora";
  const hoy = new Date();
  const fechaHoy = format(hoy, "EEEE, d 'de' MMMM", { locale: es });

  // 1. Calculamos los rangos de fechas dependiendo de la vista
  let fechaInicio = startOfDay(hoy);
  let fechaFin = endOfDay(hoy);
  let tituloAgenda = "de Hoy";

  if (vista === "semana") {
    fechaInicio = startOfWeek(hoy, { weekStartsOn: 1 });
    fechaFin = endOfWeek(hoy, { weekStartsOn: 1 });
    tituloAgenda = "de la Semana";
  } else if (vista === "mes") {
    fechaInicio = startOfMonth(hoy);
    fechaFin = endOfMonth(hoy);
    tituloAgenda = "del Mes";
  }

  // 2. Consultamos las citas usando el rango dinámico
  const citas = await prisma.cita.findMany({
    where: {
      fecha_cita: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    },
    include: {
      sede: true,
      paciente: true,
    },
    orderBy: {
      fecha_cita: "asc", 
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Cabecera del Dashboard */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            ¡Buenos días {primerNombre}! 👋
          </h1>
          <p className="text-slate-500 mt-2 text-lg capitalize">
            Hoy es {fechaHoy}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/pacientes/nuevo">
            <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              ➕ Nuevo Paciente
            </button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Estadísticas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-6 rounded-3xl text-white shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 font-medium text-sm mb-1">Total Pacientes</p>
              <h2 className="text-4xl font-black">{estadisticas.totalPacientes}</h2>
            </div>
            <div className="text-4xl opacity-50">👥</div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <Link href="/pacientes" className="text-sm text-white hover:underline flex items-center justify-between">
              Ver directorio completo <span>→</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Consultas Realizadas</p>
              <h2 className="text-4xl font-black text-slate-800">{estadisticas.totalConsultas}</h2>
            </div>
            <div className="text-4xl opacity-20">🩺</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Sedes Activas</p>
              <h2 className="text-4xl font-black text-slate-800">{estadisticas.sedesActivas}</h2>
            </div>
            <div className="text-4xl opacity-20">🏢</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link href="/catalogos/sedes" className="text-sm text-blue-600 hover:underline">Gestionar sedes</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Médicos en Plantilla</p>
              <h2 className="text-4xl font-black text-slate-800">{estadisticas.medicosActivos}</h2>
            </div>
            <div className="text-4xl opacity-20">👨‍⚕️</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link href="/catalogos/medicos" className="text-sm text-blue-600 hover:underline">Gestionar médicos</Link>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Agenda (Día / Semana / Mes) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">
              Agenda {tituloAgenda}
            </h2>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
              {citas.length} Cita{citas.length !== 1 && 's'}
            </span>
          </div>

          {/* NUEVO: Selector de 3 Vistas */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl">
            <Link 
              href="?vista=hoy" 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${vista === "hoy" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              Día
            </Link>
            <Link 
              href="?vista=semana" 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${vista === "semana" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              Semana
            </Link>
            <Link 
              href="?vista=mes" 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${vista === "mes" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              Mes
            </Link>
          </div>
          
        </div>
        
        {citas.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
            <div className="text-4xl mb-4">☕</div>
            <p className="font-medium text-slate-700">Agenda libre por el momento.</p>
            <p className="text-sm mt-1">No hay citas programadas para {tituloAgenda.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {citas.map((cita) => (
              <div key={cita.id} className="flex items-center justify-between p-4 border rounded-2xl hover:border-purple-300 hover:shadow-md transition-all bg-white group">
                
                <div className="flex items-center gap-5">
                  <div className="text-center min-w-[80px]">
                    {/* Si es vista de semana o mes, muestra el día y el mes (Ej. lun 27 oct). Si es hoy, solo la hora */}
                    {(vista === "semana" || vista === "mes") && (
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 whitespace-nowrap">
                        {format(new Date(cita.fecha_cita), "EEE dd MMM", { locale: es })}
                      </div>
                    )}
                    <div className="text-lg font-black text-slate-800">
                      {format(new Date(cita.fecha_cita), "HH:mm")}
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold border border-purple-200">
                    {cita.nombre_paciente.charAt(0)}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {cita.nombre_paciente}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cita.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                        cita.estado === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {cita.estado}
                      </span>
                      <span className="text-base text-slate-500 flex items-center gap-1">
                        📍 {cita.sede.nombre}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {cita.paciente_id ? (
                    <Link href={`/pacientes/${cita.paciente_id}`}>
                      <button className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition-colors">
                        Ver Expediente
                      </button>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Paciente Web (Sin expediente)</span>
                  )}
                  
                  {cita.estado === 'PENDIENTE' && (
                    <Link href={`/pacientes/${cita.paciente_id}/nueva-consulta`}>
                      <button className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-2 px-4 rounded-xl transition-colors">
                        Iniciar Consulta
                      </button>
                    </Link>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}