import Fastify from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import config from "./config/config";
import db from "./plugin/db";
import authRoute from "./modules/auth/auth.route";
import oauth from "./plugin/oauth";
import auth from "./plugin/auth";

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

    return app
}
