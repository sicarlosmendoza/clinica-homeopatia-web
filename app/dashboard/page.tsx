import { obtenerEstadisticasDashboard } from "@/app/actions/dashboard.actions";
import { auth } from "@/auth";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();
  const estadisticas = await obtenerEstadisticasDashboard();
  
  const primerNombre = session?.user?.name?.split(" ")[0] || "Doctora";
  const fechaHoy = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

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

      {/* Sección Inferior: Agenda del Día (Placeholder para el siguiente paso) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Citas Programadas para Hoy</h2>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Próximamente</span>
        </div>
        
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
          <div className="text-4xl mb-4">📅</div>
          <p className="font-medium text-slate-700">El Módulo de Agenda está en construcción.</p>
          <p className="text-sm mt-1">Una vez que configuremos los horarios, aquí verás tu agenda del día cruzada por sedes.</p>
        </div>
      </div>

    </div>
  );
}