import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerExpedientePaciente, guardarHistoriaClinica } from "../../../actions/pacientes.actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export const instant = false;

const TextArea = ({ id, name, defaultValue, placeholder }: any) => (
  <textarea 
    id={id} 
    name={name} 
    defaultValue={defaultValue} 
    placeholder={placeholder}
    rows={4}
    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-y"
  />
);

export default async function HistoriaClinicaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const paciente = await obtenerExpedientePaciente(id);
  if (!paciente) return null;

  const historia = paciente.historia_clinica;
  
  const hoy = new Date();
  const edadAnios = hoy.getFullYear() - paciente.fecha_nacimiento.getFullYear();
  
  const esMujerEnEdadFertil = paciente.sexo === "Femenino" && edadAnios >= 10;
  const esPediatrico = edadAnios <= 12;

  async function handleSubmit(formData: FormData) {
    "use server";
    const resultado = await guardarHistoriaClinica(id, formData);
    if (resultado.success) {
      revalidatePath(`/pacientes/${id}`);
      redirect(`/pacientes/${id}`);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link href={`/pacientes/${id}`}>
          <Button variant="outline" size="sm" type="button" className="gap-2">
            ← Volver al Resumen
          </Button>
        </Link>
      </div>

      <form action={handleSubmit} className="space-y-8">
        
        {/* 1. BLOQUE UNIVERSAL */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Antecedentes Clínicos Generales</h2>
          
          <div className="space-y-2">
            <Label htmlFor="ahf" className="text-base font-semibold">Antecedentes Heredofamiliares (AHF)</Label>
            <TextArea id="ahf" name="ahf" defaultValue={historia?.ahf} placeholder="Ej. Padre finado por IAM a los 60 años. Madre viva con DM2..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apnp" className="text-base font-semibold">Antecedentes Personales No Patológicos (APNP)</Label>
            <TextArea id="apnp" name="apnp" defaultValue={historia?.apnp} placeholder="Ej. Tabaquismo, alcoholismo, alimentación..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="app" className="text-base font-semibold">Antecedentes Personales Patológicos (APP)</Label>
            <TextArea id="app" name="app" defaultValue={historia?.app} placeholder="Ej. Cirugías, fracturas, alergias, enfermedades previas..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="diagnostico_psiquiatrico" className="text-base font-semibold">Diagnóstico Psiquiátrico / Psicológico</Label>
              <TextArea id="diagnostico_psiquiatrico" name="diagnostico_psiquiatrico" defaultValue={historia?.diagnostico_psiquiatrico} placeholder="Ej. Ansiedad generalizada, depresión, ninguno..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enfermedades_venereas" className="text-base font-semibold">Enfermedades Venéreas (ETS)</Label>
              <TextArea id="enfermedades_venereas" name="enfermedades_venereas" defaultValue={historia?.enfermedades_venereas} placeholder="Ej. VPH, Sífilis, no refiere..." />
            </div>
          </div>
        </div>

        {/* 2. BLOQUE GINECOLÓGICO (Condicional) */}
        {esMujerEnEdadFertil && (
          <div className="bg-pink-50/50 p-6 rounded-xl border border-pink-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-pink-900 border-b border-pink-200 pb-2">Antecedentes Gineco-Obstétricos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><Label>Menarca (Edad)</Label><Input type="number" name="menarca" defaultValue={historia?.menarca || ""} /></div>
              <div className="space-y-2"><Label>Ritmo Menstrual</Label><Input type="text" name="ritmo_menstrual" defaultValue={historia?.ritmo_menstrual || ""} /></div>
              <div className="space-y-2"><Label>FUM</Label><Input type="date" name="fum" defaultValue={historia?.fum ? historia.fum.toISOString().split("T")[0] : ""} /></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2"><Label>Gestas</Label><Input type="number" name="gestas" defaultValue={historia?.gestas ?? 0} /></div>
              <div className="space-y-2"><Label>Partos</Label><Input type="number" name="partos" defaultValue={historia?.partos ?? 0} /></div>
              <div className="space-y-2"><Label>Cesáreas</Label><Input type="number" name="cesareas" defaultValue={historia?.cesareas ?? 0} /></div>
              <div className="space-y-2"><Label>Abortos</Label><Input type="number" name="abortos" defaultValue={historia?.abortos ?? 0} /></div>
            </div>

            <div className="space-y-2"><Label>Método Anticonceptivo Actual</Label><Input type="text" name="metodo_anticonceptivo" defaultValue={historia?.metodo_anticonceptivo || ""} /></div>
          </div>
        )}

        {/* 3. BLOQUE PEDIÁTRICO (Condicional) */}
        {esPediatrico && (
          <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-amber-900 border-b border-amber-200 pb-2">Antecedentes Perinatales y Pediátricos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Tipo de Nacimiento</Label>
                <select name="tipo_nacimiento" defaultValue={historia?.tipo_nacimiento || ""} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="">Seleccionar...</option>
                  <option value="Parto Eutócico">Parto Natural (Eutócico)</option>
                  <option value="Cesárea">Cesárea</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Peso al nacer (kg)</Label><Input type="number" step="0.01" name="peso_nacer" defaultValue={historia?.peso_nacer ? Number(historia.peso_nacer) : ""} /></div>
              <div className="space-y-2"><Label>APGAR</Label><Input type="text" name="apgar" defaultValue={historia?.apgar || ""} /></div>
            </div>

            <div className="space-y-2"><Label>Lactancia y Ablactación</Label><Input type="text" name="lactancia" defaultValue={historia?.lactancia || ""} /></div>
            <div className="space-y-2"><Label>Desarrollo Psicomotor</Label><TextArea name="desarrollo_psicomotor" defaultValue={historia?.desarrollo_psicomotor} /></div>
            <div className="space-y-2"><Label>Esquema de Vacunación</Label><Input type="text" name="vacunas" defaultValue={historia?.vacunas || ""} /></div>
          </div>
        )}

        {/* ACCIONES */}
        <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-200">
          <Link href={`/pacientes/${id}`}>
            <Button type="button" variant="outline" size="lg">Cancelar</Button>
          </Link>
          <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg px-8">
            {historia ? "Actualizar Historia Clínica" : "Guardar Historia Clínica"}
          </Button>
        </div>

      </form>
    </div>
  );
}