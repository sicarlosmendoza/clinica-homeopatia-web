"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob"; // NUEVO: Importar Vercel Blob

export async function inicializarSedes() {
  const contador = await prisma.sede.count();
  if (contador > 0) return true;

  console.log("Inyectando sedes iniciales...");
  await prisma.sede.createMany({
    data: [
      { nombre: "Consultorio Providencia", direccion: "Av. Providencia 1234, Guadalajara, Jal.", telefono: "33 1234 5678", color: "blue" },
      { nombre: "Consultorio Zapopan Centro", direccion: "Calle Hidalgo 456, Zapopan, Jal.", telefono: "33 9876 5432", color: "purple" },
      { nombre: "Atención a Domicilio / Virtual", direccion: "ZMG (Previa Autorización)", telefono: "", color: "teal" }
    ]
  });
  return true;
}

export async function obtenerSedesActivas() {
  return await prisma.sede.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" }
  });
}

export async function obtenerTodasLasSedes() {
  return await prisma.sede.findMany({
    orderBy: { nombre: "asc" }
  });
}

export async function crearSede(formData: FormData) {
  const imagen = formData.get("imagen") as File | null;
  let imagenUrl = null;

  // Si el usuario subió una imagen, la guardamos en Vercel Blob
  if (imagen && imagen.size > 0) {
    const nombreOriginalLimpio = imagen.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const blob = await put(`sedes/${Date.now()}-${nombreOriginalLimpio}`, imagen, {
      access: 'public',
    });
    imagenUrl = blob.url;
  }

  await prisma.sede.create({
    data: {
      nombre: formData.get("nombre") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      color: formData.get("color") as string,
      descripcion: formData.get("descripcion") as string || null,
      link_maps: formData.get("link_maps") as string || null,
      imagen_url: imagenUrl,
      activo: true,
    }
  });
  
  revalidatePath("/catalogos/sedes");
  revalidatePath("/reservar");
  return { success: true };
}

export async function alternarEstadoSede(id: string, estadoActual: boolean) {
  await prisma.sede.update({
    where: { id },
    data: { activo: !estadoActual }
  });
  
  revalidatePath("/catalogos/sedes");
  revalidatePath("/reservar");
}

export async function actualizarSede(formData: FormData) {
  // CORRECCIÓN AQUÍ: Verificamos que el ID exista y sea string
  const id = formData.get("id");
  const imagen = formData.get("imagen") as File | null;
  
  if (typeof id !== "string") {
    console.error("No se recibió un ID válido para actualizar la sede.");
    return;
  }

  const datosActualizar: any = {
    nombre: formData.get("nombre") as string,
    direccion: formData.get("direccion") as string,
    telefono: formData.get("telefono") as string,
    color: formData.get("color") as string,
    descripcion: formData.get("descripcion") as string || null,
    link_maps: formData.get("link_maps") as string || null,
  };

  // Solo actualizamos la imagen si el usuario seleccionó una nueva
  if (imagen && imagen.size > 0) {
    const nombreOriginalLimpio = imagen.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const blob = await put(`sedes/${Date.now()}-${nombreOriginalLimpio}`, imagen, {
      access: 'public',
    });
    datosActualizar.imagen_url = blob.url;
  }

  await prisma.sede.update({
    where: { id: id },
    data: datosActualizar
  });
  
  revalidatePath("/catalogos/sedes");
  revalidatePath("/reservar");
}

export async function eliminarSede(id: string) {
  try {
    await prisma.sede.delete({ where: { id } });
    revalidatePath("/catalogos/sedes");
    revalidatePath("/reservar");
    return { success: true };
  } catch (error) {
    console.error("No se puede eliminar la sede porque ya tiene citas asignadas.");
    return { success: false };
  }
}

// ==========================================
// ACCIONES PARA MÉDICOS
// ==========================================

export async function obtenerTodosLosMedicos() {
  return await prisma.medico.findMany({
    orderBy: { nombre: "asc" }
  });
}

export async function crearMedico(formData: FormData) {
  try {
    const nombre = formData.get("nombre") as string;
    const especialidad = formData.get("especialidad") as string;
    const cedula = formData.get("cedula") as string; // <-- 1. RECIBIMOS LA CÉDULA

    if (!nombre) throw new Error("El nombre es obligatorio");

    await prisma.medico.create({
      data: {
        nombre,
        especialidad: especialidad || "Médico Homeópata",
        cedula: cedula || null, // <-- 2. LA GUARDAMOS EN LA BD
      },
    });
    
    revalidatePath("/catalogos/medicos");
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear médico:", error);
    return { success: false, error: error.message };
  }
}
  

export async function alternarEstadoMedico(id: string, estadoActual: boolean) {
  await prisma.medico.update({
    where: { id },
    data: { activo: !estadoActual }
  });
  
  revalidatePath("/catalogos/medicos");
}

export async function eliminarMedico(id: string) {
  try {
    await prisma.medico.delete({ where: { id } });
    revalidatePath("/catalogos/medicos");
    return { success: true };
  } catch (error) {
    console.error("No se puede eliminar el médico porque tiene horarios o citas.");
    return { success: false };
  }
}

// ==========================================
// ACCIONES PARA HORARIOS (LA MATRIZ)
// ==========================================

// ==========================================
// ACCIONES PARA HORARIOS (LA MATRIZ)
// ==========================================

export async function agregarHorario(formData: FormData) {
  try {
    const medico_id = formData.get("medico_id") as string;
    const sede_id = formData.get("sede_id") as string;
    const dia_semana = parseInt(formData.get("dia_semana") as string);
    const hora_inicio = formData.get("hora_inicio") as string;
    const hora_fin = formData.get("hora_fin") as string;

    console.log("Intentando guardar en Prisma:", { medico_id, sede_id, dia_semana, hora_inicio, hora_fin });

    await prisma.horarioMedico.create({
      data: {
        medico_id: medico_id,
        sede_id: sede_id,
        dia_semana: dia_semana,
        hora_inicio: hora_inicio,
        hora_fin: hora_fin,
        activo: true,
      }
    });
    
    console.log("¡Horario guardado con éxito en la base de datos!");
  } catch (error) {
    console.error("🔴 ERROR DE PRISMA AL GUARDAR EL HORARIO:", error);
  }
  
  revalidatePath("/catalogos/horarios");
  revalidatePath("/reservar");
}

export async function eliminarHorario(id: string) {
  try {
    await prisma.horarioMedico.delete({ where: { id } });
    revalidatePath("/catalogos/horarios");
    revalidatePath("/reservar");
  } catch (error) {
    console.error("🔴 ERROR AL ELIMINAR EL HORARIO:", error);
  }
}
