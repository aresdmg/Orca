import { users, usersToken } from "../../db/schema"
import { eq } from "drizzle-orm"
import { NodePgDatabase } from "drizzle-orm/node-postgres"
import { AppError } from "../../utils/error/app-error"

export const save = async (db: NodePgDatabase<Record<string, unknown>>, data: { name: string, email: string, avatar: string, username: string }) => {
    if (!data.name || !data.email || !data.avatar) {
        throw new AppError("Invalid inputs", 400, "VALIDATION_ERROR")
    }

    const [existingUser] = await db
        .select()
        .from(users)
        .where(
            eq(users.email, data.email)
        )

    if (!existingUser) {
        const [user] = await db
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
            throw new AppError("User creation failed", 500, "INTERNAL_SERVER_ERROR")
        }

        return { id: user.id, name: user.name, username: user.githubId }
    } else {
        return { id: existingUser.id, name: existingUser.name, username: existingUser.githubId }
    }
}

export const saveRefreshToken = async (db: NodePgDatabase<Record<string, unknown>>, hashedRefreshToken: string, userId: string, userAgent: string | null, ipAddress: string) => {
    try {
        await db.insert(usersToken).values({
            refreshToken: hashedRefreshToken,
            userId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            userAgent,
            ipAddress,
        })
    } catch (error) {
        throw new AppError("Database failed", 500, "INTERNAL_SERVER_ERROR")
    }
}
