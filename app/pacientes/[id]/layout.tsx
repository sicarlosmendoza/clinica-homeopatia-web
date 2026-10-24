import CapturaFotoModal from "@/components/ui/CapturaFotoModal";
import { obtenerExpedientePaciente } from "../../actions/pacientes.actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export const instant = false;

function calcularEdad(fechaNac: Date) {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  let meses = hoy.getMonth() - fechaNac.getMonth();
  if (meses < 0 || (meses === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
    meses += 12;
  }
  if (edad === 0) return `${meses} meses`;
  return `${edad} años, ${meses} meses`;
}

function clasificarEtapa(fechaNac: Date) {
  const hoy = new Date();
  let edadAnios = hoy.getFullYear() - fechaNac.getFullYear();
  let meses = hoy.getMonth() - fechaNac.getMonth();
  if (meses < 0 || (meses === 0 && hoy.getDate() < fechaNac.getDate())) { 
    edadAnios--; 
    meses += 12; 
  }
  
  if (edadAnios >= 60) return "Adulto Mayor";
  if (edadAnios >= 18) return "Adulto";
  if (edadAnios >= 12) return "Adolescente";
  if (edadAnios >= 6) return "Escolar";
  if (edadAnios >= 2) return "Preescolar";
  
  const totalMeses = (edadAnios * 12) + meses;
  if (totalMeses >= 1) return "Lactante";
  return "Recién Nacido";
}

export default async function ExpedienteLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: Promise<{ id: string }>; 
}) {
  const resolvedParams = await params;
  const paciente = await obtenerExpedientePaciente(resolvedParams.id);

  if (!paciente) redirect("/pacientes");

  const edadTexto = calcularEdad(paciente.fecha_nacimiento);
  const etapa = clasificarEtapa(paciente.fecha_nacimiento);

  return (
    <div className="space-y-4">
      {/* BOTÓN REGRESAR */}
      <div>
        <Link href="/pacientes">
          <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-900 hover:bg-violet-50 -ml-2">
            ← Volver a Pacientes
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* CABECERA: Borde superior azul, fondo con tinte lila y avatar morado/rosa */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
          {/* Línea decorativa superior azul */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-pink-500" />
          
          {/* Avatar con degradado lila-rosa */}
          {/* Avatar con captura de Webcam */}
          <CapturaFotoModal
            pacienteId={paciente.id}
            fotoActual={paciente.foto}
            inicialNombre={paciente.nombre_completo.charAt(0)}
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {paciente.nombre_completo}
              </h1>
              <span className="bg-violet-900 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                {paciente.folio}
              </span>
              <span className="bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {etapa}
              </span>
              
              <Link href={`/pacientes/${paciente.id}/editar`}>
                <Button variant="outline" size="sm" className="h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
                  ✏️ Editar Datos
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <p><strong className="text-slate-800">Edad:</strong> {edadTexto} ({paciente.sexo})</p>
              <p>📱 {paciente.telefono || "Sin teléfono"}</p>
              <p>✉️ {paciente.correo_electronico || "Sin correo"}</p>
            </div>
          </div>
        </div>

        {/* PESTAÑAS CON RESALTADO VIOLETA */}
        <nav className="flex space-x-1 border-b border-purple-100 overflow-x-auto pb-px">
          <Link 
            href={`/pacientes/${paciente.id}`} 
            className="px-4 py-2.5 text-sm font-semibold border-b-2 border-violet-600 text-violet-700 whitespace-nowrap"
          >
            Resumen Clínico
          </Link>
          <Link 
            href={`/pacientes/${paciente.id}/historia`} 
            className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-violet-700 hover:border-violet-300 whitespace-nowrap transition-colors"
          >
            Historia Clínica
          </Link>
          <Link 
            href={`/pacientes/${paciente.id}/consultas`} 
            className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-violet-700 hover:border-violet-300 whitespace-nowrap transition-colors"
          >
            Consultas ({paciente._count.consultas})
          </Link>
          <Link 
            href={`/pacientes/${paciente.id}/archivos`} 
            className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-violet-700 hover:border-violet-300 whitespace-nowrap transition-colors"
          >
            Archivos ({paciente._count.archivos})
          </Link>
        </nav>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}