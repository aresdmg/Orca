import dotenv from "dotenv"
import bootstarp from "./app";

function start() {
    dotenv.config({
        path: "./.env",
        quiet: true
    })
    
    const app = bootstarp()
    const port = Number(process.env.PORT) || 4000

    try {
        app.listen({ port })
        app.log.info(`SERVER: ${port}`)
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

start()
