import Fastify from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import config from "./config/config";

export default function bootstarp() {
    const app = Fastify({
        logger: true
    }).withTypeProvider<ZodTypeProvider>()
    
    config(app)
    
    return app
} 