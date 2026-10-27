import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioEditarSede from "./FormularioEditarSede";

export const instant = false;

export default async function EditarSedePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sedeId = resolvedParams.id;

  const sede = await prisma.sede.findUnique({
    where: { id: sedeId }
  });

  if (!sede) redirect("/catalogos/sedes");

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <Link href="/catalogos/sedes" className="text-sm font-bold text-slate-500 hover:text-slate-800">
        ← Regresar al Catálogo
      </Link>
      
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-800 mb-6">Editar Sede: {sede.nombre}</h1>
        
        {/* Aquí insertamos el componente que maneja la edición y le pasamos los datos */}
        <FormularioEditarSede sede={sede} />
      </div>
    </div>
  );
}