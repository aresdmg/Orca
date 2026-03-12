import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

declare module "fastify" {
    interface FastifyInstance {
        auth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    }
}

const authPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {

    app.decorate("auth", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            let token;

            const authHeader = request.headers.authorization
            token = authHeader && authHeader.split(" ")[1] || request.cookies?.session_token

            if (!token) {
                throw app.httpErrors.unauthorized("Missing or invalid token")
            }

            const decodedInfo = app.jwt.verify<{ id: string, name: string }>(token)
            request.user = decodedInfo.id
        } catch (error) {
            throw app.httpErrors.unauthorized("Unauthorized")
        }
    })
}

export default fp(authPlugin)
