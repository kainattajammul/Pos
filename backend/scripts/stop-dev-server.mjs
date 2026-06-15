/**
 * Stops the dev API if it is still listening on PORT (default 4000).
 * Needed on Windows before `prisma generate` — the query engine DLL is locked
 * while Node is running.
 */
import { execSync } from "node:child_process";

const port = Number(process.env.PORT ?? 4000);

function getListeningPids(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr ":${targetPort}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    const pids = new Set();
    for (const line of output.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = Number(parts.at(-1));
      if (Number.isInteger(pid) && pid > 0) pids.add(pid);
    }
    return [...pids];
  } catch {
    return [];
  }
}

const pids = getListeningPids(port);
if (pids.length === 0) {
  console.log(`No process listening on port ${port}.`);
  process.exit(0);
}

for (const pid of pids) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    console.log(`Stopped PID ${pid} (was using port ${port}).`);
  } catch {
    console.warn(`Could not stop PID ${pid}. Close the other terminal and retry.`);
    process.exit(1);
  }
}
