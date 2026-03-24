import { Worker } from "bullmq";
import { connection } from "@repo/queue"

function startWorker() {
    const worker = new Worker(
        "deploy-queue",
        async (job) => {
            switch (job.name) {
                case 'build':
                    // to be implemented
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
        console.log(`Worker ready`);
    });

    worker.on('active', (job) => {
        console.log(`Processing job ${job.id}`);
    });

    worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
        console.log(`Job ${job?.id} failed:`, err.message);
    });
}

startWorker()
