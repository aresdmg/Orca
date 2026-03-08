import Fastify from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import config from "./config/config";
import db from "./plugin/db";
import authRoute from "./modules/auth/auth.route";
import oauth from "./plugin/oauth";

export default function bootstarp() {
    const app = Fastify({
        logger: true
    }).withTypeProvider<ZodTypeProvider>()

    config(app)

    app.register(db)
    app.register(oauth)

    // Route
    app.register(authRoute);

    return app
}
