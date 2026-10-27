import { obtenerTodosLosMedicos, crearMedico, alternarEstadoMedico, eliminarMedico } from "@/app/actions/agenda.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Asegúrate de importar Link

export const instant = false;

export default async function CatalogoMedicosPage() {
  const medicos = await obtenerTodosLosMedicos();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
      
      {/* BOTÓN DE REGRESO AGREGADO AQUÍ */}
      <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-800">
        ← Regresar al Menú de Catálogos
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Catálogo de Médicos</h1>
          <p className="text-slate-600">Administra los profesionales de la salud que atienden en la clínica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* COLUMNA IZQUIERDA: Alta de Médico */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="font-bold text-slate-800 mb-4 text-lg">✚ Alta de Médico</h2>
          
          <form action={crearMedico} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre y Título *</label>
              <input type="text" name="nombre" required placeholder="Ej. Dra. Arizai..." className="w-full p-2.5 border rounded-xl" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad</label>
              <input type="text" name="especialidad" defaultValue="Médico Homeópata" className="w-full p-2.5 border rounded-xl" />
            </div>

            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
              Registrar Médico
            </Button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Lista de Médicos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-800 mb-4 text-lg">Plantilla Vigente ({medicos.length})</h2>
          
          {medicos.length === 0 && (
            <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              Aún no hay médicos registrados. Usa el formulario de la izquierda.
            </div>
          )}

          {medicos.map((medico) => {
            const toggleAccion = alternarEstadoMedico.bind(null, medico.id, medico.activo);
            const eliminarAccion = eliminarMedico.bind(null, medico.id);
            
            return (
              <div key={medico.id} className={`bg-white p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${medico.activo ? 'border-l-4 border-l-purple-500 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50'}`}>
                
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl border border-purple-200 text-purple-600">
                    🩺
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{medico.nombre}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${medico.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {medico.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{medico.especialidad}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <form action={toggleAccion}>
                    <Button type="submit" variant="secondary" size="sm" className="h-8">
                      {medico.activo ? 'Apagar' : 'Prender'}
                    </Button>
                  </form>
                  <form action={eliminarAccion}>
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