"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subirArchivoPaciente, eliminarArchivo } from "@/app/actions/archivos.actions";

interface ArchivoItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  url: string;
  tipo: string;
  creado_en: Date;
}

export default function SeccionDocumentosIniciales({
  pacienteId,
  archivosIniciales,
}: {
  pacienteId: string;
  archivosIniciales: ArchivoItem[];
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubiendo(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await subirArchivoPaciente(pacienteId, formData);
    setSubiendo(false);

    if (res.success) {
      form.reset();
      setMostrarForm(false);
    } else {
      alert(res.error || "Error al subir archivo");
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-purple-100 shadow-sm space-y-6 mt-8">
      <div className="flex justify-between items-center border-b border-purple-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Estudios Previos y Documentación Inicial
          </h3>
          <p className="text-sm text-slate-500">
            Análisis, recetas previas o fotografías de la primera valoración.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
        >
          {mostrarForm ? "Cerrar Panel" : "＋ Adjuntar Documento"}
        </Button>
      </div>

      {/* Formulario que se despliega */}
      {mostrarForm && (
        <form onSubmit={handleUpload} className="bg-purple-50/50 p-5 rounded-xl border border-purple-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="nombre" className="text-xs font-semibold text-slate-700">
                Título o Nombre del Documento *
              </Label>
              <Input id="nombre" name="nombre" placeholder="Ej. Biometría Hemática" required className="bg-white" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="file" className="text-xs font-semibold text-slate-700">
                Archivo (PDF o Imagen) *
              </Label>
              <Input id="file" name="file" type="file" accept=".pdf,image/*" required className="bg-white file:text-violet-700 file:font-semibold" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="descripcion" className="text-xs font-semibold text-slate-700">
              Descripción o Hallazgos
            </Label>
            <Input id="descripcion" name="descripcion" placeholder="Ej. Glucosa y triglicéridos elevados" className="bg-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMostrarForm(false)} disabled={subiendo}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={subiendo} className="bg-violet-600 hover:bg-violet-700 text-white">
              {subiendo ? "Guardando en la nube..." : "Guardar en Expediente"}
            </Button>
          </div>
        </form>
      )}

      {/* Lista de archivos subidos */}
      {archivosIniciales.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
          No hay documentos adjuntos en la historia inicial.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {archivosIniciales.map((arc) => (
            <div key={arc.id} className="flex items-start justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
              <div className="space-y-1 pr-3 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{arc.tipo === "PDF" ? "📄" : "🖼️"}</span>
                  <a href={arc.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-violet-900 hover:underline truncate">
                    {arc.nombre}
                  </a>
                </div>
                {arc.descripcion && <p className="text-xs text-slate-500 truncate">{arc.descripcion}</p>}
                <span className="text-[10px] text-slate-400 block">
                  {new Date(arc.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={arc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-violet-600 hover:text-violet-800 bg-violet-50 px-2 py-1 rounded">Ver</a>
                <button type="button" onClick={async () => { if (confirm("¿Eliminar este documento?")) await eliminarArchivo(arc.id, arc.url, pacienteId); }} className="text-slate-400 hover:text-red-500 text-xs px-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}