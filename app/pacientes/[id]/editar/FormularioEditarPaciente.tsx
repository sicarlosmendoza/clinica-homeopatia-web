"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { actualizarPaciente } from "./actions";

export default function FormularioEditarPaciente({ paciente }: { paciente: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const [sexoLocal, setSexoLocal] = useState(paciente.sexo || "");
  const [estadoCivilLocal, setEstadoCivilLocal] = useState(paciente.estado_civil || "");

  useEffect(() => {
    setSexoLocal(paciente.sexo || "");
    setEstadoCivilLocal(paciente.estado_civil || "");
  }, [paciente.sexo, paciente.estado_civil]);

  const fechaNacimiento = paciente.fecha_nacimiento 
    ? new Date(paciente.fecha_nacimiento).toISOString().split('T')[0] 
    : "";

  const handleGuardar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    setErrorMensaje(null);
    setGuardado(false);

    startTransition(async () => {
      // AQUÍ ESTÁ EL ARREGLO: Agregamos "as any" para que TS permita leer "res.error"
      const res = (await actualizarPaciente(paciente.id, formData)) as any;
      
      if (res?.success) {
        setGuardado(true);
        router.refresh(); 
        setTimeout(() => setGuardado(false), 4000);
      } else {
        setErrorMensaje(res?.error || "Ocurrió un error al guardar los datos.");
      }
    });
  };

  return (
    <form onSubmit={handleGuardar} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <input type="hidden" name="id" value={paciente.id} />
      
      {guardado && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
          <span>✅</span> Datos del paciente actualizados correctamente.
        </div>
      )}

      {errorMensaje && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-bold flex items-center gap-2">
          <span>⚠️</span> {errorMensaje}
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
          <select 
            name="sexo" 
            value={sexoLocal}
            onChange={(e) => setSexoLocal(e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-white" 
          >
            <option value="" disabled>Seleccione...</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
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
          <select 
            name="estado_civil" 
            value={estadoCivilLocal}
            onChange={(e) => setEstadoCivilLocal(e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-white"
          >
            <option value="" disabled>Seleccione...</option>
            <option value="Soltero(a)">Soltero(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viudo(a)">Viudo(a)</option>
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