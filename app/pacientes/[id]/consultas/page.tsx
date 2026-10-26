export const instant = false;

import prisma from "@/lib/prisma";
import HistorialConsultas from "../HistorialConsultas";

export default async function ConsultasPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // 1. Traemos los datos de la base de datos (con los Decimales de Prisma)
  const consultasDb = await prisma.consulta.findMany({
    where: { paciente_id: pacienteId },
    orderBy: { fecha_consulta: "desc" },
    include: {
      tratamientos: true,
    },
  });

  // 2. ¡LA MAGIA AQUÍ! Convertimos los objetos Decimal a números normales de JavaScript
  const consultasLimpas = consultasDb.map((consulta) => ({
    ...consulta,
    peso: consulta.peso ? Number(consulta.peso) : null,
    talla: consulta.talla ? Number(consulta.talla) : null,
    temperatura: consulta.temperatura ? Number(consulta.temperatura) : null,
  }));

  return (
    <div className="pb-12 mt-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Historial Clínico</h2>
        <p className="text-sm text-slate-500">Registro histórico de consultas y tratamientos homeopáticos.</p>
      </div>
      
      {/* 3. Pasamos las consultas ya limpias al componente de cliente */}
      <HistorialConsultas consultas={consultasLimpas} />
    </div>
  );
}