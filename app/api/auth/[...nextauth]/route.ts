import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import { ROLES, Role } from "@/lib/constants";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Local Access",
      credentials: {
        email:    { label: "Email",    type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        try {
          const { data: user } = await supabase
            .from("nguoi_dung")
            .select("email, ho_ten, role")
            .eq("email", credentials.email)
            .eq("trang_thai", "active")
            .single();

          if (user) {
            return { id: user.email, name: user.ho_ten, email: user.email, role: user.role };
          }
        } catch (e) {
          console.error("[auth] CredentialsProvider:", e);
        }
        // Fallback: nếu không tìm thấy trong DB nhưng là môi trường dev
        if (process.env.NODE_ENV === "development") {
          return { id: "1", name: "Local Admin", email: credentials.email, role: ROLES.QUAN_LY };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "credentials") return true;

      // Google OAuth: kiểm tra email có trong bảng nguoi_dung không
      try {
        const { data } = await supabase
          .from("nguoi_dung")
          .select("email, role")
          .eq("email", user.email)
          .eq("trang_thai", "active")
          .single();
        return !!data;
      } catch (error) {
        console.error("[auth] signIn:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        const userWithRole = user as { role?: Role };
        if (userWithRole.role) {
          token.role = userWithRole.role;
        } else if (account?.provider === "google" && user.email) {
          // Google OAuth: lấy role từ DB khi issue JWT lần đầu
          const { data } = await supabase
            .from("nguoi_dung")
            .select("role")
            .eq("email", user.email)
            .single();
          token.role = data?.role as Role | undefined;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

// Thêm Google provider nếu có credentials
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authOptions.providers.push(
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
