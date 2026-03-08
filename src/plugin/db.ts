import { drizzle } from "drizzle-orm/node-postgres"
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import initDB from "../db";
import fp from "fastify-plugin";

declare module "fastify" {
    interface FastifyInstance {
        db: ReturnType<typeof drizzle>
    }
}

const databasePlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
    const { db, pool } = initDB()

    app.decorate("db", db)

    app.addHook("onClose", () => {
        pool.end()
    })
}

export default fp(databasePlugin)
