import bootstarp from "./app";

function start() {
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
