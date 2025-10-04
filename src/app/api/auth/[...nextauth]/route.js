import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from '../../../../../lib/prisma'

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {


                if (!credentials?.email || !credentials?.password) {
                    console.log('Missing credentials');
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    },
                })



                if (!user || !user.password) {
                    console.log('No user or no password');
                    return null
                }

                const isValid = await bcrypt.compare(credentials.password, user.password)


                if (!isValid) {
                    console.log('Invalid password');
                    return null
                }


                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: 'USER',
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = 'USER'
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub
                session.user.role = 'USER'
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }