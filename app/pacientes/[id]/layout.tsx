import { obtenerExpedientePaciente } from "@/app/actions/pacientes.actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import CapturaFotoModal from "@/components/ui/CapturaFotoModal";
import ExpedienteTabs from "@/components/ui/ExpedienteTabs";

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
      {/* Botón regresar */}
      <div>
        <Link href="/pacientes">
          <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-900 hover:bg-violet-50 -ml-2">
            ← Volver a Pacientes
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Cabecera del Paciente (Sin botón de editar datos) */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-pink-500" />
          
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
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <p><strong className="text-slate-800">Edad:</strong> {edadTexto} ({paciente.sexo})</p>
              <p>📱 {paciente.telefono || "Sin teléfono"}</p>
              <p>✉️ {paciente.correo_electronico || "Sin correo"}</p>
            </div>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <ExpedienteTabs 
          pacienteId={paciente.id}
          totalConsultas={paciente._count.consultas}
          totalArchivos={paciente._count.archivos}
        />

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}