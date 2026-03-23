import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { JWTPayloadType } from "../users/users.types";
import { CreateBody } from "./project.types";
import { installations, projects } from "../../db/schema";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/error/app-error";
import axios from "axios";
import { generateGithubJWT } from "../../utils/github";

export const createProject = async (db: NodePgDatabase<Record<string, unknown>>, data: CreateBody, user: JWTPayloadType) => {
    if (!data.name || !data.repoUrl || !data.plan || !data.fullName) {
        throw new AppError("Invalid project input", 400, "VALIDATION_ERROR");
    }

    const [existingProject] = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.userId, user.id),
                eq(projects.repoUrl, data.repoUrl)
            )
        )

    if (existingProject) {
        throw new AppError("Project already exists", 400, "PROJECT_EXISTS")
    }

    const [installation] = await db
        .select()
        .from(installations)
        .where(
            and(
                eq(installations.githubAccount, user.username)
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

    const projectFullName = user.username + "/" + data.name
    const getCommitSha = await axios.get(`https://api.github.com/repos/${projectFullName}/commits`,
        {
            headers: {
                Authorization: `Bearer ${installationToken}`,
                Accept: "application/vnd.github+json"
            }
        }
    )

    const latestCommitSha = getCommitSha.data[0]?.sha

    const [createdProject] = await db
        .insert(projects)
        .values({
            userId: user.id,
            name: data.name,
            repoUrl: data.repoUrl,
            isPrivate: data.isPrivate,
            fullName: data.fullName,
            commitSha: latestCommitSha,
        })
        .returning()

    if (!createdProject) {
        throw new AppError("Project creation failed", 500, "FAILED_PROJECT_CREATION")
    }

    return createdProject
}
