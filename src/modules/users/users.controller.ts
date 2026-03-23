import { FastifyReply, FastifyRequest } from "fastify";
import * as userService from "../users/users.service"
import { IUserRepo, JWTPayloadType,  } from "./users.types";


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
    
    console.log(formattedReply)

    return reply.send(formattedReply)
}