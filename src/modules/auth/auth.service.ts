import { FastifyInstance } from "fastify";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const save = async (app: FastifyInstance, data: { name: string, email: string, avatar: string, username: string }) => {
    if (!data.name || !data.email || !data.avatar) {
        throw app.httpErrors.internalServerError("Missing information")
    }

    const [existingUser] = await app.db.select().from(users).where(eq(users.email, data.email))
    if (!existingUser) {
        const [user] = await app.db
            .insert(users)
            .values(
                {
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar,
                    githubId: data.username,
                }
            )
            .returning()

        if (!user) {
            throw app.httpErrors.internalServerError("Failed to create user")
        }

        return { id: user.id, name: user.name, username: user.githubId }
    } else {
        return { id: existingUser.id, name: existingUser.name, username: existingUser.githubId }
    }
}
