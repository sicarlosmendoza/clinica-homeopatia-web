import prisma from "@/lib/prisma";
import HistorialConsultas from "./HistorialConsultas";

// 👇 Añadimos esta línea para permitir que la ruta bloquee temporalmente 
// la carga mientras extrae los datos frescos de la BD.
export const instant = false;

export default async function ConsultasPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // Extraemos las consultas
  const consultasCrudas = await prisma.consulta.findMany({
    where: { paciente_id: pacienteId },
    orderBy: { fecha_consulta: "desc" },
    include: {
      tratamientos: true,
    },
  });

  // Convertimos TODOS los tipos Decimal de Prisma a números simples
  const consultas = consultasCrudas.map(c => ({
    ...c,
    peso: c.peso ? Number(c.peso) : null,
    talla: c.talla ? Number(c.talla) : null,
    temperatura: c.temperatura ? Number(c.temperatura) : null,
    saturacion_oxigeno: c.saturacion_oxigeno ? Number(c.saturacion_oxigeno) : null,
  }));

  return (
    <div className="pb-12 mt-4 animate-in fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Historial Clínico</h2>
        <p className="text-sm text-slate-500">Registro histórico de las consultas y tratamientos homeopáticos.</p>
      </div>

      {/* Renderizamos el componente cliente interactivo */}
      <HistorialConsultas consultas={consultas} />
    </div>
  );
}