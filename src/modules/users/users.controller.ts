import { FastifyReply, FastifyRequest } from "fastify";
import * as userService from "../users/users.service"
import { IUserRepo, JWTPayloadType, } from "./users.types";
import { AppError } from "../../utils/error/app-error";


export const getUserRepos = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as JWTPayloadType
    const db = req.server.db

    const repos = await userService.getUserRepos(db, user)

    const formattedReply = {
        total_count: repos?.total_count,
        repository_selection: repos?.repository_selection,
        repositories: (repos?.repositories ?? []).map((r: IUserRepo) => ({
            id: String(r.id),
            name: r.name,
            full_name: r.full_name,
            private: r.private,
            language: r.language ?? "",
            clone_url: r.clone_url,
            html_url: r.html_url
        }))
    }
    return reply.status(200).send(formattedReply)
}

export const getUserProjects = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as JWTPayloadType
    const db = req.server.db

    const projects = await userService.getUserProjects(db, user)

    return reply.status(200).send({ projects })
}

export const getMe = async (req: FastifyRequest, reply: FastifyReply) => {
    const userFromJWT = req.user as JWTPayloadType
    const db = req.server.db
    
    if (!userFromJWT) {
        throw new AppError("Unauthorized request", 401, "UNAUTHORIZED_REQUEST")
    }
    
    const userInfo = await userService.getMe(db, userFromJWT)
    const properUserInfo = {
        id: userInfo.id,
        name: userInfo.name,
        username: userInfo.githubId,
        email: userInfo.email,
        role: userInfo.role,
        avatar: userInfo.avatar,
    }
    
    return reply.status(200).send(properUserInfo)
}