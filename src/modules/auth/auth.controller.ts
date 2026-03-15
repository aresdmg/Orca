import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";
import { installations, usersToken } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import crypto from "node:crypto";
import * as authRepo from "../auth/auth.repository"
import hashRefreshToken from "../../utils/hash-token";

export const handleGithubCallback = async (req: FastifyRequest, reply: FastifyReply) => {
    const app = req.server

    const token = await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)
    const accessToken = token.token.access_token

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Orca"
    }

    const [userInfo, userEmail] = await Promise.all([
        axios.get(`https://api.github.com/user`, { headers }),
        axios.get(`https://api.github.com/user/emails`, { headers })
    ])

    const primaryEmail = userEmail.data.find((e: any) => e.primary)?.email

    const user = await authRepo.save(app, { name: userInfo.data.name, avatar: userInfo.data.avatar_url, email: primaryEmail, username: userInfo.data.login })

    const jwtToken = app.jwt.sign(
        {
            id: user.id,
            name: user.name,
            username: user.username
        },
        {
            expiresIn: "60m"
        }
    )

    const [existingInstallation] = await app.db
        .select()
        .from(installations)
        .where(
            eq(installations.githubAccount, user.username!)
        )
        .limit(1)

    const refreshToken = crypto.randomBytes(64).toString("hex")
    const hashedRefreshToken = hashRefreshToken(refreshToken)

    authRepo.saveRefreshToken(app, hashedRefreshToken, user.id, req.headers["user-agent"] ?? null, req.ip)
    const installUrl = "https://github.com/apps/" + process.env.GITHUB_APP_NAME + "/installations/new";

    if (!existingInstallation) {
        return reply
            .setCookie("orca_access_token", jwtToken, { httpOnly: true, secure: false, path: "/", sameSite: "lax", maxAge: 1000 * 60 * 15 })
            .setCookie("orca_refresh_token", refreshToken, { httpOnly: true, secure: false, path: "/", sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 30 })
            .redirect(installUrl);
    }

    return reply
        .setCookie("orca_access_token", jwtToken, { httpOnly: true, secure: false, path: "/", sameSite: "lax", maxAge: 1000 * 60 * 15 })
        .setCookie("orca_refresh_token", refreshToken, { httpOnly: true, secure: false, path: "/", sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 30 })
        .redirect(`${process.env.FE_URL!}/console`)
}

export const handleLogout = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user as string
    const refreshToken = req.cookies?.orca_refresh_token

    const app = req.server

    if (!userId || !refreshToken) {
        throw app.httpErrors.unauthorized("Unauthorized request")
    }
    const hashedRefreshToken = hashRefreshToken(refreshToken)

    await app.db
        .update(usersToken)
        .set({
            revoked: true
        })
        .where(
            and(
                eq(usersToken.refreshToken, hashedRefreshToken),
                eq(usersToken.userId, userId),
                eq(usersToken.revoked, false)
            )
        )

    return reply
        .clearCookie("orca_access_token", { path: "/" })
        .clearCookie("orca_refresh_token", { path: "/" })
}

export const handleWebhooks = async (req: FastifyRequest, reply: FastifyReply) => {
    const event = req.headers["x-github-event"]

    if (event === "installation") {
        const app = req.server
        const body = req.body as any

        const installationId = body.installation.id
        const githubAccount = body.installation.account.login
        const accountType = body.installation.account.type === "Organization" ? "organization" : "user"

        const [installation] = await app.db
            .insert(installations)
            .values({
                installationId,
                githubAccount,
                accountType
            })
            .returning()

        if (!installation) {
            throw app.httpErrors.internalServerError("Failed to save installation")
        }
    }

    reply.send({ ok: true })
}