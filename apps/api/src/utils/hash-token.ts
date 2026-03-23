import crypto from "crypto"

export default function hashRefreshToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex")
}