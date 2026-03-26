import Dockerode from "dockerode"
import { queueData } from "../types/builder.types";
import createLogStream from "../stream";

export default async function nodeBuilder(builderInfo: queueData) {
    const { id, cloneUrl, language, name } = builderInfo

    console.log(`Starting build for project [${id}]=[${name}]`)
    if (language.toLowerCase() != "javascript" && language.toLowerCase() != "typescript") {
        throw new Error(`${language} can't be build using the node builder`)
    }

    try {
        const docker = new Dockerode()
        const image = "orca-node20:build"

        const container = await docker.createContainer({
            Image: image,
            Entrypoint: ["bash"],
            Cmd: [
                "-c", `
                git clone ${cloneUrl} /workspace &&
                cd /workspace &&

                corepack enable &&

                if [ -f pnpm-lock.yaml ]; then
                    echo "Using pnpm"
                    npm install -g pnpm@8 &&
                    pnpm -v &&
                    pnpm install &&
                    pnpm run build

                elif [ -f yarn.lock ]; then
                    echo "Using yarn"
                    npm install -g yarn &&
                    yarn -v &&
                    yarn install &&
                    yarn build

                else
                    echo "Using npm"
                    npm install &&
                    npm run build
                fi
                `
            ],
            Tty: true,
            HostConfig: {
                AutoRemove: true,
                Memory: 1024 * 1024 * 1024,
                CpuQuota: 50000,
            },
            AttachStderr: true,
            AttachStdout: true,
        })

        await container.start()

        const stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true
        })

        const logStream = createLogStream(id)

        container.modem.demuxStream(stream, logStream, logStream)

        const exitData = await container.wait()
        
        if (exitData?.StatusCode === 0) {
            console.log(`Build success for project [${id}]=[${name}]`)
            return true
        } else {
            console.log(`Build failed for project [${id}]=[${name}]`)
            return false
        }

    } catch (error) {
        console.error("Build error:", error);
        return false;
    }

}
