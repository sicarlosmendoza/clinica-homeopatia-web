"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { actualizarPaciente } from "./actions";

export default function FormularioEditarPaciente({ paciente }: { paciente: any }) {
  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  // Formatear la fecha para que el input type="date" la pueda leer (YYYY-MM-DD)
  const fechaNacimiento = paciente.fecha_nacimiento 
    ? new Date(paciente.fecha_nacimiento).toISOString().split('T')[0] 
    : "";

  const handleGuardar = (formData: FormData) => {
    startTransition(async () => {
      await actualizarPaciente(paciente.id, formData);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 4000); // Ocultar mensaje después de 4 seg
    });
  };

  return (
    <form action={handleGuardar} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      
      {guardado && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
          <span>✅</span> Datos del paciente actualizados correctamente.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
          <input type="text" name="nombre_completo" required defaultValue={paciente.nombre_completo} className="w-full p-3 border rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento *</label>
          <input type="date" name="fecha_nacimiento" required defaultValue={fechaNacimiento} className="w-full p-3 border rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sexo *</label>
          <select name="sexo" required defaultValue={paciente.sexo} className="w-full p-3 border rounded-xl bg-white">
            <option value="Mujer">Mujer</option>
            <option value="Hombre">Hombre</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
          <input type="tel" name="telefono" defaultValue={paciente.telefono || ""} className="w-full p-3 border rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
          <input type="email" name="correo_electronico" defaultValue={paciente.correo_electronico || ""} className="w-full p-3 border rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado Civil</label>
          <select name="estado_civil" defaultValue={paciente.estado_civil || ""} className="w-full p-3 border rounded-xl bg-white">
            <option value="">Seleccione...</option>
            <option value="Soltero/a">Soltero/a</option>
            <option value="Casado/a">Casado/a</option>
            <option value="Divorciado/a">Divorciado/a</option>
            <option value="Viudo/a">Viudo/a</option>
            <option value="Unión Libre">Unión Libre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Escolaridad</label>
          <input type="text" name="escolaridad" defaultValue={paciente.escolaridad || ""} className="w-full p-3 border rounded-xl" placeholder="Ej. Licenciatura" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Ocupación</label>
          <input type="text" name="ocupacion" defaultValue={paciente.ocupacion || ""} className="w-full p-3 border rounded-xl" placeholder="A qué se dedica el paciente..." />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button type="submit" disabled={isPending} className="bg-purple-700 hover:bg-purple-800 text-white px-8 rounded-xl h-12">
          {isPending ? "Guardando cambios..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}