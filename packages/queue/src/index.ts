import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';

export const connection: RedisOptions = {
    host: '127.0.0.1',
    port: 6379,
};

export const deployQueue = new Queue('deploy-queue', {
    connection,
});
