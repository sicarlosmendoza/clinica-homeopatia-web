"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function guardarNuevaConsulta(pacienteId: string, formData: FormData) {
  const totalConsultasGlobal = await prisma.consulta.count();
  const folio_consulta = `CON-${(totalConsultasGlobal + 1).toString().padStart(5, "0")}`; 
  
  const consultasDelPaciente = await prisma.consulta.count({ where: { paciente_id: pacienteId } });
  const numero_consulta = consultasDelPaciente + 1;

  const peso = formData.get("peso") ? parseFloat(formData.get("peso") as string) : null;
  const talla = formData.get("talla") ? parseFloat(formData.get("talla") as string) : null;
  const fc = formData.get("frecuencia_cardiaca") ? parseInt(formData.get("frecuencia_cardiaca") as string) : null;
  const fr = formData.get("frecuencia_resp") ? parseInt(formData.get("frecuencia_resp") as string) : null;
  const temp = formData.get("temperatura") ? parseFloat(formData.get("temperatura") as string) : null;
  const sat = formData.get("saturacion_oxigeno") ? parseInt(formData.get("saturacion_oxigeno") as string) : null;

  // Extraer la lista de tratamientos (convertida desde JSON)
  const tratamientosJSON = formData.get("tratamientos_json") as string;
  const tratamientos = tratamientosJSON ? JSON.parse(tratamientosJSON) : [];

  await prisma.consulta.create({
    data: {
      paciente_id: pacienteId,
      folio_consulta,
      numero_consulta,
      origen: formData.get("origen") as string,
      
      peso, talla,
      presion_arterial: formData.get("presion_arterial") as string,
      frecuencia_cardiaca: fc,
      frecuencia_resp: fr,
      temperatura: temp,
      saturacion_oxigeno: sat,

      motivo_consulta: formData.get("motivo_consulta") as string,
      desde_cuando: formData.get("desde_cuando") as string,
      caso_clinico: formData.get("caso_clinico") as string,
      sintomas_mentales: formData.get("sintomas_mentales") as string,
      sintomas_generales: formData.get("sintomas_generales") as string,
      sintomas_particulares: formData.get("sintomas_particulares") as string,

      tipo_paciente: formData.get("tipo_paciente") as string,
      miasma_predisponente: formData.get("miasma_predisponente") as string,
      miasma_secundario: formData.get("miasma_secundario") as string,
      tipo_caso: formData.get("tipo_caso") as string,
      nivel_salud: formData.get("nivel_salud") as string,
      intencion: formData.get("intencion") as string,
      sugerencias: formData.get("sugerencias") as string,

      // ¡AQUÍ SE CREAN LOS MEDICAMENTOS DINÁMICOS!
      tratamientos: {
        create: tratamientos.map((t: any) => ({
          medicamento: t.medicamento,
          escala_potencia: t.escala_potencia,
          cantidad_sucusion: t.cantidad_sucusion,
          frecuencia: t.frecuencia,
          duracion: t.duracion,
        }))
      }
    },
  });

  revalidatePath(`/pacientes/${pacienteId}`);
  redirect(`/pacientes/${pacienteId}`);
}