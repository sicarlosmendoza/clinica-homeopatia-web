import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // Este callback se ejecuta CADA VEZ que alguien intenta iniciar sesión
    async signIn({ user }) {
      if (!user.email) return false; // Bloquea si no hay correo

      // 1. Buscamos el correo en nuestra tabla de usuarios de Prisma
      const usuarioAutorizado = await prisma.usuario.findUnique({
        where: { email: user.email },
      });

      // 2. Si existe en la BD y está activo, lo dejamos pasar. Si no, lo bloqueamos.
      if (usuarioAutorizado && usuarioAutorizado.activo) {
        return true;
      } else {
        console.warn(`Intento de acceso bloqueado para: ${user.email}`);
        return false; // Esto mostrará un error genérico de acceso denegado en la pantalla de Google
      }
    },
    // Añadimos datos del usuario a la sesión para poder usarlos en la app
    async session({ session, token }) {
      if (session.user && token.email) {
        const dbUser = await prisma.usuario.findUnique({
          where: { email: token.email }
        });
        
        if (dbUser) {
           // Podemos inyectar el ID de la base de datos o el Rol si lo necesitamos después
           (session.user as any).id = dbUser.id;
           (session.user as any).rol = dbUser.rol;
        }
      }
      return session;
    }
  },
  pages: {
    // Si queremos, después podemos crear una página de login bonita, por ahora usaremos la por defecto
    // signIn: '/login', 
  },
  session: { strategy: "jwt" }
});