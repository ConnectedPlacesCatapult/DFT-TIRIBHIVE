/**
 * Run: npx tsx scripts/sync-feedback-azure-to-supabase.ts
 * Loads .env via dotenv. Requires Azure + Supabase service role.
 */

import "dotenv/config";
import { syncFeedbackAzureToSupabase } from "../lib/feedback-sync";

async function main() {
  const r = await syncFeedbackAzureToSupabase();
  if (!r.ok) {
    console.error("Sync failed:", r.error);
    process.exit(1);
  }
  console.log(`Synced ${r.upserted} feedback row(s) to Supabase.`);
}

main();
