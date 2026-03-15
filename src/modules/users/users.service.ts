import { FastifyInstance } from "fastify";
import { jwtPayloadType } from "./users.types";
import { installations, users } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import axios from "axios";
import { generateGithubJWT } from "../../utils/github";

export const getUserRepos = async (app: FastifyInstance, userFromJwt: jwtPayloadType) => {
    const [user] = await app.db
        .select()
        .from(users)
        .where(
            and(
                eq(users.id, userFromJwt.id),
                eq(users.githubId, userFromJwt.username)
            )
        ).limit(1)

    if (!user) {
        throw app.httpErrors.unauthorized("Unauthorized user")
    }

    const [installation] = await app.db
        .select()
        .from(installations)
        .where(
            and(
                eq(installations.githubAccount, user.githubId as string)
            )
        ).limit(1)

    if (!installation) {
        throw app.httpErrors.notFound("Installation not found")
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
        app.log.error(error)
    }

    if (!installationToken) {
        throw app.httpErrors.internalServerError("Failed to get the installation token")
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
        app.log.error(error)
    }
}