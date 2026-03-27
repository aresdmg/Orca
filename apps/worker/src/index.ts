import { Worker } from "bullmq";
import { connection } from "@repo/queue"
import nodeBuilder from "./process/node";
import { queueData } from "./types/builder.types";
import dotenv from "dotenv"

function startWorker() {
    dotenv.config({
        path: "./.env",
        quiet: true
    })

    const worker = new Worker(
        "deploy-queue",
        async (job) => {
            const jobInfo = job.data as queueData
            let builderInfo: Awaited<boolean>
            
            switch (String(jobInfo.language).toLowerCase()) {
                case 'javascript':
                    builderInfo = await nodeBuilder(job.data as queueData)
                    if (builderInfo) {
                        
                    }
                    break;
                case 'typescript':
                    builderInfo = await nodeBuilder(job.data as queueData)
                    break;
            }
        },
        {
            connection,
            concurrency: 1
        }
    )

    worker.on('ready', () => {
        console.log(`Ready when you are.`);
    });

    worker.on('failed', (job, err) => {
        console.log(`Job ${job?.id} failed:`, err.message);
    });
}

startWorker()
