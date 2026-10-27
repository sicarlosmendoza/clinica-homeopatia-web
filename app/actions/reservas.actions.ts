"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface DatosReserva {
  sede_id: string;
  medico_id: string;
  fecha_iso: string;
  hora: string;
  nombre_paciente: string;
  es_tercero: boolean;
  nombre_tutor?: string;
  telefono: string;
  correo: string;
  motivo?: string;
  honeypot?: string; // Campo trampa invisible
}

export async function crearReservaPublica(datos: DatosReserva) {
  try {
    // 1. FILTRO ANTI-BOTS (Honeypot)
    // Si el bot rellenó el campo oculto, detenemos el proceso inmediatamente
    if (datos.honeypot && datos.honeypot.trim() !== "") {
      return { success: false, error: "Solicitud inválida." };
    }

    // 2. Formatear la fecha y hora de la cita
    const fechaHoraLocal = new Date(`${datos.fecha_iso}T${datos.hora}:00`);

    // 3. Validar colisión de horario
    const citaExistente = await prisma.cita.findFirst({
      where: {
        medico_id: datos.medico_id,
        fecha_cita: fechaHoraLocal,
        estado: { not: "Cancelada" }
      }
    });

    if (citaExistente) {
      return { 
        success: false, 
        error: "Lo sentimos, este horario acaba de ser ocupado. Por favor elige otro." 
      };
    }

    // 4. LÓGICA DE PACIENTES (Diferenciando Titular vs Menor/Tercero)
    let paciente = null;

    if (datos.es_tercero) {
      // Si es un menor o familiar, buscamos si ya existe con ese nombre vinculado al teléfono/correo del tutor
      paciente = await prisma.paciente.findFirst({
        where: {
          nombre_completo: { equals: datos.nombre_paciente.trim(), mode: "insensitive" },
          OR: [
            { correo_electronico: datos.correo.trim() },
            { telefono: datos.telefono.trim() }
          ]
        }
      });
    } else {
      // Si agenda para sí mismo, buscamos por correo o teléfono
      paciente = await prisma.paciente.findFirst({
        where: {
          OR: [
            { correo_electronico: datos.correo.trim() },
            { telefono: datos.telefono.trim() }
          ]
        }
      });
    }

    // Si el paciente no existe, creamos su ficha exprés con Folio consecutivo
    if (!paciente) {
      const ultimoPaciente = await prisma.paciente.findFirst({
        orderBy: { fecha_registro: 'desc' },
        select: { folio: true }
      });
      
      let nuevoNumero = 1;
      if (ultimoPaciente && ultimoPaciente.folio.startsWith('PAC-')) {
        const numeroAnterior = parseInt(ultimoPaciente.folio.replace('PAC-', ''), 10);
        if (!isNaN(numeroAnterior)) nuevoNumero = numeroAnterior + 1;
      }
      const nuevoFolio = `PAC-${nuevoNumero.toString().padStart(3, '0')}`;

      paciente = await prisma.paciente.create({
        data: {
          folio: nuevoFolio,
          nombre_completo: datos.nombre_paciente.trim(),
          telefono: datos.telefono.trim(),
          correo_electronico: datos.correo.trim(),
          fecha_nacimiento: new Date("1900-01-01"),
          sexo: "Por definir", 
        }
      });
    }

    // Detalle de notas: si es un tercero, se anota quién agendó
    const motivoCompleto = datos.es_tercero && datos.nombre_tutor
      ? `[Tutor/Responsable: ${datos.nombre_tutor.trim()}] ${datos.motivo || ""}`.trim()
      : (datos.motivo || "");

    // 5. Crear la cita
    await prisma.cita.create({
      data: {
        paciente_id: paciente.id,
        nombre_paciente: datos.nombre_paciente.trim(),
        telefono: datos.telefono.trim(),
        correo: datos.correo.trim(),
        medico_id: datos.medico_id,
        sede_id: datos.sede_id,
        fecha_cita: fechaHoraLocal,
        motivo: motivoCompleto,
        estado: "Programada"
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/citas");
    return { success: true };

  } catch (error) {
    console.error("Error al crear reserva:", error);
    return { 
      success: false, 
      error: "Hubo un problema al procesar la cita. Intenta nuevamente." 
    };
  }
}