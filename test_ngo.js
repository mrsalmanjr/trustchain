import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://rgaqffyknuvbtbdiwlbf.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYXFmZnlrbnV2YnRiZGl3bGJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MzQ2NCwiZXhwIjoyMDk3MjY5NDY0fQ.vFNq43DSCYBrkdHLfyMzBeB2L4FTP7EeWRQIg8UZa5Y");

async function check() {
  const { data, error } = await supabase.from('ngos').select('*').limit(1);
  console.log("Data:", data, "Error:", error);
}
check();
