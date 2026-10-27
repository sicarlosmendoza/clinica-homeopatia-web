import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { connection } from "next/server";
import BotonAccionesCita from "./BotonAccionesCita";

export const instant = false;

async function obtenerCitas() {
  await connection();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return await prisma.cita.findMany({
    where: {
      fecha_cita: {
        gte: hoy,
      },
    },
    include: {
      paciente: {
        select: { 
          id: true, 
          nombre_completo: true, 
          telefono: true, 
          correo_electronico: true,
          _count: {
            select: {
              consultas: true,
              citas: {
                where: { estado: "Completada" }
              }
            }
          }
        },
      },
      medico: {
        select: { id: true, nombre: true },
      },
      sede: {
        select: { id: true, nombre: true },
      },
    },
    orderBy: {
      fecha_cita: "asc",
    },
  });
}

export default async function CitasPage() {
  const citas = await obtenerCitas();

  const colorEstado = (estado: string) => {
    switch (estado) {
      case "Programada": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Confirmada": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Cancelada": return "bg-red-100 text-red-700 border-red-200 line-through opacity-70";
      case "Completada": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Agenda de Citas</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">
            Gestiona las próximas consultas programadas.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* === VISTA MÓVIL (Tarjetas) === */}
        <div className="block md:hidden">
          {citas.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-lg font-medium text-slate-700">No hay citas próximas</p>
              <p className="text-sm">Las nuevas reservaciones aparecerán aquí.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {citas.map((cita) => {
                const fechaFormat = format(new Date(cita.fecha_cita), "EEEE d 'de' MMM", { locale: es });
                const horaFormat = format(new Date(cita.fecha_cita), "HH:mm 'hrs'");
                
                const totalConsultas = cita.paciente?._count?.consultas ?? 0;
                const totalCitasCompletadas = cita.paciente?._count?.citas ?? 0;
                const esPrimeraVisita = totalConsultas === 0 && totalCitasCompletadas === 0;

                return (
                  <div key={cita.id} className={`p-4 flex flex-col gap-3 ${cita.estado === "Cancelada" ? "bg-slate-50/40" : ""}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 capitalize text-sm">{fechaFormat}</div>
                        <div className="text-sm text-purple-700 font-bold bg-purple-50 inline-block px-2 py-0.5 rounded mt-1">
                          {horaFormat}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${colorEstado(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm mb-1">
                        <span title={esPrimeraVisita ? "Primera Visita" : "Paciente Subsecuente"}>
                          {esPrimeraVisita ? "⭐" : "🔄"}
                        </span>
                        <span>{cita.nombre_paciente}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-xs text-slate-500">
                        {cita.telefono && <span>📞 {cita.telefono}</span>}
                        
                        <div className="flex items-center gap-1 mt-1">
                          <span className="bg-slate-200 p-0.5 rounded-full text-[10px]">🩺</span> 
                          <span className="truncate">{cita.medico?.nombre}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="bg-slate-200 p-0.5 rounded-full text-[10px]">🏢</span>
                          <span className="truncate">{cita.sede?.nombre}</span>
                        </div>

                        {cita.motivo && (
                          <div className="mt-2 text-slate-400 italic bg-white p-2 rounded-lg border border-slate-200">
                            "{cita.motivo}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <BotonAccionesCita 
                        citaId={cita.id}
                        pacienteId={cita.paciente_id}
                        estado={cita.estado}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* === VISTA ESCRITORIO (Tabla Clásica) === */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Médico y Sede</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-lg font-medium text-slate-700">No hay citas próximas</p>
                    <p className="text-sm">Las nuevas reservaciones aparecerán aquí.</p>
                  </td>
                </tr>
              ) : (
                citas.map((cita) => {
                  const fechaFormat = format(new Date(cita.fecha_cita), "EEEE d 'de' MMMM", { locale: es });
                  const horaFormat = format(new Date(cita.fecha_cita), "HH:mm 'hrs'");
                  
                  const totalConsultas = cita.paciente?._count?.consultas ?? 0;
                  const totalCitasCompletadas = cita.paciente?._count?.citas ?? 0;
                  const esPrimeraVisita = totalConsultas === 0 && totalCitasCompletadas === 0;

                  return (
                    <tr 
                      key={cita.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${cita.estado === "Cancelada" ? "bg-slate-50/40" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 capitalize">{fechaFormat}</div>
                        <div className="text-sm text-purple-700 font-bold bg-purple-50 inline-block px-2 py-0.5 rounded mt-1">
                          {horaFormat}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span title={esPrimeraVisita ? "Primera Visita" : "Paciente Subsecuente"}>
                            {esPrimeraVisita ? "⭐" : "🔄"}
                          </span>
                          <span>{cita.nombre_paciente}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                          {cita.telefono && <span>📞 {cita.telefono}</span>}
                          {cita.motivo && <span className="italic text-slate-400 mt-1 line-clamp-1">"{cita.motivo}"</span>}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <span className="text-xs bg-slate-200 p-1 rounded-full">🩺</span> 
                          {cita.medico?.nombre || "Médico no asignado"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <span className="text-xs bg-slate-200 p-1 rounded-full">🏢</span>
                          {cita.sede?.nombre || "Sede no asignada"}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorEstado(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <BotonAccionesCita 
                          citaId={cita.id}
                          pacienteId={cita.paciente_id}
                          estado={cita.estado}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}