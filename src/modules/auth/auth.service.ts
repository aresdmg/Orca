import { FastifyInstance } from "fastify";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export default class AuthService {
    private app: FastifyInstance

    constructor(private fastify: FastifyInstance) {
        this.app = fastify;
    }

    save = async (data: { name: string, email: string, avatar: string }) => {
        if (!data.name || !data.email || !data.avatar) {
            throw this.app.httpErrors.internalServerError("Missing information")
        }

        const [existingUser] = await this.app.db.select().from(users).where(eq(users.email, data.email))
        if (!existingUser) {
            const [user] = await this.app.db
                .insert(users)
                .values(
                    {
                        name: data.name,
                        email: data.email,
                        avatar: data.avatar
                    }
                )
                .returning()

            if (!user) {
                throw this.app.httpErrors.internalServerError("Failed to create user")
            }

            return { id: user.id, name: user.name }
        } else {
            return { id: existingUser.id, name: existingUser.name }
        }

    }
}
