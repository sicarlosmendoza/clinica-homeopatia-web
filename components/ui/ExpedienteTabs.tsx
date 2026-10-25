"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ExpedienteTabsProps {
  pacienteId: string;
  totalConsultas: number;
  totalArchivos: number;
}

export default function ExpedienteTabs({
  pacienteId,
  totalConsultas,
  totalArchivos,
}: ExpedienteTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      nombre: "Datos Generales",
      href: `/pacientes/${pacienteId}/editar`,
      activo: pathname === `/pacientes/${pacienteId}/editar`,
    },
    {
      nombre: "Resumen Clínico",
      href: `/pacientes/${pacienteId}`,
      activo: pathname === `/pacientes/${pacienteId}`,
    },
    {
      nombre: "Historia Clínica",
      href: `/pacientes/${pacienteId}/historia`,
      activo: pathname.startsWith(`/pacientes/${pacienteId}/historia`),
    },
    {
      nombre: `Consultas (${totalConsultas})`,
      href: `/pacientes/${pacienteId}/consultas`,
      activo: pathname.startsWith(`/pacientes/${pacienteId}/consultas`),
    },
    {
      nombre: `Archivos (${totalArchivos})`,
      href: `/pacientes/${pacienteId}/archivos`,
      activo: pathname.startsWith(`/pacientes/${pacienteId}/archivos`),
    },
  ];

  return (
    <nav className="flex space-x-1 border-b border-purple-100 overflow-x-auto pb-px">
      {tabs.map((tab) => (
        <Link
          key={tab.nombre}
          href={tab.href}
          className={`px-4 py-2.5 text-sm whitespace-nowrap transition-all duration-150 ${
            tab.activo
              ? "font-semibold border-b-2 border-violet-600 text-violet-700 bg-violet-50/40 rounded-t-lg"
              : "font-medium border-b-2 border-transparent text-slate-500 hover:text-violet-700 hover:border-violet-300"
          }`}
        >
          {tab.nombre}
        </Link>
      ))}
    </nav>
  );
}