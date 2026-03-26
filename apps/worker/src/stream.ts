import axios from "axios";
import { Writable } from "stream";

const createLogStream = (jobId: string) => {
    return new Writable({
        async write(chunk, _, cb) {
            const logEvent = String(chunk)

            const url = process.env.BACKEND_URL
            if (!url) throw new Error("URL is missing in .env")

            const token = process.env.BACKEND_SECRET
            if (!token) throw new Error("Backend secret is missing in .env")

            await axios.post(`${url}/i/logs`,
                {
                    jobId,
                    log: logEvent
                },
                {
                    headers: {
                        "x-orca-worker": token
                    }
                }
            ).catch((err) => {
                console.error("Error posting data:", err.response?.data || err.message);
            })

            cb()
        }
    })
}

export default createLogStream
