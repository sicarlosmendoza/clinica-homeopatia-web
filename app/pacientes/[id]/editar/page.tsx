import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerPacientePorId, actualizarPaciente } from "@/app/actions/pacientes.actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export const instant = false;

export default async function EditarPacientePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const paciente = await obtenerPacientePorId(resolvedParams.id);

  if (!paciente) {
    redirect("/pacientes");
  }

  // Formatear la fecha a YYYY-MM-DD para el input type="date"
  const fechaFormateada = paciente.fecha_nacimiento.toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    "use server";
    const resultado = await actualizarPaciente(resolvedParams.id, formData);
    if (resultado.success) {
      redirect(`/pacientes/${resolvedParams.id}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 pt-2">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-purple-100 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          
          {/* Fila 1: Nombre y Fecha de Nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo" className="text-slate-700 font-medium">
                Nombre Completo *
              </Label>
              <Input 
                id="nombre_completo" 
                name="nombre_completo" 
                defaultValue={paciente.nombre_completo} 
                required 
                className="focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento" className="text-slate-700 font-medium">
                Fecha de Nacimiento *
              </Label>
              <Input 
                id="fecha_nacimiento" 
                name="fecha_nacimiento" 
                type="date" 
                defaultValue={fechaFormateada} 
                required 
                className="focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>
          </div>

          {/* Fila 2: Sexo, Escolaridad y Ocupación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo" className="text-slate-700 font-medium">
                Sexo (Biológico) *
              </Label>
              <select 
                id="sexo" 
                name="sexo" 
                defaultValue={paciente.sexo} 
                required 
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escolaridad" className="text-slate-700 font-medium">
                Escolaridad
              </Label>
              <select 
                id="escolaridad" 
                name="escolaridad" 
                defaultValue={paciente.escolaridad || ""} 
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Ninguna">Ninguna</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Preparatoria">Preparatoria / Bachillerato</option>
                <option value="Licenciatura">Licenciatura / Ingeniería</option>
                <option value="Posgrado">Posgrado (Maestría / Doctorado)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ocupacion" className="text-slate-700 font-medium">
                Ocupación
              </Label>
              <Input 
                id="ocupacion" 
                name="ocupacion" 
                defaultValue={paciente.ocupacion || ""} 
                placeholder="Ej. Docente, Estudiante..." 
                className="focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>
          </div>

          {/* Fila 3: Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-purple-100 pt-4">
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-slate-700 font-medium">
                Teléfono (Celular)
              </Label>
              <Input 
                id="telefono" 
                name="telefono" 
                type="tel" 
                defaultValue={paciente.telefono || ""} 
                className="focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo_electronico" className="text-slate-700 font-medium">
                Correo Electrónico
              </Label>
              <Input 
                id="correo_electronico" 
                name="correo_electronico" 
                type="email" 
                defaultValue={paciente.correo_electronico || ""} 
                className="focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-4 border-t border-purple-100 flex justify-end gap-3 items-center">
            <Link href={`/pacientes/${paciente.id}`}>
              <Button 
                type="button" 
                variant="outline" 
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200 px-6 font-medium transition-all"
            >
              Guardar Cambios
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}