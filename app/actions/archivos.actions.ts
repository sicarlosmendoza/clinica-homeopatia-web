"use server";

import prisma from "@/lib/prisma"; // Asegúrate de que esta ruta apunte a tu cliente de Prisma
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function subirArchivoPaciente(pacienteId: string, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;

    if (!file || file.size === 0) {
      return { success: false, error: "No se seleccionó ningún archivo" };
    }

    // 1. Subir a Vercel Blob
    // Le agregamos un timestamp (Date.now) para que nunca haya nombres duplicados
    const blob = await put(`pacientes/${pacienteId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // 2. Determinar el tipo (PDF o Imagen)
    let tipo = "OTRO";
    if (file.type.includes("pdf")) tipo = "PDF";
    else if (file.type.startsWith("image/")) tipo = "IMAGEN";

    // 3. Guardar en la base de datos (consulta_id queda nulo)
    await prisma.archivo.create({
      data: {
        paciente_id: pacienteId,
        nombre: nombre || file.name,
        descripcion: descripcion || null,
        url: blob.url,
        tipo,
        origen: "HISTORIA_INICIAL",
        consulta_id: null,
      },
    });

    // 4. Refrescar la página para que aparezca al instante
    revalidatePath(`/pacientes/${pacienteId}/historia`);
    revalidatePath(`/pacientes/${pacienteId}/archivos`);
    
    return { success: true };
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return { success: false, error: "Error al procesar el archivo" };
  }
}

export async function obtenerArchivosIniciales(pacienteId: string) {
  return await prisma.archivo.findMany({
    where: {
      paciente_id: pacienteId,
      origen: "HISTORIA_INICIAL",
    },
    orderBy: { creado_en: "desc" },
  });
}

export async function eliminarArchivo(archivoId: string, urlBlob: string, pacienteId: string) {
  try {
    await del(urlBlob); // Borra de Vercel Blob
    await prisma.archivo.delete({ where: { id: archivoId } }); // Borra de Neon
    
    revalidatePath(`/pacientes/${pacienteId}/historia`);
    revalidatePath(`/pacientes/${pacienteId}/archivos`);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    return { success: false };
  }
}