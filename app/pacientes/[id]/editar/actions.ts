"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function actualizarPaciente(pacienteId: string, formData: FormData) {
  // Ajustamos la fecha para evitar problemas de zona horaria
  const fechaLocal = formData.get("fecha_nacimiento") as string;
  const fechaNacimiento = new Date(fechaLocal + 'T12:00:00Z');

  await prisma.paciente.update({
    where: { id: pacienteId },
    data: {
      nombre_completo: formData.get("nombre_completo") as string,
      fecha_nacimiento: fechaNacimiento,
      sexo: formData.get("sexo") as string,
      telefono: formData.get("telefono") as string,
      correo_electronico: formData.get("correo_electronico") as string,
      estado_civil: formData.get("estado_civil") as string,
      ocupacion: formData.get("ocupacion") as string,
      escolaridad: formData.get("escolaridad") as string,
    }
  });

  // Refrescamos las pantallas para que los cambios se vean al instante
  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath(`/pacientes/${pacienteId}/editar`);
  
  return { success: true };
}