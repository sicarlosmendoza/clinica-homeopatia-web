"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BotonIniciarConsultaHeader({ pacienteId }: { pacienteId: string }) {
  const pathname = usePathname();
  const esNuevaConsulta = pathname.includes("/nueva-consulta");

  return (
    <div className="mt-4 md:mt-0 flex shrink-0 border-l pl-6 border-slate-100">
      {esNuevaConsulta ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 rounded-xl h-11 px-6 font-semibold cursor-not-allowed select-none opacity-80"
        >
          En consulta...
        </button>
      ) : (
        <Link
          href={`/pacientes/${pacienteId}/nueva-consulta`}
          className="inline-flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-200 rounded-xl h-11 px-6 font-semibold transition-all hover:-translate-y-0.5"
        >
          + Iniciar Consulta
        </Link>
      )}
    </div>
  );
}