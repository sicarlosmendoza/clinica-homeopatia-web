"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cambiarEstadoCita(
  citaId: string, 
  nuevoEstado: "Programada" | "Confirmada" | "Cancelada"
) {
  try {
    await prisma.cita.update({
      where: { id: citaId },
      data: { estado: nuevoEstado },
    });

    // Revalidamos ambas páginas en tiempo real
    revalidatePath("/citas");
    revalidatePath("/reservar"); // Si se cancela, se libera el horario para otros pacientes

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar estado de la cita:", error);
    return { success: false, error: "No se pudo actualizar el estado de la cita." };
  }
}