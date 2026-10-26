import prisma from "@/lib/prisma";
import FormularioSubirArchivo from "./FormularioSubirArchivo";
import { Button } from "@/components/ui/button";
import { eliminarArchivo } from "@/app/actions/archivos.actions";

export const instant = false;

export default async function ArchivosPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // Traemos TODOS los archivos de este paciente ordenados por fecha
  const archivos = await prisma.archivo.findMany({
    where: { paciente_id: pacienteId },
    orderBy: { creado_en: "desc" },
  });

  return (
    <div className="pb-12 mt-4 space-y-6">
      
      {/* Cabecera y Botón para Subir */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Archivos y Estudios Clínicos</h2>
          <p className="text-sm text-slate-500">Documentos, laboratorios y fotografías anexas al expediente.</p>
        </div>
        <FormularioSubirArchivo pacienteId={pacienteId} />
      </div>

      {/* Cuadrícula de Archivos */}
      {archivos.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center border-dashed border-slate-300">
          <div className="text-4xl mb-4">☁️</div>
          <h3 className="text-lg font-bold text-slate-700">Sin archivos en la nube</h3>
          <p className="text-slate-500 mt-2">Haz clic en el botón superior para subir estudios o imágenes a Vercel Blob.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivos.map((archivo) => {
            const fecha = new Date(archivo.creado_en).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
            // Tu función los guarda como "IMAGEN" o "PDF" (o OTRO)
            const esImagen = archivo.tipo === "IMAGEN";

            // Envolvemos tu función de eliminar para usarla en el form
            const handleEliminar = eliminarArchivo.bind(null, archivo.id, archivo.url, pacienteId);

            return (
              <div key={archivo.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                
                {/* Previsualización del archivo */}
                <a href={archivo.url} target="_blank" rel="noopener noreferrer" className="h-48 bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden relative">
                  {esImagen ? (
                    <img src={archivo.url} alt={archivo.nombre} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="text-6xl text-rose-300 group-hover:scale-110 transition-transform">📄</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Abrir archivo ↗
                    </span>
                  </div>
                </a>

                {/* Detalles del archivo */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-2">{archivo.nombre}</h4>
                  
                  {archivo.descripcion && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{archivo.descripcion}</p>
                  )}
                  
                  <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded ${esImagen ? 'text-sky-600 bg-sky-50' : 'text-rose-600 bg-rose-50'}`}>
                      {archivo.tipo}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-400">{fecha}</span>
                      
                      {/* Botón de Eliminar que llama a tu propio Server Action */}
                      <form action={handleEliminar}>
                        <button type="submit" className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Eliminar archivo">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}