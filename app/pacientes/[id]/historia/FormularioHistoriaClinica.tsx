"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { guardarHistoriaClinica } from "@/app/actions/historia-clinica.actions";

export default function FormularioHistoriaClinica({
  pacienteId,
  historia,
  sexo,
  edadAnios
}: {
  pacienteId: string;
  historia: any;
  sexo: string;
  edadAnios: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  // Lógica Inteligente para mostrar/ocultar secciones
  const esMujer = sexo.toLowerCase().startsWith("f") || sexo.toLowerCase() === "mujer";
  const esInfante = edadAnios <= 12;

  // Manejador del botón Guardar
  const handleGuardar = (formData: FormData) => {
    startTransition(async () => {
      await guardarHistoriaClinica(pacienteId, formData);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 4000); // Ocultar mensaje de éxito después de 4s
    });
  };

  // Extraer fecha para el input type="date"
  const fumValue = historia?.fum ? new Date(historia.fum).toISOString().split('T')[0] : "";

  return (
    <form action={handleGuardar} className="space-y-6">
      
      {/* Alerta de guardado exitoso */}
      {guardado && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
          <span>✅</span> Historia clínica guardada correctamente.
        </div>
      )}

      {/* BLOQUE 1: ANTECEDENTES UNIVERSALES (Siempre visible) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          📋 Antecedentes Generales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Antecedentes Heredofamiliares (AHF)</label>
            <textarea name="ahf" defaultValue={historia?.ahf || ""} rows={3} className="w-full p-3 border rounded-xl" placeholder="Diabetes, Hipertensión, Cáncer en padres o abuelos..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Personales Patológicos (APP)</label>
            <textarea name="app" defaultValue={historia?.app || ""} rows={3} className="w-full p-3 border rounded-xl" placeholder="Cirugías, alergias, transfusiones..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Personales No Patológicos (APNP)</label>
            <textarea name="apnp" defaultValue={historia?.apnp || ""} rows={3} className="w-full p-3 border rounded-xl" placeholder="Hábitos, alimentación, tabaquismo..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico Psiquiátrico / Psicológico</label>
            <textarea name="diagnostico_psiquiatrico" defaultValue={historia?.diagnostico_psiquiatrico || ""} rows={2} className="w-full p-3 border rounded-xl" placeholder="Ansiedad, Depresión..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enfermedades Venéreas</label>
            <textarea name="enfermedades_venereas" defaultValue={historia?.enfermedades_venereas || ""} rows={2} className="w-full p-3 border rounded-xl" placeholder="VPH, Sífilis..."></textarea>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: GINECOLÓGICO (Solo Mujeres) */}
      {esMujer && (
        <div className="bg-pink-50/40 p-6 rounded-2xl border border-pink-100">
          <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center gap-2">
            🌸 Antecedentes Gineco-Obstétricos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Menarca (Edad)</label><input type="number" name="menarca" defaultValue={historia?.menarca || ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 12" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Ritmo Menstrual</label><input type="text" name="ritmo_menstrual" defaultValue={historia?.ritmo_menstrual || ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 28x5" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Fecha de Última Menstruación (FUM)</label><input type="date" name="fum" defaultValue={fumValue} className="w-full p-2.5 border rounded-lg" /></div>
            
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Gestas (Embarazos)</label><input type="number" name="gestas" defaultValue={historia?.gestas || 0} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Partos</label><input type="number" name="partos" defaultValue={historia?.partos || 0} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Cesáreas</label><input type="number" name="cesareas" defaultValue={historia?.cesareas || 0} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Abortos</label><input type="number" name="abortos" defaultValue={historia?.abortos || 0} className="w-full p-2.5 border rounded-lg" /></div>
            
            <div className="col-span-2 md:col-span-4"><label className="block text-xs font-medium text-slate-600 mb-1">Método Anticonceptivo</label><input type="text" name="metodo_anticonceptivo" defaultValue={historia?.metodo_anticonceptivo || ""} className="w-full p-2.5 border rounded-lg" placeholder="DIU, Pastillas, Ninguno..." /></div>
          </div>
        </div>
      )}

      {/* BLOQUE 3: PEDIÁTRICOS Y PERINATALES (Solo < 12 años) */}
      {esInfante && (
        <div className="bg-amber-50/40 p-6 rounded-2xl border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            🧸 Antecedentes Perinatales y Desarrollo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Canal de Parto / Motivo</label><input type="text" name="tipo_nacimiento" defaultValue={historia?.tipo_nacimiento || ""} className="w-full p-2.5 border rounded-lg" placeholder="Eutócico, Cesárea por preeclampsia..." /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">APGAR</label><input type="text" name="apgar" defaultValue={historia?.apgar || ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 8/9" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Peso al nacer (kg)</label><input type="number" step="0.1" name="peso_nacer" defaultValue={historia?.peso_nacer ? Number(historia.peso_nacer) : ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 3.2" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Talla al nacer (cm)</label><input type="number" step="0.1" name="talla_nacer" defaultValue={historia?.talla_nacer ? Number(historia.talla_nacer) : ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 50" /></div>
            <div className="col-span-2 md:col-span-3"><label className="block text-xs font-medium text-slate-600 mb-1">Lactancia (Tipo y duración)</label><input type="text" name="lactancia" defaultValue={historia?.lactancia || ""} className="w-full p-2.5 border rounded-lg" placeholder="Materna exclusiva por 6 meses..." /></div>
            
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Desarrollo Psicomotor</label><textarea name="desarrollo_psicomotor" defaultValue={historia?.desarrollo_psicomotor || ""} rows={2} className="w-full p-2.5 border rounded-lg" placeholder="Sostén cefálico a los 3 meses..."></textarea></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Esquema de Vacunación</label><textarea name="vacunas" defaultValue={historia?.vacunas || ""} rows={2} className="w-full p-2.5 border rounded-lg" placeholder="Completo para la edad..."></textarea></div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} className="bg-slate-800 hover:bg-slate-900 text-white px-8 rounded-xl h-12">
          {isPending ? "Guardando..." : "Guardar Historia Clínica"}
        </Button>
      </div>

    </form>
  );
}