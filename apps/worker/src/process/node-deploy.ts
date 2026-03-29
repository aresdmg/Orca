import Dockerode from "dockerode";
import { queueData } from "../types/builder.types";

export default async function handleDockerDeployment(builderInfo: queueData) {
    const { id, cloneUrl, language, name, env } = builderInfo

    console.log(`Starting deployment for [${id}]=[${name}]`)
    if (language.toLowerCase() != "javascript" && language.toLowerCase() != "typescript") {
        throw new Error(`${language} can't be build using the node builder`)
    }

    try {
        const docker = new Dockerode()
        const image = "orca-node:20"

        const container = await docker.createContainer({
            Image: image,
            Entrypoint: ["bash"],
            Cmd: [
                "-c", `
              git clone ${cloneUrl} /workspace &&
              cd /workspace &&

              echo '${env}' > .env &&

              corepack enable &&

              if [ -f pnpm-lock.yaml ]; then
                  echo "Using pnpm"
                  npm install -g pnpm &&
                  pnpm install &&
                  pnpm run build &&

                  rm -rf node_modules src .git &&
                  pnpm install --prod &&
                  pnpm start

              elif [ -f yarn.lock ]; then
                  echo "Using yarn"
                  npm install -g yarn &&
                  yarn install &&
                  yarn build &&
                  
                  rm -rf node_modules src .git &&
                  yarn install --production=true &&
                  yarn start

              else
                  echo "Using npm"
                  npm install &&
                  npm run build &&

                  rm -rf node_modules src .git &&
                  npm install --omit=dev &&
                  npm run start
              fi
              `
            ],
            Tty: true,
            HostConfig: {
                Memory: 1024 * 1024 * 1024,
                CpuQuota: 50000,
                PortBindings: {
                    "8000/tcp": [{ HostPort: "0" }]
                }
            },
            AttachStderr: true,
            AttachStdout: true,
            ExposedPorts: {
                "8000/tcp": {}
            },
        })

        await container.start()

        const info = await container.inspect();
        const portData = info.NetworkSettings.Ports["8000/tcp"];
        const hostPort = portData?.[0]?.HostPort;
        console.log(`Server >> http://localhost:${hostPort}`);
    } catch (error) {
        console.error("Deployment error:", error);
        return false;
    }
}
