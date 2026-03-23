import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify"
import * as controller from "../projects/project.controller"

export const projectRoute = (app: FastifyInstance, _opts: FastifyPluginOptions) => {
    app.post(
        "/create",
        { preHandler: [app.auth] },
        async (req: FastifyRequest, reply: FastifyReply) => controller.createProject(req, reply)
    )
}
