"use client";

import { use, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { guardarNuevaConsulta } from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

function FormularioConsulta({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citaId = searchParams.get("citaId");

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    motivo: "",
    peso: "",
    talla: "",
    tensionArterial: "",
    narrativaClinica: "",
    mentales: "",
    generales: "",
    particulares: "",
    medicamento: "",
    potencia: "",
    dosis: "",
    frecuencia: "",
    duracion: "", // <-- ¡Campo de duración agregado!
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.motivo.trim()) {
      setErrorMsg("El motivo de la consulta es obligatorio.");
      return;
    }

    startTransition(async () => {
      const res = await guardarNuevaConsulta({
        pacienteId: id,
        citaId,
        motivo: formData.motivo,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        talla: formData.talla ? parseFloat(formData.talla) : null,
        tension_arterial: formData.tensionArterial,
        narrativa_clinica: formData.narrativaClinica,
        mentales: formData.mentales,
        generales: formData.generales,
        particulares: formData.particulares,
        medicamento: formData.medicamento,
        potencia: formData.potencia,
        dosis: formData.dosis,
        frecuencia: formData.frecuencia,
        duracion: formData.duracion, // <-- Se envía correctamente al action
      });

      if (res.success) {
        router.push(`/pacientes/${id}`);
      } else {
        setErrorMsg(res.error || "Ocurrió un error al guardar la consulta.");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {citaId && (
          <div className="p-4 bg-purple-50 text-purple-900 text-sm rounded-xl border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 font-black text-base">🔗</span>
              <span>
                <strong>Consulta enlazada a la agenda:</strong> Al guardar, la cita pasará automáticamente a estado <strong>Completada</strong>.
              </span>
            </div>
          </div>
        )}

        {/* MOTIVO DE CONSULTA Y SIGNOS VITALES */}
        <div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">1. Motivo y Signos Vitales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-slate-800 mb-1">Motivo de Consulta *</label>
              <input
                type="text"
                required
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Ej. Cefalea pulsátil frontal, dolor estomacal..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                placeholder="Ej. 65.5"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Talla (m)</label>
              <input
                type="number"
                step="0.01"
                value={formData.talla}
                onChange={(e) => setFormData({ ...formData, talla: e.target.value })}
                placeholder="Ej. 1.70"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Tensión Arterial</label>
              <input
                type="text"
                value={formData.tensionArterial}
                onChange={(e) => setFormData({ ...formData, tensionArterial: e.target.value })}
                placeholder="Ej. 120/80"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* NARRATIVA Y REPERTORIZACIÓN */}
        <div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">2. Análisis Clínico e Homeopático</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Narrativa Clínica</label>
              <textarea
                rows={3}
                value={formData.narrativaClinica}
                onChange={(e) => setFormData({ ...formData, narrativaClinica: e.target.value })}
                placeholder="Describe detalladamente el origen, sensación y evolución del padecimiento..."
                className="w-full p-3 border border-slate-300 rounded-xl resize-y focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Síntomas Mentales</label>
                <textarea
                  rows={3}
                  value={formData.mentales}
                  onChange={(e) => setFormData({ ...formData, mentales: e.target.value })}
                  placeholder="Ej. Ansiedad, irritabilidad, miedos, apegos..."
                  className="w-full p-3 border border-slate-300 rounded-xl resize-y focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Síntomas Generales</label>
                <textarea
                  rows={3}
                  value={formData.generales}
                  onChange={(e) => setFormData({ ...formData, generales: e.target.value })}
                  placeholder="Ej. Caluroso, agravación nocturna, deseo de dulces..."
                  className="w-full p-3 border border-slate-300 rounded-xl resize-y focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Síntomas Particulares</label>
                <textarea
                  rows={3}
                  value={formData.particulares}
                  onChange={(e) => setFormData({ ...formData, particulares: e.target.value })}
                  placeholder="Ej. Punzadas en ojo derecho, dolor de rodilla al subir escaleras..."
                  className="w-full p-3 border border-slate-300 rounded-xl resize-y focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RECETA MÉDICA */}
        <div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">3. Receta Médica Homeopática</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-800 mb-1">Medicamento</label>
              <input
                type="text"
                value={formData.medicamento}
                onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
                placeholder="Ej. Sulphur, Nux vomica, Arsenicum album..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Potencia</label>
              <input
                type="text"
                value={formData.potencia}
                onChange={(e) => setFormData({ ...formData, potencia: e.target.value })}
                placeholder="Ej. 30 CH, LM1, 200 C..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Dosis (Cantidad / Sucusiones)</label>
              <input
                type="text"
                value={formData.dosis}
                onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                placeholder="Ej. 10 gotas y 2 sucusiones, 3 glóbulos..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            
            {/* SEPARADOS: FRECUENCIA Y DURACIÓN */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Frecuencia</label>
              <input
                type="text"
                value={formData.frecuencia}
                onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                placeholder="Ej. Cada 12 horas, Cada 8 horas..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Duración</label>
              <input
                type="text"
                value={formData.duracion}
                onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                placeholder="Ej. Por un mes, Hasta próxima cita..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href={`/pacientes/${id}`}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm transition-all disabled:opacity-50"
          >
            {isPending ? "Guardando consulta..." : "Guardar consulta y tratamiento"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NuevaConsultaPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Nueva Consulta Médica</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro de padecimiento, signos homeopáticos y prescripción.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
          Cargando formulario clínico...
        </div>
      }>
        <FormularioConsulta id={id} />
      </Suspense>
    </div>
  );
}