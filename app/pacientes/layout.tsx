import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  const primerNombre = session?.user?.name?.split(' ')[0] || "Usuario";

  return (
    <div className="min-h-screen bg-slate-50/60">
      
      {/* BARRA SUPERIOR: Fondo blanco, borde inferior lila suave y línea decorativa azul superior */}
      <header className="bg-white/90 backdrop-blur-md border-b border-purple-100 border-t-4 border-t-sky-500 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* LOGO HOMEOSYS EN VIOLETA Y ROSA */}
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
                <Link 
                  href="/catalogos" 
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-purple-700 hover:bg-purple-50/50 transition-colors"
                >
                  Catálogos
                </Link>
              </nav>
            </div>

            {/* ZONA DE USUARIO */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-full">
                ✨ Dra. {primerNombre}
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