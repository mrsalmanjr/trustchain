import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
async function run() {
  const { data, error } = await supabase.from('users').select('id').limit(5);
  console.log("Remaining users:", data?.length);
}
run();
