
import NextAuth, { NextAuthOptions, Session } from "next-auth"
import jwtDecode from "jwt-decode";
import { randomBytes, randomUUID } from "crypto";
import { Sequelize } from "sequelize";
import SequelizeAdapter from "@next-auth/sequelize-adapter";
import { decodeJwt } from 'jose';


// const sequelize = new Sequelize("sqlite::memory:")
// const adapter = SequelizeAdapter(sequelize)

// // Calling sync() is not recommended in production
// sequelize.sync()

const isStoreIdToken = process.env.NEXT_ENABLE_STORING_ID_TOKEN && process.env.NEXT_ENABLE_STORING_ID_TOKEN.toLowerCase() === "true";
export const authOptions: NextAuthOptions = {
    providers: [
        {
            id: "asgardeo",
            name: "Asgardeo",
            clientId: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_SECRET,
            issuer: "https://api.asgardeo.io/t/" + process.env.NEXT_PUBLIC_ASGARDEO_ORGANIZATION_NAME + "/oauth2/token",
            userinfo: "https://api.asgardeo.io/t/" + process.env.NEXT_PUBLIC_ASGARDEO_ORGANIZATION_NAME + "/oauth2/userinfo",
            type: "oauth",
            wellKnown: "https://api.asgardeo.io/t/" + process.env.NEXT_PUBLIC_ASGARDEO_ORGANIZATION_NAME + "/oauth2/token/.well-known/openid-configuration",
            authorization: {
                params:
                    { 
                        scope: "openid profile groups urn:senthalan:backendservicepythonitems:add_item"
                    }
            },
            idToken: true,
            checks: ["pkce", "state"],
            profile(profile) {
                console.log("profile: " + JSON.stringify(profile));

                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    groups: profile.groups,
                }
            },
        },
    ],
    // adapter: SequelizeAdapter(sequelize),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",

        // Seconds - How long until an idle session expires and is no longer valid.
        maxAge: 30 * 24 * 60 * 60, // 30 days

        // Seconds - Throttle how frequently to write to database to extend a session.
        // Use it to limit write operations. Set to 0 to always update the database.
        // Note: This option is ignored if using JSON Web Tokens
        updateAge: 24 * 60 * 60, // 24 hours
        
        // The session token is usually either a random UUID or string, however if you
        // need a more customized session token string, you can define your own generate function.
        generateSessionToken: () => {
            return randomUUID?.() ?? randomBytes(32).toString("hex")
        }
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }: any) {
            console.log("signed In : " + JSON.stringify(user));
            return true
        },
        async session({ session, token, user }: any) {

            if (!session?.user || !token?.accessToken) {
                console.error('No accessToken found on token or session');
                return session;
            }
            console.log("session: " + JSON.stringify(session));
            console.log("token: " + JSON.stringify(token));
            console.log("isStoreIdToken: " + isStoreIdToken)
            if (isStoreIdToken) {
                session.idToken = token.idToken as string;
            }
            session.user = token.user;
            session.user.scope =  token.scope;
            session.user.current_acr =  token.current_acr;
            session.error = token.error as string | undefined;
            return session;

            // if (token) {
            //     const decodedAccessToken: any = jwtDecode(token.accessToken);
            //     session.user.scope =  decodedAccessToken.scope;
            //     session.idToken = token.idToken;
            // }

            // return session;
        },
        // need to handle token refresh https://next-auth.js.org/tutorials/refresh-token-rotation
        // return value is added to Session
        async jwt({ token, user, account, profile, isNewUser, session }) {
            // Initial sign in
            if (account && user) {
                const { id_token, access_token, refresh_token, expires_at } = account;
                const tokenDecoded = decodeJwt(access_token as string);
                console.log("tokenDecoded: " + JSON.stringify(tokenDecoded));
                let stored_id_token = id_token;
                console.log("isStoreIdToken: " + isStoreIdToken)
                if (!isStoreIdToken) {
                    stored_id_token = ""
                }
                console.log("stored_id_token: " + stored_id_token)
                return {
                    // save token to session for authenticating to AWS
                    // https://next-auth.js.org/configuration/callbacks#jwt-callback
                    accessToken: access_token,
                    accessTokenExpires: expires_at ? expires_at * 1000 : 0,
                    refreshToken: refresh_token,
                    idToken: stored_id_token,
                    scope: tokenDecoded.scope,
                    current_acr: tokenDecoded.current_acr,
                    user,
                };
            }
  
            // already logged-in
            // refresh access token if needed
            // return await refreshTokensIfNeeded(session);
            return token;
      }
    },
    theme: {
        colorScheme: "light",
    },
    debug: true,
}

export default NextAuth(authOptions);
