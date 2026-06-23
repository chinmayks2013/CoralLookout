/**
 * Copy Supabase env vars from .env.local to Vercel Production, then redeploy.
 *
 * One-time setup:
 *   npx vercel login
 *   npx vercel link
 *
 * Run:
 *   npm run push:vercel-env
 */
import dotenv from "dotenv";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const ENVIRONMENTS = process.argv.includes("--all")
  ? ["production", "preview", "development"]
  : ["production"];

function run(args, input) {
  return spawnSync("npx", ["vercel", ...args], {
    input,
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
    encoding: "utf8",
  });
}

function upsertEnv(name, value, environment) {
  run(["env", "rm", name, environment, "--yes"]);
  const add = run(["env", "add", name, environment, "--yes"], value);
  if (add.status !== 0) {
    console.error(`\nFailed to set ${name} for ${environment}.`);
    process.exit(add.status ?? 1);
  }
  console.log(`✓ ${name} (${environment})`);
}

console.log("\nPush Coral Lookout env vars to Vercel\n");

const toPush = VARS.filter((name) => process.env[name]?.trim());
const missing = VARS.filter(
  (name) =>
    name !== "NEXT_PUBLIC_APP_URL" && !process.env[name]?.trim(),
);

if (missing.length > 0) {
  console.error("Missing in .env.local:");
  for (const name of missing) console.error(`  - ${name}`);
  console.error("\nAdd them locally first, then run this script again.\n");
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
  process.env.NEXT_PUBLIC_APP_URL = "https://coral-lookout.vercel.app";
  console.log(
    "Using default NEXT_PUBLIC_APP_URL=https://coral-lookout.vercel.app\n",
  );
}

const whoami = run(["whoami"]);
if (whoami.status !== 0) {
  console.error("\nNot logged in. Run: npx vercel login\n");
  process.exit(1);
}

for (const environment of ENVIRONMENTS) {
  console.log(`\n${environment.toUpperCase()}:`);
  for (const name of toPush) {
    upsertEnv(name, process.env[name].trim(), environment);
  }
  if (!toPush.includes("NEXT_PUBLIC_APP_URL")) {
    upsertEnv(
      "NEXT_PUBLIC_APP_URL",
      process.env.NEXT_PUBLIC_APP_URL.trim(),
      environment,
    );
  }
}

console.log("\nRedeploying production (required for NEXT_PUBLIC_* vars)…\n");
const deploy = run(["--prod"]);
if (deploy.status !== 0) {
  console.error("\nDeploy failed. In Vercel: Deployments → Redeploy manually.\n");
  process.exit(deploy.status ?? 1);
}

console.log("\nDone. Verify:");
console.log("  https://coral-lookout.vercel.app/api/health");
console.log("  https://coral-lookout.vercel.app/api/auth/config\n");
