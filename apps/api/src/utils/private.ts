import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export type logTypes = {
    jobId: string
    log: string
}

export default function handleInternalRoutes(app: FastifyInstance) {
    app.post(
        "/i/logs",
        {
            logLevel: "silent",
        },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const header = req.headers
            const token = header["x-orca-worker"]
            if (!token) return;

            const secret = process.env.WORKER_SECRET
            if (!secret) throw new Error("worker secret is missing in .env");
            if (token !== secret) return;

            const body = req.body as logTypes
            console.log(body.log)
            return;
        }
    )
}