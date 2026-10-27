"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface GuardarConsultaParams {
  pacienteId: string;
  citaId?: string | null;
  medico_id?: string;
  motivo: string;
  peso?: number | null;
  talla?: number | null;
  tension_arterial?: string;
  narrativa_clinica?: string;
  mentales?: string;
  generales?: string;
  particulares?: string;
  medicamento?: string;
  potencia?: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string; // <-- Agregamos duración aquí
}




export async function guardarNuevaConsulta(datos: GuardarConsultaParams) {
  try {
    const ultimaConsulta = await prisma.consulta.findFirst({
      orderBy: { folio_consulta: "desc" },
      select: { folio_consulta: true },
    });

    let nuevoNumero = 1;
    if (ultimaConsulta?.folio_consulta?.startsWith("CON-")) {
      const num = parseInt(ultimaConsulta.folio_consulta.replace("CON-", ""), 10);
      if (!isNaN(num)) nuevoNumero = num + 1;
    }
    const nuevoFolio = `CON-${nuevoNumero.toString().padStart(5, "0")}`;

    if (datos.citaId) {
      await prisma.cita.update({
        where: { id: datos.citaId },
        data: { estado: "Completada" },
      });
    }

    const totalConsultasPaciente = await prisma.consulta.count({
      where: { paciente_id: datos.pacienteId }
    });
    const numeroConsulta = totalConsultasPaciente + 1;

// BUSCAMOS QUÉ MÉDICO ATENDIÓ
    
    let medicoAsignadoId = datos.medico_id || null;

    if (!medicoAsignadoId && datos.citaId) {
      const cita = await prisma.cita.findUnique({ where: { id: datos.citaId } });
      if (cita && cita.medico_id) medicoAsignadoId = cita.medico_id;
    }


    // Si no había cita o la cita no tenía médico, asignamos el primer médico activo por defecto
    if (!medicoAsignadoId) {
      const medicoDefault = await prisma.medico.findFirst({ where: { activo: true } });
      if (medicoDefault) medicoAsignadoId = medicoDefault.id;
    }


    const consulta = await prisma.consulta.create({
      data: {
        folio_consulta: nuevoFolio,
        medico_id: medicoAsignadoId,
        numero_consulta: numeroConsulta,
        paciente_id: datos.pacienteId,
        origen: datos.citaId ? "WEB" : "PRESENCIAL",
        motivo_consulta: datos.motivo.trim(),
        peso: datos.peso,
        talla: datos.talla,
        presion_arterial: datos.tension_arterial,
        caso_clinico: datos.narrativa_clinica?.trim() || null,
        sintomas_mentales: datos.mentales?.trim() || null,
        sintomas_generales: datos.generales?.trim() || null,
        sintomas_particulares: datos.particulares?.trim() || null,
        
        tratamientos: {
          create: {
            medicamento: datos.medicamento?.trim() || "Sin especificar",
            escala_potencia: datos.potencia?.trim() || null,
            cantidad_sucusion: datos.dosis?.trim() || null,
            frecuencia: datos.frecuencia?.trim() || null,
            duracion: datos.duracion?.trim() || null, // <-- Ahora sí lo mapeamos a Prisma
          }
        }
      },
    });

    revalidatePath("/citas");
    revalidatePath(`/pacientes/${datos.pacienteId}`);
    revalidatePath(`/pacientes/${datos.pacienteId}/consultas`);

    return { success: true, consultaId: consulta.id };
  } catch (error) {
    console.error("Error al guardar la consulta:", error);
    return { success: false, error: "No se pudo registrar la consulta médica." };
  }
}