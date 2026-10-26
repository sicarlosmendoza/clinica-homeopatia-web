"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { subirArchivoPaciente } from "@/app/actions/archivos.actions";

export default function FormularioSubirArchivo({ pacienteId }: { pacienteId: string }) {
  const [isPending, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);

  const handleSubir = (formData: FormData) => {
    startTransition(async () => {
      // Llamamos a TU función de Vercel Blob
      const result = await subirArchivoPaciente(pacienteId, formData);
      
      if (result.success) {
        setMensaje({ texto: "✅ Archivo subido a la nube correctamente", tipo: "exito" });
        setTimeout(() => {
          setMensaje(null);
          setAbierto(false); // Cerramos el panel
        }, 2000);
      } else {
        setMensaje({ texto: `❌ Error: ${result.error}`, tipo: "error" });
      }
    });
  };

  if (!abierto) {
    return (
      <Button onClick={() => setAbierto(true)} className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold rounded-xl h-11 px-6 shadow-sm">
        + Subir Nuevo Archivo
      </Button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-lg">Subir Archivo a Vercel Blob</h3>
        <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕ Cerrar</button>
      </div>

      {mensaje && (
        <p className={`mb-4 text-sm font-bold ${mensaje.tipo === "exito" ? "text-emerald-600" : "text-red-600"}`}>
          {mensaje.texto}
        </p>
      )}

      <form action={handleSubir} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Archivo (PDF o Imagen) *</label>
          <input type="file" name="file" required accept=".pdf,image/*" className="w-full p-2 border rounded-xl bg-slate-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Título *</label>
          <input type="text" name="nombre" required placeholder="Ej. Biometría Hemática" className="w-full p-3 border rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Notas (Opcional)</label>
          <input type="text" name="descripcion" placeholder="Ej. Resultados previos al tratamiento" className="w-full p-3 border rounded-xl" />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending} className="bg-purple-700 hover:bg-purple-800 text-white px-6 rounded-xl">
            {isPending ? "Subiendo a la nube..." : "Subir Archivo"}
          </Button>
        </div>
      </form>
    </div>
  );
}