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
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
    signingKey: JSON.stringify({
      kty: "oct",
      kid: process.env.NEXTAUTH_SIGNING_KID,
      alg: "HS512",
      k: process.env.NEXTAUTH_SIGNING_KEY
    })
  }
  // callbacks: {
  //   async signIn(user, account, profile) {
  //     // TODO: use fetcher, pull admins
  //     return true
  //   }
  // }
})
