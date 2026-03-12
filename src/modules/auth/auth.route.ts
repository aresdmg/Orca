import axios from "axios"
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest, FastifySchema } from "fastify"
import * as authService from "../auth/auth.service"
import { installations } from "../../db/schema"
import { eq } from "drizzle-orm"

const authRoute: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    app.get(
        "/auth/github/callback",
        async (req: FastifyRequest, reply: FastifyReply) => {
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

            console.log(userInfo.data)

            const user = await authService.save(app, { name: userInfo.data.name, avatar: userInfo.data.avatar_url, email: primaryEmail, username: userInfo.data.login })

            const jwtToken = app.jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    username: user.username
                },
                {
                    expiresIn: "15m"
                }
            )

            const [existingInstallation] = await app.db
                .select()
                .from(installations)
                .where(
                    eq(installations.githubAccount, user.username!)
                )
                .limit(1)

            const installUrl = "https://github.com/apps/" + process.env.GITHUB_APP_NAME + "/installations/new";

            if (!existingInstallation) {
                return reply
                    .setCookie("orca_session_token", jwtToken, { httpOnly: true, secure: false, path: "/", sameSite: "lax", maxAge: 1000 * 60 * 15 })
                    .redirect(installUrl);
            }

            return reply
                .setCookie("orca_session_token", jwtToken, { httpOnly: true, secure: false, path: "/", sameSite: "lax", maxAge: 1000 * 60 * 15 })
                .redirect(`${process.env.FE_URL!}/console`)
        }
    )

    app.get(
        "/auth/logout",
        async (req: FastifyRequest, reply: FastifyReply) => {
            return reply.clearCookie("orca_session_token", { path: "/" })
        }
    )

    app.get(
        "/github/setup",
        async (req: FastifyRequest, reply: FastifyReply) => {
            return reply.redirect(`${process.env.FE_URL!}/console`)
        }
    )

    app.post(
        "/github/webhook",
        async (req: FastifyRequest, reply: FastifyReply) => {
            const event = req.headers["x-github-event"]
            
            
            if (event === "installation") {
                const app = req.server
                const body = req.body as any

                const installationId = body.installation.id
                const githubAccount = body.installation.account.login

                const accountType = body.installation.account.type === "Organization" ? "organization" : "user"

                await app.db.insert(installations).values({
                    installationId,
                    githubAccount,
                    accountType
                })
            }

            reply.send({ ok: true })
        }
    )
}

export default authRoute
