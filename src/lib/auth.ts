import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Development Switcher",
      credentials: {
        email: { label: "Email", type: "email" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Dev/testing backdoor to quickly switch roles in localhost
        const email = credentials.email.toLowerCase();
        let user = await db.user.findUnique({
          where: { email },
        });

        // Auto-create or ensure user exists with requested role
        if (!user) {
          // Find or create a default committee for officers and members
          let committeeId: string | undefined;
          if (credentials.role === "OFFICER" || credentials.role === "MEMBER") {
            const committee = await db.committee.findFirst();
            if (committee) {
              committeeId = committee.id;
            } else {
              const newComm = await db.committee.create({
                data: {
                  name: "Marketing",
                  description: "Marketing and Public Relations Committee",
                },
              });
              committeeId = newComm.id;
            }
          }

          user = await db.user.create({
            data: {
              email,
              name: email.split("@")[0].toUpperCase(),
              role: (credentials.role as Role) || Role.APPLICANT,
              committeeId,
              isActive: true,
              totalPoints: credentials.role === "MEMBER" ? 35 : 0,
            },
          });
        } else if (credentials.role && user.role !== credentials.role) {
          // Update role if explicitly requested in switcher
          user = await db.user.update({
            where: { id: user.id },
            data: { role: credentials.role as Role },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const emailDomain = user.email.split("@")[1];
        // Restrict strictly to .edu or g.edu
        return emailDomain.endsWith(".edu") || emailDomain === "g.edu";
      }
      return true; // Credentials sign-in is allowed
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // Handle session updates (e.g. dynamic role changes, points)
      if (trigger === "update" && session) {
        token.role = session.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
