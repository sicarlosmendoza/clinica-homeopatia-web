import { obtenerTodasLasSedes, crearSede, alternarEstadoSede, eliminarSede } from "@/app/actions/agenda.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image"; // Para mostrar la miniatura si hay imagen

export const instant = false;

export default async function CatalogoSedesPage() {
  const sedes = await obtenerTodasLasSedes();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">

      <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-800">← Regresar al Dashboard</Link>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Catálogo de Sedes</h1>
          <p className="text-slate-600">Administra (Altas, Bajas y Cambios) de tus consultorios.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Alta de Sede */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="font-bold text-slate-800 mb-4 text-lg">✚ Alta de Sede</h2>
          
          <form action={async (formData) => {
            "use server";
            await crearSede(formData);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Consultorio *</label>
              <input type="text" name="nombre" required placeholder="Ej. Clínica Zapopan" className="w-full p-2.5 border rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Breve</label>
              <textarea name="descripcion" placeholder="Ej. Consultorio ubicado en el piso 3..." className="w-full p-2.5 border rounded-xl h-20 resize-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Pública</label>
              <input type="text" name="direccion" placeholder="Calle, Número, Colonia..." className="w-full p-2.5 border rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Enlace de Google Maps</label>
              <input type="url" name="link_maps" placeholder="https://maps.app.goo.gl/..." className="w-full p-2.5 border rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de Contacto</label>
              <input type="text" name="telefono" className="w-full p-2.5 border rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Foto de la Sede</label>
              <input type="file" name="imagen" accept="image/*" className="w-full p-2 border rounded-xl bg-slate-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color distintivo</label>
              <select name="color" className="w-full p-2.5 border rounded-xl bg-white">
                <option value="blue">Azul Clínico</option>
                <option value="purple">Morado Homeopatía</option>
                <option value="teal">Verde Esmeralda</option>
                <option value="rose">Rosa Suave</option>
                <option value="amber">Ámbar</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
              Registrar Sede
            </Button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Lista (Cambios y Bajas) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-800 mb-4 text-lg">Catálogo Vigente ({sedes.length})</h2>
          
          {sedes.map((sede) => {
            return (
              <div key={sede.id} className={`bg-white p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${sede.activo ? 'border-l-4 border-l-emerald-500 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50'}`}>
                <div className="flex gap-4 items-center">
                  {/* Miniatura de la imagen */}
                  {sede.imagen_url ? (
                     <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sede.imagen_url} alt={sede.nombre} className="object-cover w-full h-full" />
                     </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-2xl border border-slate-200 text-slate-300">
                      🏢
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{sede.nombre}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sede.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {sede.activo ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">{sede.direccion || "Sin dirección"}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>{sede.telefono || "Sin teléfono"}</span>
                      {sede.link_maps && <a href={sede.link_maps} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">🗺️ Ver Mapa</a>}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <form action={async () => {
                    "use server";
                    await alternarEstadoSede(sede.id, sede.activo);
                  }}>
                    <Button type="submit" variant="secondary" size="sm" className="h-8">
                      {sede.activo ? 'Apagar' : 'Prender'}
                    </Button>
                  </form>

                  <Link href={`/catalogos/sedes/${sede.id}/editar`}>
                    <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                      Editar
                    </Button>
                  </Link>

                  <form action={async () => {
                    "use server";
                    await eliminarSede(sede.id);
                  }}>
                    <Button type="submit" variant="destructive" size="sm" className="h-8">
                      Borrar
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}