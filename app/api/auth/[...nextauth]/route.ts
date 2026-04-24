import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getRows } from "@/lib/sheets";
import { SHEETS, ROLES, Role } from "@/lib/constants";
import { getConfig, isConfigured } from "@/lib/config";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Local Access",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const configured = isConfigured();
        
        // If not configured, allow anyone to enter as admin for testing
        if (!configured) {
          return { 
            id: "1", 
            name: "Local Admin", 
            email: credentials?.email || "admin@local.test", 
            role: "quan_ly" 
          };
        }

        // If configured, look up in sheet
        try {
          const rows = await getRows(SHEETS.NGUOI_DUNG);
          const userInfo = rows.find(row => row[0] === credentials?.email && row[3] === "active");
          if (userInfo) {
            return { 
              id: String(userInfo[0]), 
              name: String(userInfo[1]), 
              email: String(userInfo[0]), 
              role: String(userInfo[2]) 
            };
          }
        } catch (e) {
          console.error("Local Auth Error:", e);
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "credentials") return true;

      try {
        const rows = await getRows(SHEETS.NGUOI_DUNG);
        const userInfo = rows.find(row => row[0] === user.email && row[3] === "active");
        return !!userInfo;
      } catch (error) {
        console.error("Auth SignIn Error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        const userWithRole = user as { role?: Role };
        token.role = userWithRole.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

// Add Google provider if configured
const config = getConfig();
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
  authOptions.providers.push(
    GoogleProvider({
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    })
  );
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
