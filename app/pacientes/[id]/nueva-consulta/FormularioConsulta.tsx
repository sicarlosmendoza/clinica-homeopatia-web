"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { guardarNuevaConsulta } from "@/app/actions/consultas.actions";

export default function FormularioConsulta({ pacienteId, tallaPrevia }: { pacienteId: string; tallaPrevia: string | number }) {
  const guardarConsultaConId = guardarNuevaConsulta.bind(null, pacienteId);

  const [tratamientos, setTratamientos] = useState([
    { medicamento: "", escala_potencia: "", cantidad_sucusion: "", frecuencia: "", duracion: "" }
  ]);

  const agregarMedicamento = () => {
    setTratamientos([...tratamientos, { medicamento: "", escala_potencia: "", cantidad_sucusion: "", frecuencia: "", duracion: "" }]);
  };

  const quitarMedicamento = (index: number) => {
    setTratamientos(tratamientos.filter((_, i) => i !== index));
  };

  const actualizarCampo = (index: number, campo: string, valor: string) => {
    const nuevos = [...tratamientos];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setTratamientos(nuevos);
  };

  return (
    <form action={guardarConsultaConId} className="space-y-8">
      
      <input type="hidden" name="tratamientos_json" value={JSON.stringify(tratamientos)} />

      {/* BLOQUE 1: ORIGEN */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Origen de la Consulta</label>
        <select name="origen" className="w-full md:w-1/3 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none">
          <option value="PRESENCIAL">Presencial (Clínica)</option>
          <option value="WEB">Reserva Web</option>
          <option value="WHATSAPP">WhatsApp / Llamada</option>
          <option value="URGENCIA">Urgencia</option>
        </select>
      </div>

      {/* BLOQUE 2: SIGNOS VITALES */}
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">🩺 Signos Vitales y Somatometría</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Peso (kg)</label><input type="number" step="0.1" name="peso" className="w-full p-2.5 border rounded-lg" placeholder="Ej. 70.5" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Talla (cm)</label><input type="number" step="0.1" name="talla" defaultValue={tallaPrevia} className="w-full p-2.5 border rounded-lg bg-white" placeholder="Ej. 175" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Presión Arterial</label><input type="text" name="presion_arterial" className="w-full p-2.5 border rounded-lg" placeholder="120/80" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Temp. (°C)</label><input type="number" step="0.1" name="temperatura" className="w-full p-2.5 border rounded-lg" placeholder="36.5" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Frecuencia Cardíaca</label><input type="number" name="frecuencia_cardiaca" className="w-full p-2.5 border rounded-lg" placeholder="lpm" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Frecuencia Resp.</label><input type="number" name="frecuencia_resp" className="w-full p-2.5 border rounded-lg" placeholder="rpm" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Sat. Oxígeno (%)</label><input type="number" name="saturacion_oxigeno" className="w-full p-2.5 border rounded-lg" placeholder="98" /></div>
        </div>
      </div>

      {/* BLOQUE 3: LA TOMA DEL CASO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">📝 Motivo y Narrativa Clínica</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Consulta *</label><input type="text" name="motivo_consulta" required className="w-full p-3 border rounded-xl" placeholder="Ej. Cistitis de repetición..." /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Desde cuándo (Etiología)</label><input type="text" name="desde_cuando" className="w-full p-3 border rounded-xl" placeholder="Ej. Hace 2 meses, posterior a un coraje..." /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Caso Clínico Completo</label><textarea name="caso_clinico" rows={4} className="w-full p-3 border rounded-xl resize-y" placeholder="Escriba aquí la descripción general..."></textarea></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Síntomas Mentales</label><textarea name="sintomas_mentales" rows={3} className="w-full p-3 border border-pink-200 bg-pink-50/30 rounded-xl" placeholder="Afecciones emocionales, miedos..."></textarea></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Síntomas Generales</label><textarea name="sintomas_generales" rows={3} className="w-full p-3 border border-purple-200 bg-purple-50/30 rounded-xl" placeholder="Clima, sed, sueño, lateralidad..."></textarea></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Síntomas Particulares</label><textarea name="sintomas_particulares" rows={3} className="w-full p-3 border border-sky-200 bg-sky-50/30 rounded-xl" placeholder="Dolor específico, punzadas..."></textarea></div>
          </div>
        </div>
      </div>

      {/* BLOQUE 4: DIAGNÓSTICO Y TRATAMIENTO DINÁMICO */}
      <div className="bg-purple-50/40 p-6 rounded-2xl border border-purple-100">
        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">🌱 Repertorización y Tratamiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Miasma Predisponente</label><input type="text" name="miasma_predisponente" className="w-full p-3 border rounded-xl" placeholder="Ej. Psórico" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Miasma Secundario</label><input type="text" name="miasma_secundario" className="w-full p-3 border rounded-xl" placeholder="Ej. Sycótico" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Caso</label><input type="text" name="tipo_caso" className="w-full p-3 border rounded-xl" placeholder="Ej. Crónico agudizado" /></div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800">Receta Médica</h4>
          {tratamientos.map((trat, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border shadow-sm relative">
              {tratamientos.length > 1 && (
                <button type="button" onClick={() => quitarMedicamento(index)} className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1 rounded-md text-xs font-bold transition-colors">
                  ✕ Quitar
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-sm font-bold text-slate-800 mb-1">Medicamento {index + 1} *</label>
                  <input type="text" required value={trat.medicamento} onChange={(e) => actualizarCampo(index, "medicamento", e.target.value)} className="w-full p-3 border-2 border-purple-300 rounded-xl text-purple-900 font-bold placeholder:text-purple-300/60" placeholder="Ej. Sulphur" />
                </div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Escala/Potencia</label><input type="text" value={trat.escala_potencia} onChange={(e) => actualizarCampo(index, "escala_potencia", e.target.value)} className="w-full p-2.5 border rounded-lg" placeholder="LM 30" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Cant./Sucusión</label><input type="text" value={trat.cantidad_sucusion} onChange={(e) => actualizarCampo(index, "cantidad_sucusion", e.target.value)} className="w-full p-2.5 border rounded-lg" placeholder="10 gts 2 suc" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Frecuencia</label><input type="text" value={trat.frecuencia} onChange={(e) => actualizarCampo(index, "frecuencia", e.target.value)} className="w-full p-2.5 border rounded-lg" placeholder="Cada 12 hrs" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Duración</label><input type="text" value={trat.duracion} onChange={(e) => actualizarCampo(index, "duracion", e.target.value)} className="w-full p-2.5 border rounded-lg" placeholder="1 mes" /></div>
              </div>
            </div>
          ))}
          
          <Button type="button" variant="outline" onClick={agregarMedicamento} className="border-purple-300 text-purple-700 hover:bg-purple-50">
            + Agregar otro medicamento
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" className="bg-purple-700 hover:bg-purple-800 text-white px-8 rounded-xl h-14 text-lg shadow-lg shadow-purple-200">
          Guardar Consulta y Tratamiento
        </Button>
      </div>
    </form>
  );
}