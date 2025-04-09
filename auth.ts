import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { createRenderResumeDataCache } from "next/dist/server/resume-data-cache/resume-data-cache";


// Type for our stored user in MongoDB
interface DatabaseUser {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  role: "teacher" | "student";
  groups: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required !!!");
        }

        try {
          const client = await clientPromise;
          const db = client.db();

          const user = await db
            .collection<DatabaseUser>("users")
            .findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "teacher" | "student";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
