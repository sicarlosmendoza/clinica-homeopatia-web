import FormularioConsulta from "./FormularioConsulta";
import prisma from "@/lib/prisma";

// ¡ESTA ES LA LÍNEA QUE FALTABA PARA DESTRABAR LA NAVEGACIÓN!
export const instant = false;

export default async function NuevaConsultaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // Obtener la última talla registrada (si existe) para pre-llenarla
  const ultimaConsulta = await prisma.consulta.findFirst({
    where: { paciente_id: pacienteId },
    orderBy: { fecha_consulta: "desc" },
    select: { talla: true }
  });

  // Convertimos el Decimal a Número para que React no se queje
  const tallaPrevia = ultimaConsulta?.talla ? Number(ultimaConsulta.talla) : "";

  return (
    <div className="pb-12 mt-4 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Nueva Consulta Médica</h2>
        <p className="text-sm text-slate-500">Registre los signos vitales, la toma del caso y el tratamiento.</p>
      </div>
      
      {/* Pasamos el ID y la talla al formulario interactivo */}
      <FormularioConsulta pacienteId={pacienteId} tallaPrevia={tallaPrevia} />
    </div>
  );
}