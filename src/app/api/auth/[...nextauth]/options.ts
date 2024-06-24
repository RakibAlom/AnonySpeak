import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: { label: "Password", type: "password" },
            },
            async authorize (credentials: any): Promise<any> {
                
                await dbConnect()
               
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {email: credentials.indentifier},
                            {username: credentials.indentifier},
                        ]
                    })
                    
                    if(!user) {
                        throw new Error('No user found with this email')
                    }
                    
                    if(!user.isVerified) {
                        throw new Error('Please verify your account email before login')
                    }

                   const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                   if(isPasswordCorrect) {
                    return user
                   } else {
                    throw new Error('Incorrect Password')
                   }

                } catch (err: any) {
                    throw new Error(err)
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            return session
        },
        async jwt({ token, user}) {
            return token
        }
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
}