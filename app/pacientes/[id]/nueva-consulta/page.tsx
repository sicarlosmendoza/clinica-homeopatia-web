import prisma from "@/lib/prisma";
import FormularioConsulta from "./FormularioConsulta";
export const instant = false;

export default async function NuevaConsultaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;
  
  // 1. Buscamos la última talla (como ya lo teníamos)
  const ultimaConsulta = await prisma.consulta.findFirst({
    where: { paciente_id: pacienteId },
    orderBy: { fecha_consulta: "desc" },
  });
  const tallaPrevia = ultimaConsulta?.talla ? Number(ultimaConsulta.talla) : "";

  // 2. NUEVO: Buscamos a todos los médicos activos
  const medicosActivos = await prisma.medico.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, especialidad: true },
    orderBy: { nombre: "asc" }
  });

  return (
    <div className="max-w-5xl mx-auto pb-12 mt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Toma del Caso</h2>
          <p className="text-sm text-slate-500">Registro de nueva consulta y valoración homeopática.</p>
        </div>
      </div>
      
      {/* 3. Le pasamos la lista de médicos al formulario */}
      <FormularioConsulta 
        pacienteId={pacienteId} 
        tallaPrevia={tallaPrevia} 
        medicos={medicosActivos} 
      />
    </div>
  );
}