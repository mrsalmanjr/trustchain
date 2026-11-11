import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const userId = crypto.randomUUID();
  const ngoId = crypto.randomUUID();
  const campId = crypto.randomUUID();
  
  await supabase.from('users').upsert({
    id: userId,
    email: "testngo_pending@example.com",
    name: "Test NGO Pending",
    role: "ngo",
    password_hash: "hashed",
  });

  const { data, error } = await supabase.from('ngos').upsert({
    id: ngoId,
    user_id: userId,
    ngo_name: "Hope Foundation (Pending)",
    registration_number: "REG-2026-XYZ",
    description: "A new NGO waiting for approval.",
    verified: "pending",
    documents: [],
    logo: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  });
  
  console.log("Pending NGO inserted:", error || "Success");

  const { data: camp, error: campErr } = await supabase.from('campaigns').upsert({
    id: campId,
    ngo_id: ngoId,
    ngo_name: "Hope Foundation (Pending)",
    title: "Pending Medical Campaign",
    description: "Please approve this campaign.",
    category: "Medical",
    goal_amount: 50000,
    raised_amount: 0,
    beneficiary_count: 50,
    location: "Mumbai",
    status: "pending",
    created_at: new Date().toISOString()
  });

  console.log("Pending Campaign inserted:", campErr || "Success");
}
main();
