import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours (a typical hospital shift)
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminUsername || !adminPasswordHash) {
          throw new Error(
            "Authentication configuration error: ADMIN_USERNAME or ADMIN_PASSWORD_HASH is missing from environment variables."
          );
        }

        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Case-insensitive trim for username comparison
        const isUsernameMatch =
          credentials.username.trim().toLowerCase() === adminUsername.trim().toLowerCase();

        if (!isUsernameMatch) {
          return null;
        }

        // Compare password with bcrypt hash
        const isPasswordMatch = await bcrypt.compare(credentials.password, adminPasswordHash);

        if (!isPasswordMatch) {
          return null;
        }

        // Return user object on success
        return {
          id: "admin",
          name: "Radiographer",
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "",
};

/**
 * Server-side helper to get the current admin session
 */
export async function getAdminSession() {
  return await getServerSession(authOptions);
}
