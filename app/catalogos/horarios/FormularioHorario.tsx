"use client";

import { useTransition } from "react";
import { agregarHorario } from "@/app/actions/agenda.actions";
import { Button } from "@/components/ui/button";

export default function FormularioHorario({ medicos, sedes }: { medicos: any[], sedes: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      await agregarHorario(formData);
      // ¡ESTA ES LA MAGIA! Limpiamos el formulario al terminar para que pueda seguir agregando
      form.reset(); 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Médico *</label>
        <select name="medico_id" required defaultValue="" className="w-full p-2.5 border rounded-xl bg-white">
          <option value="" disabled>Selecciona un médico...</option>
          {medicos.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sede / Consultorio *</label>
        <select name="sede_id" required defaultValue="" className="w-full p-2.5 border rounded-xl bg-white">
          <option value="" disabled>Selecciona una sede...</option>
          {sedes.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Día de la semana *</label>
        <select name="dia_semana" required defaultValue="" className="w-full p-2.5 border rounded-xl bg-white">
          <option value="" disabled>Selecciona el día...</option>
          <option value="1">Lunes</option>
          <option value="2">Martes</option>
          <option value="3">Miércoles</option>
          <option value="4">Jueves</option>
          <option value="5">Viernes</option>
          <option value="6">Sábado</option>
          <option value="7">Domingo</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio *</label>
          <input type="time" name="hora_inicio" required className="w-full p-2.5 border rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin *</label>
          <input type="time" name="hora_fin" required className="w-full p-2.5 border rounded-xl" />
        </div>
      </div>

      <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl mt-2" disabled={isPending}>
        {isPending ? "Guardando..." : "Asignar Horario"}
      </Button>
    </form>
  );
}