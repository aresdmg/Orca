import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

export default function initDB() {
    const DB_URL = process.env.DATABASE_URL!
    if (!DB_URL) {
        throw new Error("database url is empty")
    }

    const pool = new Pool({
        connectionString: DB_URL,
        max: 20,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 2_000,
    })

    const db = drizzle(pool)
    return { db, pool }
}
