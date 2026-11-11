import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function run() {
    console.log("Deleting all users from Supabase...");
    
    // In Supabase, to delete all, we can match id is not null
    const { data, error } = await supabase.from('users').delete().not('id', 'is', null);
    
    if (error) {
       console.error("Error deleting users:", error);
    } else {
       console.log("Successfully deleted users:", data);
    }
  }
  run();
}
