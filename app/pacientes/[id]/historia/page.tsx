import prisma from "@/lib/prisma";
import FormularioHistoriaClinica from "./FormularioHistoriaClinica";

// Evitamos el error de carga estática
export const instant = false;

export default async function HistoriaClinicaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // Traemos al paciente y su historia clínica si ya existe
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
    include: { historia_clinica: true }
  });

  if (!paciente) {
    return <div>Paciente no encontrado</div>;
  }

  // Calculamos la edad exacta para decidir si mostramos la sección de pediatría
  const hoy = new Date();
  const fechaNac = new Date(paciente.fecha_nacimiento);
  let edadAnios = hoy.getFullYear() - fechaNac.getFullYear();
  if (hoy.getMonth() < fechaNac.getMonth() || (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate())) {
    edadAnios--;
  }

  return (
    <div className="pb-12 mt-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Historia Clínica de Apertura</h2>
        <p className="text-sm text-slate-500">Antecedentes generales, familiares y de nacimiento del paciente.</p>
      </div>
      
      {/* Pasamos los datos calculados al formulario inteligente */}
      <FormularioHistoriaClinica 
        pacienteId={paciente.id} 
        historia={paciente.historia_clinica} 
        sexo={paciente.sexo} 
        edadAnios={edadAnios} 
      />
    </div>
  );
}



