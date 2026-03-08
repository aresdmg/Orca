import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import cookies from "@fastify/cookie";
import { FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

export default function config(app: FastifyInstance) {
    app.register(cors, {
        origin: "http://localhost:3000",
        credentials: true
    })
    app.register(helmet)
    app.register(jwt,
        {
            secret: process.env.JWT_SECRET!,
            sign: {
                expiresIn: "15m"
            }
        }
    )
    app.register(sensible)
    app.register(cookies)
    
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
}
