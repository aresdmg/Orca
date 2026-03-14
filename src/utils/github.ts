import fs from "fs"
import jwt from "jsonwebtoken"

const privateKey = fs.readFileSync(`./github.private-key.pem`, "utf-8")

export function generateGithubJWT() {
    const now = Math.floor(Date.now() / 1000)

    const githubJWT = jwt.sign(
        {
            iat: now - 60,
            exp: now + 600,
            iss: process.env.GITHUB_APP_ID
        },
        privateKey || "some dafa",
        { algorithm: "RS256" }
    )

    return githubJWT
}
