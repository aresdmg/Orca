import { FastifyError, FastifyInstance } from "fastify"
import { FastifyReply } from "fastify/types/reply"
import { FastifyRequest } from "fastify/types/request"
import { AppError } from "./app-error"

const handleAppError = (app: FastifyInstance) => {
    app.setErrorHandler((error: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
        // Immediately log the app error irrespective of what it is.
        app.log.error(error)

        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: error.code || 'APP_ERROR',
                message: error.message,
            })
        }

        // If nothing matches the error then just send this.
        return reply.send(
            app.httpErrors.internalServerError("Something went wrong")
        )
    })
}

export default handleAppError
