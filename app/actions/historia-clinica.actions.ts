"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function guardarHistoriaClinica(pacienteId: string, formData: FormData) {
  // Extraer valores numéricos (convertir texto a número si existen)
  const menarca = formData.get("menarca") ? parseInt(formData.get("menarca") as string) : null;
  const gestas = formData.get("gestas") ? parseInt(formData.get("gestas") as string) : 0;
  const partos = formData.get("partos") ? parseInt(formData.get("partos") as string) : 0;
  const cesareas = formData.get("cesareas") ? parseInt(formData.get("cesareas") as string) : 0;
  const abortos = formData.get("abortos") ? parseInt(formData.get("abortos") as string) : 0;
  
  const peso_nacer = formData.get("peso_nacer") ? parseFloat(formData.get("peso_nacer") as string) : null;
  const talla_nacer = formData.get("talla_nacer") ? parseFloat(formData.get("talla_nacer") as string) : null;
  
  // Procesar fecha de última menstruación
  const fumStr = formData.get("fum") as string;
  const fum = fumStr ? new Date(fumStr) : null;

  // Guardar o actualizar la historia clínica
  await prisma.historiaClinica.upsert({
    where: { paciente_id: pacienteId },
    update: {
      ahf: formData.get("ahf") as string,
      apnp: formData.get("apnp") as string,
      app: formData.get("app") as string,
      diagnostico_psiquiatrico: formData.get("diagnostico_psiquiatrico") as string,
      enfermedades_venereas: formData.get("enfermedades_venereas") as string,
      
      menarca,
      ritmo_menstrual: formData.get("ritmo_menstrual") as string,
      fum,
      gestas, partos, cesareas, abortos,
      metodo_anticonceptivo: formData.get("metodo_anticonceptivo") as string,
      
      tipo_nacimiento: formData.get("tipo_nacimiento") as string,
      apgar: formData.get("apgar") as string,
      peso_nacer,
      talla_nacer,
      lactancia: formData.get("lactancia") as string,
      desarrollo_psicomotor: formData.get("desarrollo_psicomotor") as string,
      vacunas: formData.get("vacunas") as string,
    },
    create: {
      paciente_id: pacienteId,
      ahf: formData.get("ahf") as string,
      apnp: formData.get("apnp") as string,
      app: formData.get("app") as string,
      diagnostico_psiquiatrico: formData.get("diagnostico_psiquiatrico") as string,
      enfermedades_venereas: formData.get("enfermedades_venereas") as string,
      
      menarca,
      ritmo_menstrual: formData.get("ritmo_menstrual") as string,
      fum,
      gestas, partos, cesareas, abortos,
      metodo_anticonceptivo: formData.get("metodo_anticonceptivo") as string,
      
      tipo_nacimiento: formData.get("tipo_nacimiento") as string,
      apgar: formData.get("apgar") as string,
      peso_nacer,
      talla_nacer,
      lactancia: formData.get("lactancia") as string,
      desarrollo_psicomotor: formData.get("desarrollo_psicomotor") as string,
      vacunas: formData.get("vacunas") as string,
    },
  });

  // Refrescar la página para mostrar los datos guardados
  revalidatePath(`/pacientes/${pacienteId}/historia`);
  return { success: true };
}