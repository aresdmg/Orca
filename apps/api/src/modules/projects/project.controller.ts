import { FastifyReply, FastifyRequest } from "fastify";
import { CreateBody } from "./project.types";
import * as service from "../projects/project.service"
import { JWTPayloadType } from "../users/users.types";

export const createProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const db = req.server.db

    const body = req.body as CreateBody
    const user = req.user as JWTPayloadType

    const data = await service.createProject(db, body, user)
    const formattedData = {
        id: data.id,
        name: data.name,
        fullName: data.fullName,
        isPrivate: data.isPrivate
    }

    return reply.status(201).send({ ...formattedData })
}
