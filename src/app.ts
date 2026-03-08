import Fastify from "fastify";

export default function bootstarp() {
    const app = Fastify({
        logger: true
    })
    
    return app
} 