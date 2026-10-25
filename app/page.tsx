import { auth, signIn } from "../auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

// Agregamos esta línea para autorizar la lectura de sesión en Next.js 16
export const instant = false;

export default async function LoginPage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/pacientes"); // Si ya entró, va al menú
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center border border-slate-200">
        <h1 className="text-xl font-bold mb-2 text-slate-800">Clínica Homeopática (https://homeopatia.app)</h1>
         <h1 className="text-sm font-bold mb-2 text-slate-800">by Homeopata Arizaí Ahumada</h1>
        <p className="text-slate-500 mb-8">Acceso restringido al personal autorizado.</p>
        <form action={async () => { "use server"; await signIn("google"); }}>
          <Button type="submit" className="w-full text-base" size="lg">Iniciar sesión con Google</Button>
        </form>
      </div>
    </main>
  );
}