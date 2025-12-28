// scripts/deploy-jobs.js
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const jobsDir = join(process.cwd(), "supabase", "jobs");
const migrationsDir = join(process.cwd(), "supabase", "migrations");

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+/, "")
  .replace("T", "");

const jobFiles = readdirSync(jobsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

let migration = "-- Auto-generated cron jobs migration\n";
migration += "CREATE EXTENSION IF NOT EXISTS pg_cron;\n\n";

for (const file of jobFiles) {
  const content = readFileSync(join(jobsDir, file), "utf-8");
  migration += `-- ============================================\n`;
  migration += `-- Job: ${file}\n`;
  migration += `-- ============================================\n`;
  migration += content + "\n\n";
}

const outputFile = join(migrationsDir, `${timestamp}_cron_jobs.sql`);
writeFileSync(outputFile, migration);

console.log(`✅ Created migration: ${timestamp}_cron_jobs.sql`);

// Run migration
execSync("supabase migration up", { stdio: "inherit" });
