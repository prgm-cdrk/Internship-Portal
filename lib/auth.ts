// This file tells NextAuth:
// How to handle login (email + password)
// How to hash passwords (bcryptjs)
// Where to store users (Prisma + PostgreSQL)
// How long sessions last

import NextAuth from "next-auth"; //  the main library
import CredentialsProvider from "next-auth/providers/credentials"; // for email/password login
import bcrypt from "bcryptjs"; //for password hashing
import { PrismaClient } from "@/src/generated/prisma"; //  to query your database

// connect to database Prisma 
const prisma = new PrismaClient();

// start NextAuth Configuration
export const { handlers, auth } = NextAuth({
    providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This function handles login logic
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        // Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        // Return user object if login successful
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
    pages: {
        signIn: "/login"
    },
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
            session.user.id = token.id;
            session.user.role = token.role;
        }
        return session;
        }
    }
});
