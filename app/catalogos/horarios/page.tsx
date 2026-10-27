import prisma from "@/lib/prisma";
import { agregarHorario, eliminarHorario } from "@/app/actions/agenda.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const instant = false;

// Función de ayuda para traducir el número del día a texto
const obtenerNombreDia = (numero: number) => {
  const dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  return dias[numero] || "Desconocido";
};

export default async function CatalogoHorariosPage() {
  // Traemos los datos necesarios para armar el formulario
  const [medicos, sedes, horarios] = await Promise.all([
    prisma.medico.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.sede.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    // Traemos los horarios existentes, incluyendo los datos del médico y la sede vinculada
    prisma.horarioMedico.findMany({
      include: { medico: true, sede: true },
      orderBy: [
        { medico: { nombre: 'asc' } },
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    })
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-800">
        ← Regresar al Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Matriz de Horarios</h1>
        <p className="text-slate-600">Asigna los días y horas de atención de cada médico en sus respectivas sedes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario de Asignación */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="font-bold text-slate-800 mb-4 text-lg">📅 Nuevo Horario</h2>
          
          {/* EL TRUCO ESTÁ AQUÍ: method="POST" forzado */}
          <form action={agregarHorario} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Médico *</label>
              <select name="medico_id" required defaultValue="" className="w-full p-2.5 border rounded-xl bg-white">
                <option value="" disabled>Selecciona un médico...</option>
                {medicos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sede / Consultorio *</label>
              <select name="sede_id" required defaultValue="" className="w-full p-2.5 border rounded-xl bg-white">
                <option value="" disabled>Selecciona una sede...</option>
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Día de la semana *</label>
              <select name="dia_semana" required defaultValue="" className="w-full p-2.5 border rounded-xl bg-white">
                <option value="" disabled>Selecciona el día...</option>
                <option value="1">Lunes</option>
                <option value="2">Martes</option>
                <option value="3">Miércoles</option>
                <option value="4">Jueves</option>
                <option value="5">Viernes</option>
                <option value="6">Sábado</option>
                <option value="7">Domingo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio *</label>
                <input type="time" name="hora_inicio" required className="w-full p-2.5 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin *</label>
                <input type="time" name="hora_fin" required className="w-full p-2.5 border rounded-xl" />
              </div>
            </div>

            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl mt-2">
              Asignar Horario
            </Button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Horarios Asignados */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-800 mb-4 text-lg">Horarios Configurados ({horarios.length})</h2>
          
          {horarios.length === 0 && (
            <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              Aún no hay horarios asignados. Usa el formulario para configurar la agenda.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {horarios.map((horario) => {
              const eliminarAccion = eliminarHorario.bind(null, horario.id);
              
              return (
                <div key={horario.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        {obtenerNombreDia(horario.dia_semana)}
                      </span>
                      <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                        {horario.hora_inicio} - {horario.hora_fin}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800">{horario.medico.nombre}</h3>
                    <p className="text-sm text-slate-500">📍 {horario.sede.nombre}</p>
                  </div>
                  
                  {/* method="POST" forzado para el botón de eliminar también */}
                  <form action={eliminarAccion} className="mt-auto border-t pt-3">
                    <Button type="submit" variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                      🗑️ Quitar Horario
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}