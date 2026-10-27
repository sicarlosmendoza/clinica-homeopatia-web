import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { obtenerPacientes } from "../actions/pacientes.actions";
import Link from "next/link";

export const instant = false;

export default async function PacientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q || "";
  
  const pacientes = await obtenerPacientes(query);

  return (
    <div className="space-y-6">
      
      {/* BOTÓN DE REGRESO AL DASHBOARD */}
      <div>
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-800">
          ← Regresar al Dashboard
        </Link>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Directorio de Pacientes</h1>
          <p className="text-sm text-slate-500">Gestión de expedientes clínicos</p>
        </div>
        
        {/* Barra de búsqueda y botón nuevo */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <form method="GET" className="flex items-center gap-2 flex-1 md:w-80">
            <Input 
              type="search" 
              name="q" 
              defaultValue={query} 
              placeholder="Buscar nombre, correo o teléfono..." 
              className="w-full bg-white" 
            />
            <Button type="submit" variant="secondary">Buscar</Button>
          </form>
          <Link href="/pacientes/nuevo">
            <Button className="bg-teal-600 hover:bg-teal-700">✚ Agregar Paciente</Button>
          </Link>
        </div>
      </header>

      {/* Listado de pacientes */}
      <div className="bg-white rounded-lg border shadow-sm">
        {pacientes.length === 0 ? (
          <p className="text-sm text-slate-500 py-12 text-center border-dashed rounded-md">
            No se encontraron pacientes registrados.
          </p>
        ) : (
          <div className="divide-y">
            {pacientes.map((paciente) => (
              <div key={paciente.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded">
                      {paciente.folio}
                    </span>
                    <p className="font-bold text-slate-900">{paciente.nombre_completo}</p>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex gap-3">
                    <span>📱 {paciente.telefono || "Sin teléfono"}</span>
                    <span>✉️ {paciente.correo_electronico || "Sin correo"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/pacientes/${paciente.id}/editar`}>
                    <Button variant="outline" size="sm">✏️ Editar</Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">🗑️ Eliminar</Button>
                  
                  {/* Botón para ver el expediente (se mantiene igual) */}
                  <Link href={`/pacientes/${paciente.id}`}>
                    <Button size="sm" className="bg-slate-900 hidden sm:inline-flex">Ver Expediente</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}