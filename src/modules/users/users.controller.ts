import { FastifyReply, FastifyRequest } from "fastify";
import * as userService from "../users/users.service"
import { jwtPayloadType } from "./users.types";


export const getUserRepos = async (req: FastifyRequest, reply: FastifyReply) => {

    const user = req.user as jwtPayloadType
    const app = req.server

    const repos = await userService.getUserRepos(app, user)

    return reply.send(repos)
}