import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerPacientePorId, actualizarPaciente } from "../../../actions/pacientes.actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export const instant = false;

export default async function EditarPacientePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Obligatorio en Next.js 16: resolver params con await
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Editar Datos del Paciente
          </h2>
          <p className="text-sm text-slate-500">
            Folio: <strong className="text-slate-800">{paciente.folio}</strong>
          </p>
        </div>
        <Link href={`/pacientes/${paciente.id}`}>
          <Button variant="outline" size="sm">
            ← Cancelar y Volver
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          
          {/* Fila 1: Nombre y Fecha de Nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo *</Label>
              <Input 
                id="nombre_completo" 
                name="nombre_completo" 
                defaultValue={paciente.nombre_completo} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input 
                id="fecha_nacimiento" 
                name="fecha_nacimiento" 
                type="date" 
                defaultValue={fechaFormateada} 
                required 
              />
            </div>
          </div>

          {/* Fila 2: Sexo, Escolaridad y Ocupación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo (Biológico) *</Label>
              <select 
                id="sexo" 
                name="sexo" 
                defaultValue={paciente.sexo} 
                required 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escolaridad">Escolaridad</Label>
              <select 
                id="escolaridad" 
                name="escolaridad" 
                defaultValue={paciente.escolaridad || ""} 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              <Label htmlFor="ocupacion">Ocupación</Label>
              <Input 
                id="ocupacion" 
                name="ocupacion" 
                defaultValue={paciente.ocupacion || ""} 
                placeholder="Ej. Docente, Estudiante..." 
              />
            </div>
          </div>

          {/* Fila 3: Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (Celular)</Label>
              <Input 
                id="telefono" 
                name="telefono" 
                type="tel" 
                defaultValue={paciente.telefono || ""} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo_electronico">Correo Electrónico</Label>
              <Input 
                id="correo_electronico" 
                name="correo_electronico" 
                type="email" 
                defaultValue={paciente.correo_electronico || ""} 
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <Link href={`/pacientes/${paciente.id}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              Guardar Cambios
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}