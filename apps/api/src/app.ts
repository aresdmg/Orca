import Fastify from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import config from "./config/config";
import db from "./plugin/db";
import authRoute from "./modules/auth/auth.route";
import oauth from "./plugin/oauth";
import auth from "./plugin/auth";
import { usersRoute } from "./modules/users/users.route";
import { projectRoute } from "./modules/projects/project.routes";
import handleInternalRoutes from "./utils/private";

export default function bootstarp() {
    const app = Fastify({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname'
                }
            }
        }
    }).withTypeProvider<ZodTypeProvider>()

    config(app)

    app.register(db)
    app.register(oauth)

    app.register(auth)

    // Route
    app.register(authRoute);
    app.register(usersRoute, { prefix: "/api/v1/user" });
    app.register(projectRoute, { prefix: "/api/v1/projects" })
    handleInternalRoutes(app)
    return app
}
