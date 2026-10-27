"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearPaciente(formData: FormData) {
  const nombre_completo = formData.get("nombre_completo") as string;
  const fecha_nacimiento_str = formData.get("fecha_nacimiento") as string;
  const sexo = (formData.get("sexo") as string) || null;
  const estado_civil = (formData.get("estado_civil") as string) || null;
  const escolaridad = (formData.get("escolaridad") as string) || null;
  const ocupacion = (formData.get("ocupacion") as string) || null;
  const telefono = (formData.get("telefono") as string) || null;
  const correo_electronico = (formData.get("correo_electronico") as string) || null;

  if (!nombre_completo || !fecha_nacimiento_str || !sexo) {
    return { success: false, error: "Campos obligatorios incompletos" };
  }

  try {
    // 1. Calcular el nuevo folio (PAC-001, PAC-002, etc.)
    const ultimoPaciente = await prisma.paciente.findFirst({
      orderBy: { fecha_registro: 'desc' },
      select: { folio: true }
    });

    let nuevoNumero = 1;
    if (ultimoPaciente && ultimoPaciente.folio.startsWith('PAC-')) {
      const numeroAnterior = parseInt(ultimoPaciente.folio.replace('PAC-', ''), 10);
      if (!isNaN(numeroAnterior)) {
        nuevoNumero = numeroAnterior + 1;
      }
    }
    const nuevoFolio = `PAC-${nuevoNumero.toString().padStart(3, '0')}`;

    // 2. Guardar en la base de datos con estado_civil incluido
    await prisma.paciente.create({
      data: { 
        folio: nuevoFolio,
        nombre_completo, 
        fecha_nacimiento: new Date(fecha_nacimiento_str), 
        sexo, 
        estado_civil,
        escolaridad,
        ocupacion, 
        telefono, 
        correo_electronico 
      },
    });

    revalidatePath("/pacientes");
    return { success: true };
  } catch (error) {
    console.error("Error al registrar:", error);
    return { success: false, error: "No se pudo guardar" };
  }
}

export async function obtenerPacientes(query?: string) {
  try {
    const whereClause = query ? {
      OR: [
        { nombre_completo: { contains: query, mode: "insensitive" as const } },
        { correo_electronico: { contains: query, mode: "insensitive" as const } },
        { telefono: { contains: query, mode: "insensitive" as const } },
      ]
    } : {};

    return await prisma.paciente.findMany({
      where: whereClause,
      orderBy: { fecha_registro: "desc" },
    });
  } catch (error) {
    return [];
  }
}

export async function obtenerPacientePorId(id: string) {
  try {
    return await prisma.paciente.findUnique({
      where: { id },
      include: {
        historia_clinica: true,
      },
    });
  } catch (error) {
    console.error("Error al obtener paciente:", error);
    return null;
  }
}

// Actualizar paciente existente (acepta ID directo o desde el FormData)
export async function actualizarPaciente(idOFormData: string | FormData, posibleFormData?: FormData) {
  let id: string;
  let formData: FormData;

  if (typeof idOFormData === "string") {
    id = idOFormData;
    formData = posibleFormData as FormData;
  } else {
    formData = idOFormData;
    id = formData.get("id") as string;
  }

  const nombre_completo = formData.get("nombre_completo") as string;
  const fecha_nacimiento_str = formData.get("fecha_nacimiento") as string;
  const sexo = (formData.get("sexo") as string) || null;
  const estado_civil = (formData.get("estado_civil") as string) || null;
  const escolaridad = (formData.get("escolaridad") as string) || null;
  const ocupacion = (formData.get("ocupacion") as string) || null;
  const telefono = (formData.get("telefono") as string) || null;
  const correo_electronico = (formData.get("correo_electronico") as string) || null;

  if (!id || !nombre_completo || !fecha_nacimiento_str) {
    return { success: false, error: "Campos obligatorios incompletos" };
  }

  try {
    await prisma.paciente.update({
      where: { id },
      data: {
        nombre_completo,
        fecha_nacimiento: new Date(fecha_nacimiento_str),
        sexo,
        estado_civil,
        escolaridad,
        ocupacion,
        telefono,
        correo_electronico,
      },
    });
    
    // Revalidación completa de rutas para limpiar la caché de Next.js
    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${id}`);
    revalidatePath(`/pacientes/${id}/editar`);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar:", error);
    return { success: false, error: "No se pudo actualizar" };
  }
}

export async function obtenerExpedientePaciente(id: string) {
  try {
    return await prisma.paciente.findUnique({
      where: { id },
      include: {
        historia_clinica: true,
        consultas: {
          orderBy: { fecha_consulta: "desc" },
        },
        archivos: {
          orderBy: { creado_en: "desc" },
        },
        _count: {
          select: {
            consultas: true,
            archivos: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener expediente:", error);
    return null;
  }
}

export async function guardarHistoriaClinica(pacienteId: string, formData: FormData) {
  try {
    const datosFormulario = {
      ahf: (formData.get("ahf") as string) || null,
      apnp: (formData.get("apnp") as string) || null,
      app: (formData.get("app") as string) || null,
      diagnostico_psiquiatrico: (formData.get("diagnostico_psiquiatrico") as string) || null, 
      enfermedades_venereas: (formData.get("enfermedades_venereas") as string) || null,       

      menarca: formData.get("menarca") ? parseInt(formData.get("menarca") as string) : null,
      ritmo_menstrual: (formData.get("ritmo_menstrual") as string) || null,
      fum: formData.get("fum") ? new Date(formData.get("fum") as string) : null,
      gestas: formData.get("gestas") ? parseInt(formData.get("gestas") as string) : 0,
      partos: formData.get("partos") ? parseInt(formData.get("partos") as string) : 0,
      cesareas: formData.get("cesareas") ? parseInt(formData.get("cesareas") as string) : 0,
      abortos: formData.get("abortos") ? parseInt(formData.get("abortos") as string) : 0,
      metodo_anticonceptivo: (formData.get("metodo_anticonceptivo") as string) || null,

      tipo_nacimiento: (formData.get("tipo_nacimiento") as string) || null,
      apgar: (formData.get("apgar") as string) || null,
      peso_nacer: formData.get("peso_nacer") ? parseFloat(formData.get("peso_nacer") as string) : null,
      talla_nacer: formData.get("talla_nacer") ? parseFloat(formData.get("talla_nacer") as string) : null,
      lactancia: (formData.get("lactancia") as string) || null,
      desarrollo_psicomotor: (formData.get("desarrollo_psicomotor") as string) || null,
      vacunas: (formData.get("vacunas") as string) || null,
    };

    await prisma.historiaClinica.upsert({
      where: { paciente_id: pacienteId },
      update: datosFormulario,
      create: {
        paciente_id: pacienteId,
        ...datosFormulario
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error guardando historia clínica:", error);
    return { success: false };
  }
}

export async function actualizarFotoPaciente(id: string, fotoBase64: string) {
  try {
    await prisma.paciente.update({
      where: { id },
      data: { foto: fotoBase64 },
    });
    revalidatePath(`/pacientes/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al guardar foto:", error);
    return { success: false };
  }
}