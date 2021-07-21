import NextAuth from "next-auth"
import Providers from "next-auth/providers"

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_ID
    })
  ],
  callbacks: {
    async SigningKeyContext(user, account, profile) {
      // TODO: use fetcher, pull admins
      return true
    }
  }
})
