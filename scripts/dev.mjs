import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd(), true);
const research = process.argv.includes("--research");
let stopDatabase;
if (research || process.argv.includes("--qa") || process.env.INSIGHTPIP_QA_MODE === "1") {
  const { startQaDatabase } = await import("./qa-database.mjs");
  stopDatabase = await startQaDatabase({ research });
}
const args = research ? ["--hostname", "127.0.0.1", "--port", "3000"] : process.argv
  .slice(2)
  .filter((x) => !["--strictPort", "--qa"].includes(x))
  .map((x) => (x === "--host" ? "--hostname" : x));
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", ...args],
  { stdio: "inherit", env: process.env },
);
child.on("exit", async (code) => {
  await stopDatabase?.();
  process.exit(code ?? 1);
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
