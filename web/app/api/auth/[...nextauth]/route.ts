import NextAuth, { type AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

// 1. Export the options so other API routes can use them
export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // 2. Save the GitHub Token into the JWT (cookie)
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // 3. Expose the Token to the Client/Session
    async session({ session, token }) {
      // @ts-ignore // Ignore TypeScript complaining about custom properties for now
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };