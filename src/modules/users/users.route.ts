import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import * as usersController from "./users.controller";

export const usersRoute = (app: FastifyInstance, _opts: FastifyPluginOptions) => {
    app.get(
        "/repos",
        { preHandler: [app.auth] },
        async (req: FastifyRequest, reply: FastifyReply) => usersController.getUserRepos(req, reply)
    )
}