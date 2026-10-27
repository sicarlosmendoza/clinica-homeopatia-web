import prisma from "@/lib/prisma";
import FormularioEditarPaciente from "./FormularioEditarPaciente";

export const instant = false;



export default async function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // Traemos los datos actuales del paciente
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId }
  });

  if (!paciente) {
    return <div>Paciente no encontrado</div>;
  }

  return (
    
    <div className="pb-12 mt-4 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Datos Generales</h2>
        <p className="text-sm text-slate-500">Modifica la información personal, de contacto y demográfica del paciente.</p>
      </div>
      
      {/* Imprimimos el formulario y le pasamos los datos del paciente */}
      <FormularioEditarPaciente paciente={paciente} />
    </div>
  );
}