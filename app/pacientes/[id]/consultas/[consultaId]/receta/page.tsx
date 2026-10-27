import prisma from "@/lib/prisma";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import BotonImprimir from "./BotonImprimir";

export const instant = false;

export default async function RecetaImprimiblePage({ params }: { params: Promise<{ id: string, consultaId: string }> }) {
  const resolvedParams = await params;
  
  // Traemos los datos de la consulta, del paciente y el tratamiento
  const consulta = await prisma.consulta.findUnique({
    where: { id: resolvedParams.consultaId },
    include: {
      paciente: true,
      tratamientos: true,
      medico: true,
    }
  });

  if (!consulta) return <div className="p-12 text-center">Consulta no encontrada</div>;

  // Formateamos la fecha
  const fechaReceta = format(new Date(consulta.fecha_consulta), "dd 'de' MMMM, yyyy", { locale: es });
  
  // Calculamos la edad actual (aproximada para la receta)
  const fechaNac = new Date(consulta.paciente.fecha_nacimiento);
  const edad = new Date().getFullYear() - fechaNac.getFullYear();

  return (
    <div className="min-h-screen bg-slate-200 py-8 font-sans print:bg-white print:py-0">
      
      {/* Botones de acción (Se ocultan al imprimir gracias a print:hidden) */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-end gap-4 print:hidden">
        <BotonImprimir />
      </div>

      {/* EL LIENZO DE LA RECETA (Tamaño Carta/A4 aproximado) */}
      <div className="max-w-2xl mx-auto bg-white shadow-xl min-h-[800px] p-10 relative print:shadow-none print:p-0">
        
        {/* ENCABEZADO MEMBRETADO */}
        <div className="flex justify-between items-start border-b-2 border-purple-800 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo Clínica" width={90} height={90} className="mix-blend-multiply" />
            <div>
              <h1 className="text-xl font-black text-purple-900 tracking-tight">
                {consulta.medico?.nombre || "Dra. Arizai"}
              </h1>
              <p className="text-sm text-slate-500 font-semibold tracking-widest uppercase">
                {consulta.medico?.especialidad || "Médico Homeópata"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Cédula Profesional: {consulta.medico?.cedula || "En trámite"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{fechaReceta}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Folio: {consulta.folio_consulta}</p>
          </div>
        </div>

        {/* DATOS DEL PACIENTE */}
        <div className="bg-slate-50 p-4 rounded-lg mb-8 grid grid-cols-2 gap-4 text-sm border border-slate-100">
          <div><span className="text-slate-500 block text-xs uppercase font-bold">Paciente</span><span className="font-semibold text-slate-800">{consulta.paciente.nombre_completo}</span></div>
          <div><span className="text-slate-500 block text-xs uppercase font-bold">Edad / Sexo</span><span className="font-semibold text-slate-800">{edad} años / {consulta.paciente.sexo}</span></div>
          {consulta.peso && <div><span className="text-slate-500 block text-xs uppercase font-bold">Peso</span><span className="font-semibold text-slate-800">{Number(consulta.peso)} kg</span></div>}
          {consulta.temperatura && <div><span className="text-slate-500 block text-xs uppercase font-bold">Temperatura</span><span className="font-semibold text-slate-800">{Number(consulta.temperatura)} °C</span></div>}
        </div>

        {/* SÍMBOLO Rx */}
        <div className="text-4xl font-serif text-purple-900 mb-6 italic">Rx,</div>

        {/* TRATAMIENTOS RECETADOS */}
        <div className="space-y-6 min-h-[300px]">
          {consulta.tratamientos.map((t, index) => (
            <div key={index} className="border-b border-dashed border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-baseline gap-2">
                {t.medicamento} 
                {t.escala_potencia && <span className="text-sm font-normal text-slate-500">({t.escala_potencia})</span>}
              </h2>
              <div className="mt-2 text-slate-700 text-sm leading-relaxed">
                {t.cantidad_sucusion && <p><strong>Dosis:</strong> {t.cantidad_sucusion}</p>}
                {t.frecuencia && <p><strong>Frecuencia:</strong> {t.frecuencia}</p>}
                {t.duracion && <p><strong>Duración:</strong> {t.duracion}</p>}
              </div>
            </div>
          ))}
          
          {consulta.sugerencias && (
            <div className="pt-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 mb-1">Indicaciones Generales</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{consulta.sugerencias}</p>
            </div>
          )}
        </div>

        {/* PIE DE PÁGINA Y FIRMA */}
        <div className="absolute bottom-10 left-10 right-10 pt-6 border-t border-slate-200 text-center">
          <div className="w-48 border-b border-slate-400 mx-auto mb-2 h-12"></div>
          <p className="text-sm font-bold text-slate-700">Firma del Médico</p>
          <div className="mt-4 text-xs text-slate-400 flex justify-between">
            <span>Av. Principal 123, Consultorio 4</span>
            <span>Tel: (33) 1234-5678</span>
          </div>
        </div>

      </div>
    </div>
  );
}