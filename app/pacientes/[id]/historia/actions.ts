"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function guardarHistoriaClinica(pacienteId: string, datos: any) {
  try {
    const historia = await prisma.historiaClinica.upsert({
      where: { paciente_id: pacienteId },
      update: {
        ahf: datos.ahf,
        apnp: datos.apnp,
        app: datos.app,
        diagnostico_psiquiatrico: datos.diagnostico_psiquiatrico,
        enfermedades_venereas: datos.enfermedades_venereas,
        sensibilidad_termica: datos.sensibilidad_termica,
        sed: datos.sed,
        deseos_aversiones: datos.deseos_aversiones,

        menarca: datos.menarca ? parseInt(datos.menarca) : null,
        ritmo_menstrual: datos.ritmo_menstrual,
        fum: datos.fum ? new Date(datos.fum) : null,
        gestas: datos.gestas ? parseInt(datos.gestas) : 0,
        partos: datos.partos ? parseInt(datos.partos) : 0,
        cesareas: datos.cesareas ? parseInt(datos.cesareas) : 0,
        abortos: datos.abortos ? parseInt(datos.abortos) : 0,
        metodo_anticonceptivo: datos.metodo_anticonceptivo,

        tipo_nacimiento: datos.tipo_nacimiento,
        apgar: datos.apgar,
        peso_nacer: datos.peso_nacer ? parseFloat(datos.peso_nacer) : null,
        talla_nacer: datos.talla_nacer ? parseFloat(datos.talla_nacer) : null,
        lactancia: datos.lactancia,
        desarrollo_psicomotor: datos.desarrollo_psicomotor,
        vacunas: datos.vacunas,

        edad_caminar: datos.edad_caminar,
        desarrollo_lenguaje: datos.desarrollo_lenguaje,
        control_esfinteres: datos.control_esfinteres,
        patron_sueno: datos.patron_sueno,
        comportamiento: datos.comportamiento,
        miedos_especificos: datos.miedos_especificos,
        rendimiento_escolar: datos.rendimiento_escolar,

        tabaquismo: datos.tabaquismo,
        alcoholismo: datos.alcoholismo,
        cafeina_estimulantes: datos.cafeina_estimulantes,
        alimentacion: datos.alimentacion,
        actividad_fisica: datos.actividad_fisica,
        estado_animo: datos.estado_animo,
        nivel_estres: datos.nivel_estres,
      },
      create: {
        paciente_id: pacienteId,
        ...datos,
        menarca: datos.menarca ? parseInt(datos.menarca) : null,
        fum: datos.fum ? new Date(datos.fum) : null,
        gestas: datos.gestas ? parseInt(datos.gestas) : 0,
        partos: datos.partos ? parseInt(datos.partos) : 0,
        cesareas: datos.cesareas ? parseInt(datos.cesareas) : 0,
        abortos: datos.abortos ? parseInt(datos.abortos) : 0,
        peso_nacer: datos.peso_nacer ? parseFloat(datos.peso_nacer) : null,
        talla_nacer: datos.talla_nacer ? parseFloat(datos.talla_nacer) : null,
      }
    });

    revalidatePath(`/pacientes/${pacienteId}`);
    revalidatePath(`/pacientes/${pacienteId}/historia`);
    return { success: true, historia };
  } catch (error) {
    console.error("Error al guardar historia:", error);
    return { success: false, error: "Ocurrió un error al guardar la historia clínica." };
  }
}