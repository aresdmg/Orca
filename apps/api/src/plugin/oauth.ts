import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin"
import oauthPlugin, { FastifyOAuth2Options } from "@fastify/oauth2"

declare module "fastify" {
    interface FastifyInstance {
        githubOAuth2: any
    }
}

const oauth: FastifyPluginAsync = async (app: FastifyInstance) => {
    const githubOAuthConfig: FastifyOAuth2Options = {
        name: "githubOAuth2",
        scope: ["user:email"],
        credentials: {
            client: {
                id: process.env.GITHUB_CLIENT_ID as string,
                secret: process.env.GITHUB_CLIENT_SECRET as string,
            },
            auth: {
                authorizeHost: "https://github.com",
                authorizePath: "/login/oauth/authorize",
                tokenHost: "https://github.com",
                tokenPath: "/login/oauth/access_token"
            }
        },
        startRedirectPath: "/auth/github",
        callbackUri: "http://localhost:4000/auth/github/callback"
    }

    app.register(oauthPlugin, githubOAuthConfig)
}

export default fp(oauth)
