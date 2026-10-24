"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearPaciente(formData: FormData) {
  const nombre_completo = formData.get("nombre_completo") as string;
  const fecha_nacimiento_str = formData.get("fecha_nacimiento") as string;
  const sexo = formData.get("sexo") as string;
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
    // Rellena con ceros a la izquierda, ej: "005"
    const nuevoFolio = `PAC-${nuevoNumero.toString().padStart(3, '0')}`;

    // 2. Guardar en la base de datos con el nuevo folio generado
    await prisma.paciente.create({
      data: { 
        folio: nuevoFolio,
        nombre_completo, 
        fecha_nacimiento: new Date(fecha_nacimiento_str), 
        sexo, 
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

// NUEVO: Ahora recibe un parámetro de búsqueda (query)
export async function obtenerPacientes(query?: string) {
  try {
    // Si hay texto, busca en nombre OR correo OR teléfono
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

// NUEVO: Obtener un solo paciente por su ID
export async function obtenerPacientePorId(id: string) {
  try {
    return await prisma.paciente.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error al obtener paciente:", error);
    return null;
  }
}

// NUEVO: Actualizar paciente existente
export async function actualizarPaciente(id: string, formData: FormData) {
  const nombre_completo = formData.get("nombre_completo") as string;
  const fecha_nacimiento_str = formData.get("fecha_nacimiento") as string;
  const sexo = formData.get("sexo") as string;
  const escolaridad = (formData.get("escolaridad") as string) || null;
  const ocupacion = (formData.get("ocupacion") as string) || null;
  const telefono = (formData.get("telefono") as string) || null;
  const correo_electronico = (formData.get("correo_electronico") as string) || null;

  if (!nombre_completo || !fecha_nacimiento_str || !sexo) {
    return { success: false, error: "Campos obligatorios incompletos" };
  }

  try {
    await prisma.paciente.update({
      where: { id },
      data: {
        nombre_completo,
        fecha_nacimiento: new Date(fecha_nacimiento_str),
        sexo,
        escolaridad,
        ocupacion,
        telefono,
        correo_electronico,
      },
    });
    
    revalidatePath("/pacientes");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar:", error);
    return { success: false, error: "No se pudo actualizar" };
  }
}

// NUEVO: Obtener paciente con sus relaciones para el Dashboard
export async function obtenerExpedientePaciente(id: string) {
  try {
    return await prisma.paciente.findUnique({
      where: { id },
      include: {
        historia_clinica: true,
        _count: {
          select: { consultas: true, archivos: true }
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener expediente:", error);
    return null;
  }
}

// NUEVO: Guardar o actualizar la Historia Clínica
export async function guardarHistoriaClinica(pacienteId: string, formData: FormData) {
  try {
    // 1. Extraer y formatear los datos del formulario
    const datosFormulario = {
      ahf: (formData.get("ahf") as string) || null,
      apnp: (formData.get("apnp") as string) || null,
      app: (formData.get("app") as string) || null,
      diagnostico_psiquiatrico: (formData.get("diagnostico_psiquiatrico") as string) || null, 
      enfermedades_venereas: (formData.get("enfermedades_venereas") as string) || null,       

      
      // Datos Gineco-obstétricos (pueden venir vacíos si es hombre o niña)
      menarca: formData.get("menarca") ? parseInt(formData.get("menarca") as string) : null,
      ritmo_menstrual: (formData.get("ritmo_menstrual") as string) || null,
      fum: formData.get("fum") ? new Date(formData.get("fum") as string) : null,
      gestas: formData.get("gestas") ? parseInt(formData.get("gestas") as string) : 0,
      partos: formData.get("partos") ? parseInt(formData.get("partos") as string) : 0,
      cesareas: formData.get("cesareas") ? parseInt(formData.get("cesareas") as string) : 0,
      abortos: formData.get("abortos") ? parseInt(formData.get("abortos") as string) : 0,
      metodo_anticonceptivo: (formData.get("metodo_anticonceptivo") as string) || null,

      // Datos Pediátricos
      tipo_nacimiento: (formData.get("tipo_nacimiento") as string) || null,
      apgar: (formData.get("apgar") as string) || null,
      peso_nacer: formData.get("peso_nacer") ? parseFloat(formData.get("peso_nacer") as string) : null,
      talla_nacer: formData.get("talla_nacer") ? parseFloat(formData.get("talla_nacer") as string) : null,
      lactancia: (formData.get("lactancia") as string) || null,
      desarrollo_psicomotor: (formData.get("desarrollo_psicomotor") as string) || null,
      vacunas: (formData.get("vacunas") as string) || null,
    };

    // 2. Guardar en Base de Datos (Upsert = Update o Insert)
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