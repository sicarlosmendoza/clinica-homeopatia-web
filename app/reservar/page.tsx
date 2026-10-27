import prisma from "@/lib/prisma";
import FormularioReserva from "./FormularioReserva";

export const instant = false;

export default async function ReservarPage() {
  // Obtenemos sedes, médicos, matriz de horarios y las citas que no estén canceladas
  const [sedes, medicos, horarios, citas] = await Promise.all([
    prisma.sede.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.medico.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.horarioMedico.findMany({ where: { activo: true } }),
    prisma.cita.findMany({
      where: {
        estado: { not: "Cancelada" },
      },
      select: {
        id: true,
        medico_id: true,
        sede_id: true,
        fecha_cita: true,
        estado: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block bg-purple-100 p-4 rounded-full mb-4">
            <span className="text-4xl">🔮</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Agenda tu Consulta</h1>
          <p className="mt-3 text-lg text-slate-600 font-medium">
            Selecciona el consultorio, elige a tu médico y encuentra el horario disponible.
          </p>
        </div>

        {/* Pasamos también las citas existentes */}
        <FormularioReserva 
          sedes={sedes} 
          medicos={medicos} 
          horarios={horarios} 
          citas={citas} 
        />
      </div>
    </div>
  );
}