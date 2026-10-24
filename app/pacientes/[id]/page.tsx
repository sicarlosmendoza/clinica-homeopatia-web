import { obtenerExpedientePaciente } from "../../actions/pacientes.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const instant = false;

export default async function ResumenExpedientePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const paciente = await obtenerExpedientePaciente(resolvedParams.id);

  if (!paciente) return null;

  const tieneHistoria = paciente.historia_clinica !== null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Tarjeta de Historia Clínica */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-start justify-center min-h-[200px] text-center">
        {tieneHistoria ? (
          <div className="w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">✅ Historia Clínica Completada</h3>
            <p className="text-slate-500 text-sm mb-4">
              Última actualización: {paciente.historia_clinica?.fecha_actualizacion.toLocaleDateString()}
            </p>
            <Link href={`/pacientes/${paciente.id}/historia`}>
              <Button variant="outline" className="w-full">Ver y Editar Historia</Button>
            </Link>
          </div>
        ) : (
          <div className="w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">⚠️ Historia Clínica Pendiente</h3>
            <p className="text-slate-500 text-sm mb-4">Aún no se ha realizado el interrogatorio de apertura para este expediente.</p>
            <Link href={`/pacientes/${paciente.id}/historia`}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Comenzar Historia Clínica</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tarjeta de Acciones Rápidas */}
      <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 min-h-[200px] flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Acciones Clínicas</h3>
        <div className="space-y-3">
          <Link href={`/pacientes/${paciente.id}/consultas/nueva`} className="block">
            <Button className="w-full bg-slate-900 hover:bg-slate-800">🩺 Iniciar Nueva Consulta</Button>
          </Link>
          <Link href={`/pacientes/${paciente.id}/archivos`} className="block">
            <Button variant="outline" className="w-full">🖼️ Subir Fotografía o Laboratorio</Button>
          </Link>
        </div>
      </div>

    </div>
  );
}