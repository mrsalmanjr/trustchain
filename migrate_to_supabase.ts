import fs from 'fs';
import path from 'path';
import { supabase } from './src/lib/supabase';

const DB_FILE = path.join(process.cwd(), "db.json");

async function migrate() {
  console.log("Starting migration from db.json to Supabase...");
  if (!fs.existsSync(DB_FILE)) {
    console.log("No db.json found. Skipping migration.");
    return;
  }
  
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  
  console.log("Migrating users...");
  for (const user of Object.values(db.users) as any[]) {
    // Check if exists
    const { data } = await supabase.from('users').select('id').eq('email', user.email).single();
    if (!data) {
      await supabase.from('users').insert({
        email: user.email,
        name: user.name,
        role: user.role,
        password_hash: user.passwordHash,
        created_at: user.createdAt
      });
    }
  }

  console.log("Migrating ngos...");
  for (const ngo of Object.values(db.ngos) as any[]) {
    const { data: userData } = await supabase.from('users').select('id').eq('email', db.users[ngo.userId].email).single();
    if (userData) {
      const { data } = await supabase.from('ngos').select('id').eq('ngo_name', ngo.ngoName).single();
      if (!data) {
        await supabase.from('ngos').insert({
          user_id: userData.id,
          ngo_name: ngo.ngoName,
          registration_number: ngo.registrationNumber,
          description: ngo.description,
          verified: ngo.verified,
          documents: ngo.documents,
          logo: ngo.logo
        });
      }
    }
  }

  console.log("Migrating campaigns...");
  for (const camp of Object.values(db.campaigns) as any[]) {
    const { data: ngoData } = await supabase.from('ngos').select('id').eq('ngo_name', camp.ngoName).single();
    if (ngoData) {
      const { data } = await supabase.from('campaigns').select('id').eq('title', camp.title).single();
      if (!data) {
        await supabase.from('campaigns').insert({
          ngo_id: ngoData.id,
          title: camp.title,
          description: camp.description,
          category: camp.category,
          goal_amount: camp.goalAmount,
          raised_amount: camp.raisedAmount,
          beneficiary_count: camp.beneficiaryCount,
          deadline: camp.deadline,
          location: camp.location,
          banner_image: camp.bannerImage,
          supporting_documents: camp.supportingDocuments,
          status: camp.status,
          created_at: camp.createdAt,
          utilization_reports: camp.utilizationReports,
          updates: camp.updates
        });
      }
    }
  }
  
  console.log("Migration complete!");
}

migrate().catch(console.error);
