import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ profile }) {
      return profile?.login === process.env.ADMIN_GITHUB_LOGIN
    },
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
      if (isAdminRoute) return !!auth?.user
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
})