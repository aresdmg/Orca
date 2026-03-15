import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify"
import * as authController from "../auth/auth.controller"

const authRoute: FastifyPluginAsync = async (app: FastifyInstance, _opts: FastifyPluginOptions) => {
    app.get(
        "/auth/github/callback",
        async (req: FastifyRequest, reply: FastifyReply) => authController.handleGithubCallback(req, reply)
    )

    app.get(
        "/auth/logout",
        { preHandler: [app.auth] },
        async (req: FastifyRequest, reply: FastifyReply) => authController.handleLogout(req, reply)
    )

    app.get(
        "/github/setup",
        async (_req: FastifyRequest, reply: FastifyReply) => {
            return reply.redirect(`${process.env.FE_URL!}/console`)
        }
    )

    app.post(
        "/github/webhook",
        async (req: FastifyRequest, reply: FastifyReply) => authController.handleWebhooks(req, reply)
    )
}

export default authRoute
