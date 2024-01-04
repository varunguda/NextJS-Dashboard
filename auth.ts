import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from './app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    if (user?.rows) return user.rows[0] as User;
    else return undefined;
  } catch (error) {
    console.error('failed to fetch user: ', email);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCrendentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCrendentials.success) {
          console.log('Invalid Credentials');
          return null;
        }
        const { email, password } = parsedCrendentials.data;
        const user = await getUser(email);
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) return user;
      },
    }),
  ],
});
