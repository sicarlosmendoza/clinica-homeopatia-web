import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  const primerNombre = session?.user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="min-h-screen bg-slate-50/60">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="bg-white/90 backdrop-blur-md border-b border-purple-100 border-t-4 border-t-sky-500 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo HomeoSys */}
            <div className="flex items-center gap-8">
              <Link href="/pacientes" className="flex items-center gap-2 group">
                <span className="text-2xl transition-transform group-hover:scale-110">🔮</span>
                <span className="font-extrabold text-xl bg-gradient-to-r from-violet-700 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                  HomeoSys
                </span>
              </Link>
              
              <nav className="hidden md:flex space-x-6 h-full items-center">
                <Link 
                  href="/pacientes" 
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-violet-900 bg-violet-50 transition-colors"
                >
                  Pacientes
                </Link>
                <Link 
                  href="/consultas" 
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-purple-700 hover:bg-purple-50/50 transition-colors"
                >
                  Consultas
                </Link>
                {/* MENÚ DESPLEGABLE: CATÁLOGOS */}
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-purple-700 hover:bg-purple-50/50 transition-colors cursor-pointer">
                    Catálogos
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* La caja que aparece al pasar el mouse (dropdown) */}
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <Link 
                        href="/catalogos/sedes" 
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                      >
                        🏢 Consultorios / Sedes
                      </Link>
                      <Link 
                        href="/catalogos/medicos" 
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                      >
                        🩺 Catálogo de Médicos
                      </Link>

                      <div className="my-1 border-t border-slate-100" /> {/* Separador */}
                      
                      <Link 
                        href="/catalogos/horarios" 
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                      >
                        📆 Horarios de Atención
                      </Link>
                      
                      <div className="my-1 border-t border-slate-100" /> {/* Separador */}
                      
                      <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 rounded-lg transition-colors cursor-not-allowed" title="Próximamente">
                        💊 Remedios / Potencias
                      </span>
                      <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 rounded-lg transition-colors cursor-not-allowed" title="Próximamente">
                        💳 Pasarelas de Pago
                      </span>
                      <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 rounded-lg transition-colors cursor-not-allowed" title="Próximamente">
                        ⚙️ Integraciones
                      </span>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Datos de usuario y Salir */}
<div className="flex items-center gap-4">
  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
    👋 Hola, {primerNombre}
  </span>
              
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button 
                  type="submit" 
                  className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                >
                  Salir
                </button>
              </form>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
    </div>
  );
}