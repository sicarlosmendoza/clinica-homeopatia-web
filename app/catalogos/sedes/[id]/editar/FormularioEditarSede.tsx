"use client";

import { useTransition } from "react";
import { actualizarSede } from "@/app/actions/agenda.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FormularioEditarSede({ sede }: { sede: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await actualizarSede(formData);
      router.push("/catalogos/sedes");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mandamos el ID oculto */}
      <input type="hidden" name="id" value={sede.id} />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Consultorio *</label>
        <input type="text" name="nombre" defaultValue={sede.nombre} required className="w-full p-3 border rounded-xl" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Breve</label>
        <textarea name="descripcion" defaultValue={sede.descripcion || ""} placeholder="Ej. Consultorio ubicado en el piso 3..." className="w-full p-3 border rounded-xl h-24 resize-none" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Pública</label>
        <input type="text" name="direccion" defaultValue={sede.direccion || ""} className="w-full p-3 border rounded-xl" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Enlace de Google Maps</label>
        <input type="url" name="link_maps" defaultValue={sede.link_maps || ""} placeholder="https://maps.app.goo.gl/..." className="w-full p-3 border rounded-xl" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de Contacto</label>
        <input type="text" name="telefono" defaultValue={sede.telefono || ""} className="w-full p-3 border rounded-xl" />
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">Foto de la Sede</label>
        
        {sede.imagen_url && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Imagen actual:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sede.imagen_url} alt={sede.nombre} className="h-32 rounded-lg object-cover border border-slate-200" />
          </div>
        )}
        
        <p className="text-xs text-slate-500 mb-1">{sede.imagen_url ? "Sube un archivo nuevo para reemplazar la imagen actual:" : "Sube una imagen para la sede:"}</p>
        <input type="file" name="imagen" accept="image/*" className="w-full p-2 border rounded-xl bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Color distintivo</label>
        <select name="color" defaultValue={sede.color || "blue"} className="w-full p-3 border rounded-xl bg-white">
          <option value="blue">Azul Clínico</option>
          <option value="purple">Morado Homeopatía</option>
          <option value="teal">Verde Esmeralda</option>
          <option value="rose">Rosa Suave</option>
          <option value="amber">Ámbar</option>
        </select>
      </div>

      <div className="pt-4 flex gap-4">
        <Link href="/catalogos/sedes" className="flex-1">
          <Button type="button" variant="outline" className="w-full h-12 rounded-xl" disabled={isPending}>Cancelar</Button>
        </Link>
        <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white h-12 rounded-xl" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}