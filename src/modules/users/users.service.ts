import { installations, projects, users } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import axios from "axios";
import { generateGithubJWT } from "../../utils/github";
import { JWTPayloadType } from "./users.types";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { AppError } from "../../utils/error/app-error";

export const getUserRepos = async (db: NodePgDatabase<Record<string, unknown>>, userFromJwt: JWTPayloadType) => {
    const [user] = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.id, userFromJwt.id),
                eq(users.githubId, userFromJwt.username)
            )
        ).limit(1)

    if (!user) {
        throw new AppError("User not found", 404, "NOT_FOUND")
    }

    const [installation] = await db
        .select()
        .from(installations)
        .where(
            and(
                eq(installations.githubAccount, user.githubId as string)
            )
        ).limit(1)

    if (!installation) {
        throw new AppError("Installation not found", 404, "NOT_FOUND")
    }

    const githubJWT = generateGithubJWT();

    let installationToken;
    try {
        const res = await axios.post(`https://api.github.com/app/installations/${installation.installationId}/access_tokens`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${githubJWT}`,
                    Accept: "application/vnd.github+json"
                }
            }
        )

        if (res.status === 201) {
            installationToken = res.data?.token
        }
    } catch (error) {
        throw new Error(error as string)
    }

    if (!installationToken) {
        throw new AppError("Failed to get the installation token", 500, "INTERNAL_SERVER_ERROR")
    }

    try {
        const res = await axios.get(`https://api.github.com/installation/repositories`,
            {
                headers: {
                    Authorization: `Bearer ${installationToken}`,
                    Accept: "application/vnd.github+json"
                }
            }
        )

        return res.data
    } catch (error) {
        throw new Error(error as string)
    }
}

export const getUserProjects = async (db: NodePgDatabase<Record<string, unknown>>, userFromJwt: JWTPayloadType) => {
    if (!userFromJwt) {
        throw new AppError("Unauthrorized request", 401, "UNAUTHORIZED_REQUEST")
    }

    const userId = userFromJwt.id

    const projectsFromDB = await db
        .select()
        .from(projects)
        .where(
            eq(projects.userId, userId)
        )

    return projectsFromDB
}

export const getMe = async (db: NodePgDatabase<Record<string, unknown>>, userFromJwt: JWTPayloadType) => {
    const [user] = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.id, userFromJwt.id),
                eq(users.email, userFromJwt.email),
            )
    )
        .limit(1)

    if (!user) {
        throw new AppError("User not found", 404, "NOT_FOUND")
    }
    
    return user
}
