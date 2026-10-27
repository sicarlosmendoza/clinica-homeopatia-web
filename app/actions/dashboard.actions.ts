"use server";

import prisma from "@/lib/prisma";

export async function obtenerEstadisticasDashboard() {
  const [totalPacientes, totalConsultas, sedesActivas, medicosActivos] = await Promise.all([
    // Total de pacientes
    prisma.paciente.count(),
    
    // Total de consultas realizadas
    prisma.consulta.count(),
    
    // Total de sedes activas
    prisma.sede.count({ where: { activo: true } }),

    // Total de médicos activos
    prisma.medico.count({ where: { activo: true } })
  ]);

  return {
    totalPacientes,
    totalConsultas,
    sedesActivas,
    medicosActivos
  };
}