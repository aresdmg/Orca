import axios from "axios"
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify"
import { users } from "../../db/schema"
import { eq } from "drizzle-orm"
import AuthService from "./auth.service"

const authRoute: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    app.get(
        "/auth/github/callback",
        async (req: FastifyRequest, reply: FastifyReply) => {
            const token = await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)
            const accessToken = token.token.access_token


            const headers = {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json"
            }

            const [userInfo, userEmail] = await Promise.all([
                axios.get(`https://api.github.com/user`, { headers }),
                axios.get(`https://api.github.com/user/emails`, { headers })
            ])

            const primaryEmail = userEmail.data.find((e: any) => e.primary)?.email

            const authService = new AuthService(app)
            const user = await authService.save({ name: userInfo.data.name, avatar: userInfo.data.avatar_url, email: primaryEmail })

            const jwtToken = app.jwt.sign(
                {
                    id: user.id,
                    name: user.name
                },
                {
                    expiresIn: "15m"
                }
            )

            return reply
                .setCookie("orcaSessionToken", jwtToken, { httpOnly: true, secure: false, path: "/", sameSite: "lax" })
                .redirect(`${process.env.FE_URL!}/console`)
        }
    )
}

export default authRoute
