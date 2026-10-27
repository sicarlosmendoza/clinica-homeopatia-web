"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { guardarHistoriaClinica } from "./actions"; // Ajusta la ruta a donde tengas el action.ts
import { useRouter } from "next/navigation";

export default function FormularioHistoriaClinica({
  pacienteId,
  historia,
  sexo,
  edadAnios
}: {
  pacienteId: string;
  historia: any;
  sexo: string | null;
  edadAnios: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  // Lógica Inteligente para mostrar/ocultar secciones
  const esMujer = sexo?.toLowerCase().startsWith("f") || sexo?.toLowerCase() === "mujer";
  const mostrarGinecologia = esMujer && edadAnios >= 10;
  const mostrarPediatria = edadAnios < 6;
  const mostrarEscolares = edadAnios < 12;
  const mostrarAdultos = edadAnios >= 12;

  // Manejador del botón Guardar utilizando FormData nativo
  const handleGuardar = (formData: FormData) => {
    // Convertimos FormData a un objeto plano para enviarlo al Server Action
    const dataObj = Object.fromEntries(formData.entries());

    startTransition(async () => {
      const res = await guardarHistoriaClinica(pacienteId, dataObj);
      if (res.success) {
        setGuardado(true);
        setTimeout(() => setGuardado(false), 4000);
        router.refresh(); // Refrescamos la ruta para ver los cambios
      } else {
        alert(res.error);
      }
    });
  };

  // Extraer fecha para el input type="date"
  const fumValue = historia?.fum ? new Date(historia.fum).toISOString().split('T')[0] : "";

  return (
    <form action={handleGuardar} className="space-y-6 animate-in fade-in">
      
      {/* Alerta de guardado exitoso */}
      {guardado && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
          <span>✅</span> Historia clínica guardada correctamente.
        </div>
      )}

      {/* BLOQUE 1: ANTECEDENTES UNIVERSALES (Siempre visible) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          📋 Antecedentes Generales y Homeopáticos
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
          
          {/* NUEVOS: HOMEOPÁTICOS GENERALES */}
          <div className="md:col-span-2 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-1">Sensibilidad Térmica</label>
              <input type="text" name="sensibilidad_termica" defaultValue={historia?.sensibilidad_termica || ""} className="w-full p-3 border rounded-xl" placeholder="Friolento, caluroso..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-1">Sed</label>
              <input type="text" name="sed" defaultValue={historia?.sed || ""} className="w-full p-3 border rounded-xl" placeholder="Agua fría, poca sed..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-1">Deseos/Aversiones Alimentos</label>
              <input type="text" name="deseos_aversiones" defaultValue={historia?.deseos_aversiones || ""} className="w-full p-3 border rounded-xl" placeholder="Desea dulces, salados..." />
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: GINECOLÓGICO (Solo Mujeres > 10 años) */}
      {mostrarGinecologia && (
        <div className="bg-pink-50/40 p-6 rounded-2xl border border-pink-100">
          <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center gap-2">
            🌸 Antecedentes Gineco-Obstétricos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Menarca (Edad)</label><input type="number" name="menarca" defaultValue={historia?.menarca || ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 12" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Ritmo Menstrual</label><input type="text" name="ritmo_menstrual" defaultValue={historia?.ritmo_menstrual || ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 28x5" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Fecha de Última Menstruación (FUM)</label><input type="date" name="fum" defaultValue={fumValue} className="w-full p-2.5 border rounded-lg" /></div>
            
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Gestas</label><input type="number" name="gestas" defaultValue={historia?.gestas || 0} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Partos</label><input type="number" name="partos" defaultValue={historia?.partos || 0} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Cesáreas</label><input type="number" name="cesareas" defaultValue={historia?.cesareas || 0} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Abortos</label><input type="number" name="abortos" defaultValue={historia?.abortos || 0} className="w-full p-2.5 border rounded-lg" /></div>
            
            <div className="col-span-2 md:col-span-4"><label className="block text-xs font-medium text-slate-600 mb-1">Método Anticonceptivo</label><input type="text" name="metodo_anticonceptivo" defaultValue={historia?.metodo_anticonceptivo || ""} className="w-full p-2.5 border rounded-lg" placeholder="DIU, Pastillas, Ninguno..." /></div>
          </div>
        </div>
      )}

      {/* BLOQUE 3: LACTANTES (Solo < 6 años) */}
      {mostrarPediatria && (
        <div className="bg-amber-50/40 p-6 rounded-2xl border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            🧸 Antecedentes Perinatales y Lactancia
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Canal de Parto / Motivo</label><input type="text" name="tipo_nacimiento" defaultValue={historia?.tipo_nacimiento || ""} className="w-full p-2.5 border rounded-lg" placeholder="Eutócico, Cesárea por preeclampsia..." /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">APGAR</label><input type="text" name="apgar" defaultValue={historia?.apgar || ""} className="w-full p-2.5 border rounded-lg" placeholder="Ej. 8/9" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Peso nacer (kg)</label><input type="number" step="0.1" name="peso_nacer" defaultValue={historia?.peso_nacer ? Number(historia.peso_nacer) : ""} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Talla nacer (m)</label><input type="number" step="0.01" name="talla_nacer" defaultValue={historia?.talla_nacer ? Number(historia.talla_nacer) : ""} className="w-full p-2.5 border rounded-lg" /></div>
            <div className="col-span-3"><label className="block text-xs font-medium text-slate-600 mb-1">Lactancia (Tipo y duración)</label><input type="text" name="lactancia" defaultValue={historia?.lactancia || ""} className="w-full p-2.5 border rounded-lg" placeholder="Materna exclusiva por 6 meses..." /></div>
            
            <div className="col-span-2 md:col-span-4"><label className="block text-xs font-medium text-slate-600 mb-1">Esquema de Vacunación</label><textarea name="vacunas" defaultValue={historia?.vacunas || ""} rows={2} className="w-full p-2.5 border rounded-lg" placeholder="Completo para la edad..."></textarea></div>
          </div>
        </div>
      )}

      {/* BLOQUE 4: ESCOLARES (Solo < 12 años) */}
      {mostrarEscolares && (
        <div className="bg-sky-50/40 p-6 rounded-2xl border border-sky-100">
          <h3 className="text-lg font-bold text-sky-900 mb-4 flex items-center gap-2">
            🪁 Desarrollo Psicomotor y Comportamiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Desarrollo Psicomotor (Sentarse / Marcha)</label><input type="text" name="desarrollo_psicomotor" defaultValue={historia?.desarrollo_psicomotor || ""} className="w-full p-2.5 border rounded-lg" placeholder="Caminó al año..." /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Desarrollo del Lenguaje</label><input type="text" name="desarrollo_lenguaje" defaultValue={historia?.desarrollo_lenguaje || ""} className="w-full p-2.5 border rounded-lg" placeholder="Primeras palabras..." /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Control de Esfínteres / Enuresis</label><input type="text" name="control_esfinteres" defaultValue={historia?.control_esfinteres || ""} className="w-full p-2.5 border rounded-lg" placeholder="A los 2 años..." /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Comportamiento Escolar / Social</label><input type="text" name="comportamiento" defaultValue={historia?.comportamiento || ""} className="w-full p-2.5 border rounded-lg" placeholder="Timidez, berrinches..." /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Miedos Específicos / Patrón de Sueño</label><textarea name="miedos_especificos" defaultValue={historia?.miedos_especificos || ""} rows={2} className="w-full p-2.5 border rounded-lg" placeholder="Miedo a la oscuridad, terrores nocturnos..."></textarea></div>
          </div>
        </div>
      )}

      {/* BLOQUE 5: ADULTOS Y ADOLESCENTES (Solo > 12 años) */}
      {mostrarAdultos && (
        <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100">
          <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
            💼 Estilo de Vida y Salud Psicoemocional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Tabaquismo</label><input type="text" name="tabaquismo" defaultValue={historia?.tabaquismo || ""} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Alcoholismo</label><input type="text" name="alcoholismo" defaultValue={historia?.alcoholismo || ""} className="w-full p-2.5 border rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Cafeína y Estimulantes</label><input type="text" name="cafeina_estimulantes" defaultValue={historia?.cafeina_estimulantes || ""} className="w-full p-2.5 border rounded-lg" /></div>
            
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Actividad Física y Alimentación</label><input type="text" name="alimentacion" defaultValue={historia?.alimentacion || ""} className="w-full p-2.5 border rounded-lg" placeholder="Sedentario, dieta alta en grasas..." /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Nivel de Estrés</label><input type="text" name="nivel_estres" defaultValue={historia?.nivel_estres || ""} className="w-full p-2.5 border rounded-lg" placeholder="Laboral, familiar..." /></div>
            
            <div className="col-span-3"><label className="block text-xs font-medium text-slate-600 mb-1">Estado de Ánimo Predominante</label><textarea name="estado_animo" defaultValue={historia?.estado_animo || ""} rows={2} className="w-full p-2.5 border rounded-lg" placeholder="Ansiedad, tristeza profunda..."></textarea></div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} className="bg-purple-700 hover:bg-purple-800 shadow-md text-white px-8 rounded-xl h-12">
          {isPending ? "Guardando historia..." : "Guardar Historia Clínica"}
        </Button>
      </div>

    </form>
  );
}