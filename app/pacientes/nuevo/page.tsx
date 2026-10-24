import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearPaciente } from "../../actions/pacientes.actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// Necesario en Next.js 16 para páginas con Server Actions que modifican datos
export const instant = false;

export default function NuevoPacientePage() {
  
  // Envolvemos el Server Action original para redirigir después de guardar
  async function handleSubmit(formData: FormData) {
    "use server";
    const resultado = await crearPaciente(formData);
    
    if (resultado.success) {
      redirect("/pacientes");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <header className="flex items-center gap-4">
        <Link href="/pacientes">
          <Button variant="outline" size="sm">
            ← Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Nuevo Expediente
          </h1>
          <p className="text-sm text-slate-500">
            Ingrese los datos de identificación según NOM-004-SSA3-2012
          </p>
        </div>
      </header>

      <div className="bg-white p-6 md:p-8 rounded-xl border shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          
          {/* Fila 1: Nombre y Nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo *</Label>
              <Input id="nombre_completo" name="nombre_completo" required placeholder="Apellidos y nombres" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" required />
            </div>
          </div>

          {/* Fila 2: Sexo, Escolaridad y Ocupación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo (Biológico) *</Label>
              <select 
                id="sexo" 
                name="sexo" 
                required 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Seleccionar...</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escolaridad">Escolaridad</Label>
              <select 
                id="escolaridad" 
                name="escolaridad" 
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
              <Input id="ocupacion" name="ocupacion" placeholder="Ej. Empleado, Estudiante..." />
            </div>
          </div>

          {/* Fila 3: Datos de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (Celular)</Label>
              <Input id="telefono" name="telefono" type="tel" placeholder="10 dígitos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo_electronico">Correo Electrónico</Label>
              <Input id="correo_electronico" name="correo_electronico" type="email" placeholder="paciente@correo.com" />
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-4 border-t flex justify-end">
            <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700">
              Registrar Paciente
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}