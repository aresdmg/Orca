import { Worker } from "bullmq";
import { connection } from "@repo/queue"
import nodeBuilder from "./process/node-builder";
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
            switch (job.name) {
                case 'build':
                    const builderInfo = nodeBuilder(job.data as queueData)
                    break;
                case 'test':
                    // to be implemented
                    break;
                case 'deploy':
                    // to be implemented
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
