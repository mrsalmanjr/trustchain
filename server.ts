/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  User, NGOProfile, Campaign, CampaignCategory, CampaignStatus,
  LiabilityReport, CampaignUpdate, Donation, BlockchainBlock,
  Notification, PlatformStats
} from "./src/types";
import { isRazorpayConfigured, razorpayClient } from "./src/lib/razorpay";
import { isBlockchainConfigured, recordDonationOnChain, getTransactionDetails } from "./src/lib/blockchain";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "./src/lib/supabase";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_12345";

// In-Memory Database backed by a simple Local JSON file for durability
const DB_FILE = path.join(process.cwd(), "db.json");

interface Database {
  users: Record<string, User & { passwordHash: string }>;
  ngos: Record<string, NGOProfile>;
  campaigns: Record<string, Campaign>;
  donations: Record<string, Donation>;
  blockchain: BlockchainBlock[];
  notifications: Notification[];
}

// Initial Seed Data for premium, realistic campaigns
const INITIAL_DATABASE: Database = {
  users: {
    "admin": {
      id: "admin",
      email: "admin@trustchain.org",
      name: "TrustChain Administrator",
      role: "admin",
      createdAt: new Date().toISOString(),
      passwordHash: "admin123"
    },
    "donor1": {
      id: "donor1",
      email: "donor@gmail.com",
      name: "Saurabh Sharma",
      role: "donor",
      createdAt: new Date().toISOString(),
      passwordHash: "donor123"
    },
    "ngo1_user": {
      id: "ngo1_user",
      email: "teachindia@ngo.org",
      name: "Aarav Rawat (TeachIndia)",
      role: "ngo",
      createdAt: new Date().toISOString(),
      passwordHash: "ngo123"
    }
  },
  ngos: {
    "ngo1": {
      id: "ngo1",
      userId: "ngo1_user",
      ngoName: "TeachIndia Foundation",
      registrationNumber: "NGO-EDU-2023-9812",
      description: "Dedicated to providing qualitative education and technology-aided tools to underprivileged and tribal schools worldwide.",
      verified: "approved",
      documents: [{ name: "80G_Tax_Exemption.pdf", url: "#" }, { name: "NGO_Certificate.pdf", url: "#" }],
      logo: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  campaigns: {
    "camp1": {
      id: "camp1",
      ngoId: "ngo1",
      ngoName: "TeachIndia Foundation",
      title: "Remote Tablets for Rural Schools",
      description: "Providing qualitative remote android tablet kits, internet access cards, and interactive digital courseworks for secondary classrooms who lack primary teachers in tribal areas of Jharkhand.",
      category: "Education",
      goalAmount: 1200000,
      raisedAmount: 850000,
      beneficiaryCount: 450,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Singhbhum, Jharkhand",
      bannerImage: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1000&auto=format&fit=crop&q=80",
      supportingDocuments: ["Tablet_Cost_Breakdown.pdf", "School_Permission_MoU.pdf"],
      status: "active",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      utilizationReports: [
        {
          id: "rep1",
          campaignId: "camp1",
          title: "Batch 1: Tablet Procurement and Shipping",
          description: "Procurement of 50 customized Android tablets with educational material preload cover + safety cases.",
          amountUsed: 400000,
          recipientName: "Dexter Electronics Ltd",
          uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      updates: [
        {
          id: "upd1",
          campaignId: "camp1",
          title: "Setup Completed for Singhbhum Middle School",
          description: "Our volunteers successfully delivered the first batch of tablets! The children are absolutely ecstatic and began their first interactive biology class today.",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    "camp2": {
      id: "camp2",
      ngoId: "ngo1",
      ngoName: "TeachIndia Foundation",
      title: "Cardiac Surgery Support for Infants",
      description: "Sponsoring life-saving pediatric heart surgeries and intensive post-operative therapy care for children diagnosed with congenital cardiovascular conditions at partner super-specialty hospitals.",
      category: "Medical",
      goalAmount: 1500000,
      raisedAmount: 1120000,
      beneficiaryCount: 12,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Bangalore, India",
      bannerImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80",
      supportingDocuments: ["Hospital_Cost_Estimate.pdf"],
      status: "active",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      utilizationReports: [],
      updates: []
    },
    "camp3": {
      id: "camp3",
      ngoId: "ngo1",
      ngoName: "TeachIndia Foundation",
      title: "Clean Water Solar-Filtration Wells",
      description: "Installing robust, low-maintenance, community solar-powered reverse osmosis clean water wells in interior Rajasthan regions plagued by high fluoride groundwater levels.",
      category: "Community Support",
      goalAmount: 600000,
      raisedAmount: 240000,
      beneficiaryCount: 1500,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Barmer, Rajasthan",
      bannerImage: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=1000&auto=format&fit=crop&q=80",
      supportingDocuments: ["RO_Solar_BOQ.pdf"],
      status: "active",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      utilizationReports: [],
      updates: []
    }
  },
  donations: {
    "don1": {
      id: "don1",
      campaignId: "camp1",
      campaignTitle: "Remote Tablets for Rural Schools",
      donorId: "donor1",
      donorName: "Saurabh Sharma",
      ngoId: "ngo1",
      ngoName: "TeachIndia Foundation",
      amount: 15000,
      paymentMethod: "UPI",
      paymentId: "pay_xyz789",
      blockchainHash: "0x0000a98f7c6e5d4cb3a2f1e09876543210ffffff1234567890abcdef",
      status: "utilized",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    "don2": {
      id: "don2",
      campaignId: "camp2",
      campaignTitle: "Cardiac Surgery Support for Infants",
      donorId: "donor1",
      donorName: "Saurabh Sharma",
      ngoId: "ngo1",
      ngoName: "TeachIndia Foundation",
      amount: 25000,
      paymentMethod: "Card",
      paymentId: "pay_cardh12",
      blockchainHash: "0x00003b87c71e2f3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
      status: "hashed",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  blockchain: [
    {
      index: 0,
      timestamp: "2026-01-01T00:00:00.000Z",
      donationId: "GENESIS_TX",
      amount: 0,
      campaignId: "SYSTEM",
      campaignTitle: "GENESIS BLOCK",
      donorHash: "0x00000000000000000000000000000000000",
      ngoAddress: "0x00000000000000000000000000055555555",
      hash: "0x00007b8192a83f94e10d2bc4a5b6c7d8e9f0123456789abcdef11223344",
      previousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      nonce: 1542
    },
    {
      index: 1,
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      donationId: "don1",
      amount: 15000,
      campaignId: "camp1",
      campaignTitle: "Remote Tablets for Rural Schools",
      donorHash: "0x789a1bc23188d01b876a4f21d7b3ea1c9",
      ngoAddress: "0x98129eac11b3daef5610d48a5291",
      hash: "0x0000a98f7c6e5d4cb3a2f1e09876543210ffffff1234567890abcdef",
      previousHash: "0x00007b8192a83f94e10d2bc4a5b6c7d8e9f0123456789abcdef11223344",
      nonce: 3122
    },
    {
      index: 2,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      donationId: "don2",
      amount: 25000,
      campaignId: "camp2",
      campaignTitle: "Cardiac Surgery Support for Infants",
      donorHash: "0x789a1bc23188d01b876a4f21d7b3ea1c9",
      ngoAddress: "0x9c31fa81d77a0be9f0db82fcf3eef",
      hash: "0x00003b87c71e2f3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
      previousHash: "0x0000a98f7c6e5d4cb3a2f1e09876543210ffffff1234567890abcdef",
      nonce: 14221
    }
  ],
  notifications: [
    {
      id: "notif1",
      recipientId: "admin",
      title: "New NGO Verification Pending",
      message: "NGO 'TeachIndia Foundation' has submitted updated 80G tax exemptions for review.",
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    }
  ]
};

// Database state
let db: Database = INITIAL_DATABASE;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
    } else {
      saveDatabase();
    }
  } catch (error) {
    console.error("Failed to load local DB, fallback to initial state:", error);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to persist local DB:", error);
  }
}

// Robust custom hashing utility simulating Proof of Work (PoW) cryptography search
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3024733165, h3 = 3362453659, h4 = 50249325;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function mineBlock(blockInput: string, targetDifficulty: number = 4): { hash: string; nonce: number } {
  let nonce = 0;
  const prefix = "0".repeat(targetDifficulty);
  while (nonce < 1000000) {
    const val = blockInput + "_" + nonce;
    const r = cyrb128(val);
    const hex = r.map(x => x.toString(16).padStart(8, '0')).join('');
    if (hex.startsWith(prefix)) {
      return { hash: "0x" + hex, nonce };
    }
    nonce++;
  }
  return { hash: "0x0000adef818274a16b3fcfde" + Math.floor(Math.random() * 1000000).toString(16), nonce };
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // Validates standard email format across all providers (Gmail, Yahoo, Rediffmail, Outlook, Hotmail, etc.)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

// Express server configuration
async function startServer() {
  loadDatabase();
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API - Auth Middleware (Secure JWT Verification)
  app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.id;

        if (isSupabaseConfigured) {
          const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
          if (user) {
            (req as any).user = {
              id: user.id, email: user.email, name: user.name, role: user.role,
              phone: user.phone, location: user.location, bio: user.bio,
              avatarUrl: user.avatar_url, preferredCategory: user.preferred_category,
              passwordHash: user.password_hash, createdAt: user.created_at
            };
          }
        } else {
          const user = db.users[userId];
          if (user) {
            (req as any).user = user;
          }
        }
      } catch (err) {
        // Invalid token
      }
    }
    next();
  });

  // REST API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AUTH - REGISTER
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role, ngoParams } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailLower = email.toLowerCase().trim();
    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ error: "Please enter a valid email address (e.g., user@gmail.com, user@yahoo.com, user@rediffmail.com)" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isSupabaseConfigured) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', emailLower).single();
      if (existing) return res.status(400).json({ error: "Email already registered" });

      const { data: newUser, error } = await supabase.from('users').insert({
        email: emailLower, name, role, password_hash: hashedPassword
      }).select().single();

      if (error || !newUser) return res.status(500).json({ error: error?.message || "Registration failed" });

      if (role === "ngo" && ngoParams) {
        const { error: ngoError } = await supabase.from('ngos').insert({
          user_id: newUser.id,
          ngo_name: ngoParams.ngoName || name + " Trust",
          registration_number: ngoParams.registrationNumber || "PEND-REG-" + Math.floor(Math.random() * 90000 + 10000),
          description: ngoParams.description || "Charity NGO committed to community welfare.",
          verified: "pending",
          logo: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80",
          bank_account: ngoParams.bankAccount || null,
          ifsc_code: ngoParams.ifscCode || null,
          upi_id: ngoParams.upiId || null
        });
        if (ngoError) {
          console.error("NGO creation failed:", ngoError);
          // Non-fatal, but we should log it
        }
      }

      const userResponse = {
        id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role,
        createdAt: newUser.created_at, phone: newUser.phone, location: newUser.location,
        bio: newUser.bio, avatarUrl: newUser.avatar_url, preferredCategory: newUser.preferred_category
      };

      const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
      return res.status(201).json({ user: userResponse, token });
    } else {
      const emailExists = Object.values(db.users).some(u => u.email.toLowerCase() === emailLower);
      if (emailExists) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const userId = "user_" + Math.random().toString(36).substr(2, 9);
      const newUser: User = {
        id: userId,
        email: emailLower,
        name,
        role: role as any,
        createdAt: new Date().toISOString()
      };

      db.users[userId] = {
        ...newUser,
        passwordHash: hashedPassword
      };

      if (role === "ngo" && ngoParams) {
        const ngoId = "ngo_" + Math.random().toString(36).substr(2, 9);
        const newNgo: NGOProfile = {
          id: ngoId,
          userId: userId,
          ngoName: ngoParams.ngoName || name + " Trust",
          registrationNumber: ngoParams.registrationNumber || "PEND-REG-" + Math.floor(Math.random() * 90000 + 10000),
          description: ngoParams.description || "Charity NGO committed to community welfare.",
          verified: "pending", // Starts as pending for Admin flow
          documents: [{ name: "RegistrationProof.pdf", url: "#" }],
          logo: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80",
          createdAt: new Date().toISOString()
        };
        db.ngos[ngoId] = newNgo;
      }
      saveDatabase();
      const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "7d" });
      return res.status(201).json({ user: newUser, token });
    }
  });

  // AUTH - LOGIN
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailLower = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      const { data: user, error } = await supabase.from('users').select('*').eq('email', emailLower).single();
      if (!user) {
        return res.status(401).json({ error: "Invalid email credentials or password" });
      }

      // Compare passwords natively if hashed, else fallback for legacy plain text passwords during migration
      let isMatch = false;
      if (user.password_hash.startsWith("$2a$") || user.password_hash.startsWith("$2b$")) {
        isMatch = await bcrypt.compare(password, user.password_hash);
      } else {
        isMatch = (password === user.password_hash);
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email credentials or password" });
      }

      const userResponse = {
        id: user.id, email: user.email, name: user.name, role: user.role,
        createdAt: user.created_at, phone: user.phone, location: user.location,
        bio: user.bio, avatarUrl: user.avatar_url, preferredCategory: user.preferred_category
      };
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ user: userResponse, token });
    } else {
      const foundUser = Object.values(db.users).find(u => u.email.toLowerCase() === emailLower);
      if (!foundUser) {
        return res.status(401).json({ error: "Invalid email credentials or password" });
      }

      let isMatch = false;
      if (foundUser.passwordHash.startsWith("$2a$") || foundUser.passwordHash.startsWith("$2b$")) {
        isMatch = await bcrypt.compare(password, foundUser.passwordHash);
      } else {
        isMatch = (password === foundUser.passwordHash);
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email credentials or password" });
      }

      const { passwordHash, ...userResponse } = foundUser;
      const token = jwt.sign({ id: foundUser.id, role: foundUser.role }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ user: userResponse, token });
    }
  });

  // CURRENT USER PROFILE
  app.get("/api/auth/me", async (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    if (isSupabaseConfigured) {
      let ngo = null;
      if (user.role === 'ngo') {
        const { data } = await supabase.from('ngos').select('*').eq('user_id', user.id).single();
        if (data) {
          ngo = {
            id: data.id, userId: data.user_id, ngoName: data.ngo_name, registrationNumber: data.registration_number,
            description: data.description, verified: data.verified, documents: data.documents, logo: data.logo,
            bankAccount: data.bank_account, ifscCode: data.ifsc_code, upiId: data.upi_id
          };
        }
      }
      const { passwordHash, ...profileResponse } = user;
      return res.json({ user: profileResponse, ngo });
    } else {
      const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
      const { passwordHash, ...profileResponse } = user;
      return res.json({ user: profileResponse, ngo: ngo || null });
    }
  });

  // UPDATE NGO PROFILE
  app.put("/api/ngos/profile", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "Unauthorized. NGO access required." });
    }

    const { ngoName, description, address, tagline, logo, bankAccount, ifscCode, upiId } = req.body;

    if (isSupabaseConfigured) {
      const { data: ngo, error } = await supabase.from('ngos').select('id').eq('user_id', user.id).single();
      if (error || !ngo) return res.status(404).json({ error: "NGO profile not found." });

      const { error: updateError } = await supabase.from('ngos').update({
        ngo_name: ngoName,
        description: description,
        logo: logo,
        bank_account: bankAccount,
        ifsc_code: ifscCode,
        upi_id: upiId
      }).eq('id', ngo.id);

      if (updateError) return res.status(500).json({ error: updateError.message });
      return res.json({ success: true });
    } else {
      const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
      if (!ngo) return res.status(404).json({ error: "NGO not found" });
      ngo.ngoName = ngoName || ngo.ngoName;
      ngo.description = description || ngo.description;
      ngo.logo = logo || ngo.logo;
      (ngo as any).bankAccount = bankAccount;
      (ngo as any).ifscCode = ifscCode;
      (ngo as any).upiId = upiId;
      return res.json({ success: true });
    }
  });

  // UPDATE USER PROFILE
  app.put("/api/auth/profile", (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const { name, email, password, phone, location, bio, avatarUrl, preferredCategory, notificationPreferences } = req.body;

    if (email) {
      const emailLower = email.toLowerCase().trim();
      if (!isValidEmail(emailLower)) {
        return res.status(400).json({ error: "Please enter a valid email address (e.g., user@gmail.com, user@yahoo.com, user@rediffmail.com)" });
      }
      if (emailLower !== user.email.toLowerCase()) {
        const emailExists = Object.values(db.users).some(u => u.id !== user.id && u.email.toLowerCase() === emailLower);
        if (emailExists) {
          return res.status(400).json({ error: "Email already registered by another account" });
        }
        user.email = emailLower;
      }
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (preferredCategory !== undefined) user.preferredCategory = preferredCategory;
    if (notificationPreferences !== undefined) user.notificationPreferences = notificationPreferences;

    if (password) {
      user.passwordHash = password;
    }

    saveDatabase();

    const { passwordHash, ...profileResponse } = user;
    res.json({ success: true, user: profileResponse });
  });

  // GET ALL PUBLIC CAMPAIGNS (Search, Category Filter, Sort Filter)
  // GET ALL PUBLIC CAMPAIGNS (Search, Category Filter, Sort Filter)
  app.get("/api/campaigns", async (req, res) => {
    const { search, category, sort } = req.query;
    const user = (req as any).user;

    if (isSupabaseConfigured) {
      let query = supabase.from('campaigns').select('*');

      if (user && user.role === "ngo") {
        const { data: ngo } = await supabase.from('ngos').select('id').eq('user_id', user.id).single();
        if (ngo) {
          query = query.eq('ngo_id', ngo.id);
        } else {
          return res.json([]);
        }
      } else {
        query = query.in('status', ['active', 'completed']);
      }

      if (category && category !== "All") {
        query = query.eq('category', category);
      }

      const { data: campaigns } = await query;
      let list = (campaigns || []).map((c: any) => ({
        id: c.id, ngoId: c.ngo_id, ngoName: c.ngo_name, title: c.title, description: c.description,
        category: c.category, goalAmount: c.goal_amount, raisedAmount: c.raised_amount,
        beneficiaryCount: c.beneficiary_count, deadline: c.deadline, location: c.location,
        bannerImage: c.banner_image, supportingDocuments: c.supporting_documents,
        status: c.status, createdAt: c.created_at
      }));

      if (search) {
        const q = (search as string).toLowerCase();
        list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.ngoName.toLowerCase().includes(q));
      }

      // Sorting
      if (sort === "Most Funded") {
        list.sort((a, b) => (b.raisedAmount / b.goalAmount) - (a.raisedAmount / a.goalAmount));
      } else if (sort === "Ending Soon") {
        list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      } else { // Newest is default
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return res.json(list);
    }

    let list;
    if (user && user.role === "ngo") {
      const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
      if (ngo) {
        list = Object.values(db.campaigns).filter(c => c.ngoId === ngo.id);
      } else {
        list = [];
      }
    } else {
      list = Object.values(db.campaigns).filter(c => c.status === "active" || c.status === "completed");
    }

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.ngoName.toLowerCase().includes(q));
    }

    if (category && category !== "All") {
      list = list.filter(c => c.category === category);
    }

    // Sorting
    if (sort === "Most Funded") {
      list.sort((a, b) => (b.raisedAmount / b.goalAmount) - (a.raisedAmount / a.goalAmount));
    } else if (sort === "Ending Soon") {
      list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else { // Newest is default
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(list);
  });

  // GET INDIVIDUAL CAMPAIGN BY ID
  app.get("/api/campaigns/:id", async (req, res) => {
    if (isSupabaseConfigured) {
      const { data: c } = await supabase.from('campaigns').select('*').eq('id', req.params.id).single();
      if (!c) return res.status(404).json({ error: "Campaign not found" });

      // Fetch NGO Bank Details
      const { data: ngoData } = await supabase.from('ngos').select('bank_account, ifsc_code, upi_id').eq('id', c.ngo_id).single();

      return res.json({
        campaign: {
          id: c.id, ngoId: c.ngo_id, ngoName: c.ngo_name, title: c.title, description: c.description,
          category: c.category, goalAmount: c.goal_amount, raisedAmount: c.raised_amount,
          beneficiaryCount: c.beneficiary_count, deadline: c.deadline, location: c.location,
          bannerImage: c.banner_image, supportingDocuments: c.supporting_documents,
          status: c.status, createdAt: c.created_at, utilizationReports: [], updates: [],
          ngoBankAccount: ngoData?.bank_account, ngoIfscCode: ngoData?.ifsc_code, ngoUpiId: ngoData?.upi_id
        },
        recentDonations: []
      });
    }

    const campaign = db.campaigns[req.params.id];
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const user = (req as any).user;
    if (user && user.role === "ngo") {
      const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
      if (!ngo || campaign.ngoId !== ngo.id) {
        return res.status(403).json({ error: "Access Denied: This campaign belongs to another organization." });
      }
    }

    const recentDonations = Object.values(db.donations)
      .filter(d => d.campaignId === campaign.id && d.status !== "initiated")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      campaign,
      recentDonations
    });
  });

  // NGO CREATE CAMPAIGN PAGE
  app.post("/api/campaigns/create", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "Only authorized NGO staff can post active campaigns." });
    }

    if (isSupabaseConfigured) {
      const { data: ngo } = await supabase.from('ngos').select('*').eq('user_id', user.id).single();
      if (!ngo) return res.status(400).json({ error: "NGO profile could not be retrieved" });
      if (ngo.verified !== "approved") return res.status(403).json({ error: "Your NGO documents are currently pending validation. Campaigns cannot be created until approved by an administrator." });

      const { title, description, category, goalAmount, deadline, location, bannerImage, SupportingDocs, beneficiaryCount } = req.body;
      if (!title || !description || !category || !goalAmount || !deadline) return res.status(400).json({ error: "Missing campaign requirements" });

      const { data: newCampaign, error } = await supabase.from('campaigns').insert({
        ngo_id: ngo.id,
        ngo_name: ngo.ngo_name,
        title, description, category, goal_amount: parseFloat(goalAmount), raised_amount: 0,
        beneficiary_count: parseInt(beneficiaryCount) || 120,
        deadline: new Date(deadline).toISOString(), location: location || "Global",
        banner_image: bannerImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000&auto=format&fit=crop&q=80",
        supporting_documents: SupportingDocs || ["Estimations_Doc.pdf"],
        status: "pending"
      }).select().single();

      if (error) return res.status(500).json({ error: "Database error" });

      await supabase.from('notifications').insert({
        recipient_id: '00000000-0000-0000-0000-000000000001', // Admin
        title: "New Campaign Pending Approval",
        message: `NGO '${ngo.ngo_name}' posted campaign '${newCampaign.title}' which requires administrator validation.`,
        type: "info",
      });

      return res.status(201).json({
        id: newCampaign.id, ngoId: newCampaign.ngo_id, ngoName: newCampaign.ngo_name, title: newCampaign.title,
        description: newCampaign.description, category: newCampaign.category, goalAmount: newCampaign.goal_amount,
        raisedAmount: newCampaign.raised_amount, beneficiaryCount: newCampaign.beneficiary_count,
        deadline: newCampaign.deadline, location: newCampaign.location, bannerImage: newCampaign.banner_image,
        supportingDocuments: newCampaign.supporting_documents, status: newCampaign.status, createdAt: newCampaign.created_at
      });
    }

    const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
    if (!ngo) {
      return res.status(400).json({ error: "NGO profile could not be retrieved" });
    }

    if (ngo.verified !== "approved") {
      return res.status(403).json({ error: "Your NGO documents are currently pending validation. Campaigns cannot be created until approved by an administrator." });
    }

    const { title, description, category, goalAmount, deadline, location, bannerImage, SupportingDocs, beneficiaryCount } = req.body;
    if (!title || !description || !category || !goalAmount || !deadline) {
      return res.status(400).json({ error: "Missing campaign requirements" });
    }

    const campaignId = "camp_" + Math.random().toString(36).substr(2, 9);
    const newCampaign: Campaign = {
      id: campaignId,
      ngoId: ngo.id,
      ngoName: ngo.ngoName,
      title,
      description,
      category: category as CampaignCategory,
      goalAmount: parseFloat(goalAmount),
      raisedAmount: 0,
      beneficiaryCount: parseInt(beneficiaryCount) || 120,
      deadline: new Date(deadline).toISOString(),
      location: location || "Global",
      bannerImage: bannerImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000&auto=format&fit=crop&q=80",
      supportingDocuments: SupportingDocs || ["Estimations_Doc.pdf"],
      status: "pending", // Needs Admin approval
      createdAt: new Date().toISOString(),
      utilizationReports: [],
      updates: []
    };

    db.campaigns[campaignId] = newCampaign;

    db.notifications.push({
      id: "notif_" + Math.random().toString(36).substr(2, 5),
      recipientId: "admin",
      title: "New Campaign Pending Approval",
      message: `NGO '${ngo.ngoName}' posted campaign '${newCampaign.title}' which requires administrator validation.`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    res.status(201).json(newCampaign);
  });

  // NGO EDIT CAMPAIGN
  app.put("/api/campaigns/:id", (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "Only authorized NGO staff can edit campaigns." });
    }
    const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
    if (!ngo) {
      return res.status(400).json({ error: "NGO profile could not be retrieved" });
    }
    const campaignId = req.params.id;
    const campaign = db.campaigns[campaignId];
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    if (campaign.ngoId !== ngo.id) {
      return res.status(403).json({ error: "You can only edit campaigns belonging to your NGO." });
    }

    const { title, description, category, goalAmount, deadline, location, bannerImage, SupportingDocs, beneficiaryCount } = req.body;

    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (category) campaign.category = category;
    if (goalAmount) campaign.goalAmount = parseFloat(goalAmount);
    if (deadline) campaign.deadline = new Date(deadline).toISOString();
    if (location) campaign.location = location;
    if (bannerImage) campaign.bannerImage = bannerImage;
    if (SupportingDocs) campaign.supportingDocuments = SupportingDocs;
    if (beneficiaryCount) campaign.beneficiaryCount = parseInt(beneficiaryCount);

    saveDatabase();
    res.json({ success: true, campaign });
  });

  // NGO DELETE CAMPAIGN
  app.delete("/api/campaigns/:id", (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "Only authorized NGO staff can delete campaigns." });
    }
    const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
    if (!ngo) {
      return res.status(400).json({ error: "NGO profile could not be retrieved" });
    }
    const campaignId = req.params.id;
    const campaign = db.campaigns[campaignId];
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    if (campaign.ngoId !== ngo.id) {
      return res.status(403).json({ error: "You can only delete campaigns belonging to your NGO." });
    }

    delete db.campaigns[campaignId];
    saveDatabase();
    res.json({ success: true });
  });

  // NGO UPLOAD CAMPAIGN PROGRESS UPDATE
  app.post("/api/campaigns/:id/updates", (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "NGO only access" });
    }

    const campaign = db.campaigns[req.params.id];
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const { title, description, mediaUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and update elements are required." });
    }

    const newUpdate: CampaignUpdate = {
      id: "upd_" + Math.random().toString(36).substr(2, 5),
      campaignId: campaign.id,
      title,
      description,
      mediaUrl,
      createdAt: new Date().toISOString()
    };

    campaign.updates.unshift(newUpdate);

    // Notify campaign donors
    const donorIds = Object.values(db.donations)
      .filter(d => d.campaignId === campaign.id)
      .map(d => d.donorId);

    Array.from(new Set(donorIds)).forEach(did => {
      db.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 5),
        recipientId: did,
        title: `Progress Update: ${campaign.title}`,
        message: `${campaign.ngoName} posted a new update: '${title}'`,
        type: "info",
        read: false,
        createdAt: new Date().toISOString()
      });
    });

    saveDatabase();
    res.status(201).json(newUpdate);
  });

  // NGO UPLOAD CAMPAIGN UTILIZATION REPORT
  app.post("/api/campaigns/:id/reports", (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "NGO only access" });
    }

    const campaign = db.campaigns[req.params.id];
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const { title, description, amountUsed, recipientName, supportingInvoiceUrl } = req.body;
    if (!title || !amountUsed || !recipientName) {
      return res.status(400).json({ error: "Report elements are required" });
    }

    const reportId = "rep_" + Math.random().toString(36).substr(2, 5);
    const newReport: LiabilityReport = {
      id: reportId,
      campaignId: campaign.id,
      title,
      description: description || `Fund usage utilization report for campaign ${campaign.title}.`,
      amountUsed: parseFloat(amountUsed),
      recipientName,
      supportingInvoiceUrl,
      uploadedAt: new Date().toISOString()
    };

    campaign.utilizationReports.unshift(newReport);

    // Update statuses of related donations to "utilized"
    Object.values(db.donations).forEach(d => {
      if (d.campaignId === campaign.id && d.status === "transferred") {
        d.status = "utilized";
      }
    });

    // Notify donors of direct resource transparency
    const donorIds = Object.values(db.donations)
      .filter(d => d.campaignId === campaign.id)
      .map(d => d.donorId);

    Array.from(new Set(donorIds)).forEach(did => {
      db.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 5),
        recipientId: did,
        title: `Fund Utilization Logged: ${campaign.title}`,
        message: `${campaign.ngoName} logged a dynamic expenditure of ₹${amountUsed} for ${recipientName}. Check receipt verification!`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      });
    });

    saveDatabase();
    res.status(201).json(newReport);
  });

  // INITIATE SECURE RAZORPAY PAYMENT
  app.post("/api/donations/create", async (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Donor registration or login required to initiate secure donation checkout." });
    }
    if (user.role === "ngo" || user.role === "admin") {
      return res.status(403).json({ error: "NGO and Admin accounts are not authorized to make contributions." });
    }

    const { campaignId, amount, paymentMethod } = req.body;
    if (!campaignId || !amount || !paymentMethod) {
      return res.status(400).json({ error: "Missing secure checkout particulars." });
    }

    let campaign: any = null;
    if (isSupabaseConfigured) {
      const { data: c, error } = await supabase.from('campaigns').select('id, title, ngo_id, ngo_name').eq('id', campaignId).single();
      if (!error && c) {
        campaign = { id: c.id, title: c.title, ngoId: c.ngo_id, ngoName: c.ngo_name };
      }
    } else {
      campaign = db.campaigns[campaignId];
    }

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const donationId = crypto.randomUUID();

    let isFallbackToSimulated = false;
    let paymentId = "pay_razor_" + Math.random().toString(36).substr(2, 9);
    let orderDetails = {
      orderId: "order_" + Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount) * 100, // in paise
      currency: "INR"
    };

    // If Razorpay is configured, create an actual order
    if (isRazorpayConfigured && razorpayClient) {
      try {
        const options = {
          amount: parseFloat(amount) * 100, // amount in smallest currency unit (paise)
          currency: "INR",
          receipt: donationId
        };
        const order = await razorpayClient.orders.create(options);
        paymentId = "PENDING_REAL_PAYMENT";
        orderDetails = {
          orderId: order.id,
          amount: order.amount as number,
          currency: order.currency
        };
      } catch (error) {
        console.error("Razorpay Order Creation Failed. Falling back to Sandbox Simulation:", error);
        isFallbackToSimulated = true;
        paymentId = "pay_razor_" + Math.random().toString(36).substr(2, 9);
        orderDetails = {
          orderId: "order_" + Math.random().toString(36).substr(2, 9),
          amount: parseFloat(amount) * 100,
          currency: "INR"
        };
      }
    }

    const newDonation: Donation = {
      id: donationId,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      donorId: user.id,
      donorName: user.name,
      ngoId: campaign.ngoId,
      ngoName: campaign.ngoName,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      blockchainHash: "PENDING_RECORD",
      status: "initiated",
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data: newDonationData, error } = await supabase.from('donations').insert({
        id: newDonation.id,
        campaign_id: newDonation.campaignId,
        campaign_title: newDonation.campaignTitle,
        donor_id: newDonation.donorId,
        donor_name: newDonation.donorName,
        ngo_id: newDonation.ngoId,
        ngo_name: newDonation.ngoName,
        amount: newDonation.amount,
        payment_method: newDonation.paymentMethod,
        payment_id: newDonation.paymentId,
        status: newDonation.status
      }).select().single();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Failed to record donation in database: " + error.message });
      }
    } else {
      db.donations[newDonation.id] = newDonation;
      saveDatabase();
    }

    res.status(201).json({
      donation: newDonation,
      razorpayOrder: orderDetails,
      razorpayKeyId: (isRazorpayConfigured && !isFallbackToSimulated) ? process.env.RAZORPAY_KEY_ID : null
    });
  });

  // CREATE RAZORPAY UPI QR CODE
  app.post("/api/donations/qr", async (req: any, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Access Denied" });

    const { donationId, amount, description } = req.body;

    if (!isRazorpayConfigured || !razorpayClient) {
      return res.status(400).json({ error: "Razorpay is not configured" });
    }

    try {
      const amountInPaise = Math.round(parseFloat(amount) * 100);
      const qrPayload: any = {
        type: "upi_qr",
        name: description || "TrustChain Donation",
        usage: "single_use",
        fixed_amount: true,
        payment_amount: amountInPaise,
        description: description || "TrustChain Donation",
        close_by: Math.floor(Date.now() / 1000) + 900, // 15 min expiry
        notes: {
          donation_id: donationId
        }
      };

      const qr = await (razorpayClient as any).qrCode.create(qrPayload);

      return res.json({
        qrId: qr.id,
        imageUrl: qr.image_url,
        closeBy: qr.close_by,
        paymentAmount: qr.payment_amount
      });
    } catch (err: any) {
      console.error("Razorpay QR creation error:", err);
      return res.status(500).json({ error: err.error?.description || err.message || "QR creation failed" });
    }
  });

  // POLL QR CODE PAYMENT STATUS
  app.get("/api/donations/qr/:qrId/status", async (req: any, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Access Denied" });

    const { qrId } = req.params;

    if (!isRazorpayConfigured || !razorpayClient) {
      return res.status(400).json({ error: "Razorpay is not configured" });
    }

    try {
      const payments = await (razorpayClient as any).qrCode.fetchAllPayments(qrId, {});
      const paid = payments?.items?.length > 0;
      const paymentId = paid ? payments.items[0].id : null;
      return res.json({ paid, paymentId, count: payments?.count || 0 });
    } catch (err: any) {
      console.error("QR poll error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // VERIFY PAYMENT & RUN THE PROOF OF WORK BLOCKCHAIN PROCESS
  app.post("/api/donations/verify", async (req, res) => {
    const { donationId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    let donation: any = null;

    if (isSupabaseConfigured) {
      const { data: d, error } = await supabase.from('donations').select('*').eq('id', donationId).single();
      if (!error && d) {
        donation = {
          id: d.id, campaignId: d.campaign_id, donorId: d.donor_id, amount: d.amount,
          paymentMethod: d.payment_method, paymentId: d.payment_id, status: d.status,
          createdAt: d.created_at
        };
      }
    } else {
      donation = db.donations[donationId];
    }

    if (!donation) {
      return res.status(404).json({ error: "Donation record not found" });
    }

    if (donation.status !== "initiated") {
      return res.json({ success: true, message: "Already verified", donation });
    }

    // Cryptographic Signature Verification for Real Razorpay
    if (isRazorpayConfigured && donation.paymentId === "PENDING_REAL_PAYMENT") {
      if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
          .update(body.toString())
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ error: "Invalid payment signature" });
        }
        donation.paymentId = razorpay_payment_id;
      } else {
        donation.paymentId = "pay_razor_" + crypto.randomBytes(4).toString("hex");
      }
    }

    // Step 1: Simulated/Real verification sequence
    if (isSupabaseConfigured) {
      await supabase.from('donations').update({ payment_id: donation.paymentId, status: 'paid' }).eq('id', donationId);
    }

    donation.status = "paid";
    saveDatabase();

    // Perform Blockchain Assembly
    setTimeout(async () => {
      donation.status = "verified";
      saveDatabase();

      let transactionHash = "";

      if (isBlockchainConfigured) {
        try {
          // Real Blockchain Write
          transactionHash = await recordDonationOnChain(donation.id, donation.campaignId, donation.amount);
        } catch (error) {
          console.error("Blockchain error:", error);
          // Fallback to simulated hash if EVM fails in dev
          transactionHash = "0xERROR_" + cyrb128(donation.id)[0].toString(16);
        }
      } else {
        // Simulated PoW for local demo
        const lastBlock = db.blockchain[db.blockchain.length - 1];
        const newBlockIndex = lastBlock.index + 1;
        const previousHash = lastBlock.hash;
        const blockTimestamp = new Date().toISOString();
        const blockPayload = `${newBlockIndex}_${blockTimestamp}_${donation.id}_${donation.amount}_${previousHash}`;
        const miningResult = mineBlock(blockPayload, 4);
        transactionHash = miningResult.hash;

        const newBlock: BlockchainBlock = {
          index: newBlockIndex,
          timestamp: blockTimestamp,
          donationId: donation.id,
          amount: donation.amount,
          campaignId: donation.campaignId,
          campaignTitle: donation.campaignTitle,
          donorHash: "0x" + cyrb128(donation.donorId + donation.donorName)[0].toString(16),
          ngoAddress: "0x" + cyrb128(donation.ngoId + donation.ngoName)[0].toString(16),
          hash: miningResult.hash,
          previousHash,
          nonce: miningResult.nonce
        };
        db.blockchain.push(newBlock);
      }

      // Link donation
      donation.blockchainHash = transactionHash;
      donation.status = "hashed";

      if (isSupabaseConfigured) {
        await supabase.from('donations').update({
          blockchain_hash: transactionHash,
          status: 'hashed'
        }).eq('id', donation.id);
      }

      // Increment Campaign Raised
      if (isSupabaseConfigured) {
        const { data: cData } = await supabase.from('campaigns').select('raised_amount, goal_amount').eq('id', donation.campaignId).single();
        if (cData) {
          const newRaised = cData.raised_amount + donation.amount;
          const status = newRaised >= cData.goal_amount ? "completed" : "active";
          await supabase.from('campaigns').update({ raised_amount: newRaised, status }).eq('id', donation.campaignId);
        }
      } else {
        const camp = db.campaigns[donation.campaignId];
        if (camp) {
          camp.raisedAmount += donation.amount;
          if (camp.raisedAmount >= camp.goalAmount) {
            camp.status = "completed";
          }
        }
      }

      setTimeout(async () => {
        donation.status = "transferred";
        saveDatabase();

        if (isSupabaseConfigured) {
          await supabase.from('donations').update({ status: 'transferred' }).eq('id', donation.id);
        }
      }, 5000);

      // Trigger user feedback notification
      db.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 5),
        recipientId: donation.donorId,
        title: "Block Mined Successfully",
        message: `Your donation of ₹${donation.amount} to '${donation.campaignTitle}' is officially on-ledger! Hash: ${transactionHash.substring(0, 15)}...`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      });

      // NGO notification
      db.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 5),
        recipientId: donation.ngoId,
        title: "New Contribution Received",
        message: `Donor ${donation.donorName} contributed ₹${donation.amount} to your campaign '${donation.campaignTitle}'.`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      });

      saveDatabase();
    }, 1200);

    res.json({
      success: true,
      donationId: donation.id,
      mockPaymentSuccess: !isRazorpayConfigured
    });
  });

  const mapDonation = (d: any) => ({
    id: d.id,
    donorId: d.donor_id,
    donorName: d.donor_name,
    campaignId: d.campaign_id,
    campaignTitle: d.campaign_title,
    ngoId: d.ngo_id,
    amount: d.amount,
    status: d.status,
    blockchainHash: d.blockchain_hash,
    createdAt: d.created_at
  });

  // GET DONOR DONATION LIST
  app.get("/api/donations/user", async (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Access Denied" });
    }

    if (isSupabaseConfigured) {
      const { data } = await supabase.from('donations')
        .select('*, campaigns(category)')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      const mapped = (data || []).map((d: any) => ({
        ...mapDonation(d),
        category: d.campaigns?.category || "Education"
      }));
      return res.json(mapped);
    }

    const list = Object.values(db.donations)
      .filter(d => d.donorId === user.id)
      .map(d => ({
        ...d,
        category: db.campaigns[d.campaignId]?.category || "Education"
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(list);
  });

  // TRACK DONATION STEP BY STEP (Searching by Hash or Donation ID)
  app.get("/api/donations/track/:idOrHash", async (req, res) => {
    const query = req.params.idOrHash;

    if (isSupabaseConfigured) {
      const { data: dData } = await supabase.from('donations').select('*').or(`id.eq.${query},blockchain_hash.eq.${query}`).single();
      if (!dData) return res.status(404).json({ error: "Donation tracking ID or Hash records not registered on ledger." });

      const donation = mapDonation(dData);

      const { data: cData } = await supabase.from('campaigns').select('*').eq('id', donation.campaignId).single();
      const campaign = cData ? {
        id: cData.id, raisedAmount: cData.raised_amount, goalAmount: cData.goal_amount,
        status: cData.status, utilizationReports: cData.utilization_reports || []
      } : null;

      // Fetch actual block proof from blockchain if configured
      let blockProof = null;
      if (donation.blockchainHash && isBlockchainConfigured) {
        const txDetails = await getTransactionDetails(donation.blockchainHash);
        if (txDetails) {
          blockProof = {
            index: txDetails.blockNumber,
            timestamp: txDetails.timestamp || donation.createdAt,
            donationId: donation.id,
            amount: donation.amount,
            campaignId: donation.campaignId,
            campaignTitle: donation.campaignTitle,
            donorHash: txDetails.from || "0x" + Buffer.from(donation.donorId).toString("hex").substring(0, 40),
            ngoAddress: txDetails.to || "0x" + Buffer.from(donation.ngoId).toString("hex").substring(0, 40),
            hash: donation.blockchainHash,
            previousHash: txDetails.blockHash,
            nonce: 0
          };
        }
      }

      if (!blockProof && donation.status !== "initiated" && donation.status !== "pending") {
        blockProof = {
          index: 1000, timestamp: donation.createdAt, donationId: donation.id, amount: donation.amount,
          campaignId: donation.campaignId, campaignTitle: donation.campaignTitle,
          donorHash: "0x" + Buffer.from(donation.donorId).toString("hex").substring(0, 40),
          ngoAddress: "0x" + Buffer.from(donation.ngoId).toString("hex").substring(0, 40),
          hash: donation.blockchainHash, previousHash: "0x0000000000000000000", nonce: 0
        };
      }

      return res.json({ donation, blockProof, campaignMin: campaign });
    }

    const donation = Object.values(db.donations).find(d => d.id === query || d.blockchainHash === query);
    if (!donation) {
      return res.status(404).json({ error: "Donation tracking ID or Hash records not registered on ledger." });
    }

    const linkedBlock = db.blockchain.find(b => b.donationId === donation.id || b.hash === donation.blockchainHash);
    const campaign = db.campaigns[donation.campaignId];

    res.json({
      donation,
      blockProof: linkedBlock || null,
      campaignMin: campaign ? {
        id: campaign.id,
        raisedAmount: campaign.raisedAmount,
        goalAmount: campaign.goalAmount,
        status: campaign.status,
        utilizationReports: campaign.utilizationReports
      } : null
    });
  });

  // PUBLIC BLOCKCHAIN LEDGER RETRIEVAL
  app.get("/api/blockchain", async (req, res) => {
    const { search } = req.query;

    if (isSupabaseConfigured) {
      const { data } = await supabase.from('donations').select('*').neq('status', 'initiated').order('created_at', { ascending: false }).limit(20);

      const enrichedList = await Promise.all((data || []).map(async (d, index) => {
        let blockNumber = index + 1;
        let timestamp = d.created_at;
        let previousHash = index === 0 ? "0x0" : "unknown";

        // Fetch live blockchain data asynchronously for the blocks
        if (d.blockchain_hash && isBlockchainConfigured) {
          const txDetails = await getTransactionDetails(d.blockchain_hash);
          if (txDetails) {
            blockNumber = txDetails.blockNumber;
            timestamp = txDetails.timestamp || timestamp;
            previousHash = txDetails.blockHash;
          }
        }

        return {
          index: blockNumber, timestamp: timestamp, donationId: d.id, amount: d.amount,
          campaignId: d.campaign_id, campaignTitle: d.campaign_title,
          donorHash: "0x" + Buffer.from(d.donor_id).toString("hex").substring(0, 40),
          ngoAddress: "0x" + Buffer.from(d.ngo_id).toString("hex").substring(0, 40),
          hash: d.blockchain_hash, previousHash: previousHash, nonce: 0
        };
      }));

      let list = enrichedList;

      if (search) {
        const q = (search as string).toLowerCase().trim();
        list = list.filter(b =>
          b.hash?.toLowerCase().includes(q) ||
          b.donationId?.toLowerCase().includes(q) ||
          b.campaignTitle?.toLowerCase().includes(q) ||
          b.amount.toString() === q
        );
      }
      return res.json(list);
    }


    let list = [...db.blockchain];

    if (search) {
      const q = (search as string).toLowerCase().trim();
      list = list.filter(b =>
        b.hash.toLowerCase().includes(q) ||
        b.donationId.toLowerCase().includes(q) ||
        b.campaignTitle.toLowerCase().includes(q) ||
        b.amount.toString() === q
      );
    }

    res.json(list.reverse()); // Latest blocks first
  });

  // GET SINGLE BLOCK BY HASH OR INDEX
  app.get("/api/blockchain/block/:idAndHash", async (req, res) => {
    const q = req.params.idAndHash;

    if (isSupabaseConfigured) {
      const { data } = await supabase.from('donations').select('*').neq('status', 'initiated').eq('blockchain_hash', q).single();
      if (!data) return res.status(404).json({ error: "Block not mined yet." });

      const donation = mapDonation(data);
      const block = {
        index: 1000, timestamp: donation.createdAt, donationId: donation.id, amount: donation.amount,
        campaignId: donation.campaignId, campaignTitle: donation.campaignTitle,
        donorHash: "0x" + Buffer.from(donation.donorId).toString("hex").substring(0, 40),
        ngoAddress: "0x" + Buffer.from(donation.ngoId).toString("hex").substring(0, 40),
        hash: donation.blockchainHash, previousHash: "0x0", nonce: 0
      };

      return res.json({ block, donation });
    }

    const block = db.blockchain.find(b => b.hash === q || b.index.toString() === q);
    if (!block) {
      return res.status(404).json({ error: "Block not mined yet." });
    }
    const donation = db.donations[block.donationId];
    res.json({ block, donation: donation || null });
  });

  // PLATFORM HEALTH & ANALYTICAL METRICS
  app.get("/api/stats", async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const { data: donations } = await supabase.from('donations').select('amount, donor_id').neq('status', 'initiated');
        const totalDonations = (donations || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const donorIds = new Set((donations || []).map(d => d.donor_id));

        const { count: verifiedNGOs } = await supabase.from('ngos').select('*', { count: 'exact', head: true }).eq('verified', 'approved');
        const { count: activeCampaigns } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active');

        return res.json({
          totalDonations: totalDonations,
          totalDonors: donorIds.size,
          verifiedNGOs: verifiedNGOs || 0,
          activeCampaigns: activeCampaigns || 0
        });
      } catch (err) {
        console.error("Stats Error:", err);
        return res.json({ totalDonations: 0, totalDonors: 0, verifiedNGOs: 0, activeCampaigns: 0 });
      }
    }

    const donationsList = Object.values(db.donations).filter(d => d.status !== "initiated");
    const totalDonations = donationsList.reduce((acc, current) => acc + current.amount, 0);
    const donorIds = donationsList.map(d => d.donorId);
    const totalDonors = new Set(donorIds).size;
    const verifiedNGOs = Object.values(db.ngos).filter(n => n.verified === "approved").length;
    const activeCampaigns = Object.values(db.campaigns).filter(c => c.status === "active").length;

    res.json({
      totalDonations,
      totalDonors,
      verifiedNGOs,
      activeCampaigns
    });
  });

  // VIEW SYSTEM NOTIFICATIONS
  app.get("/api/notifications", (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.json([]);
    }

    let list = db.notifications.filter(n => n.recipientId === user.id);
    if (user.role === "admin") {
      list = list.concat(db.notifications.filter(n => n.recipientId === "admin"));
    }

    res.json(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  // READ ALL SYSTEM NOTIFICATIONS
  app.post("/api/notifications/read", (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Access Denied" });
    }

    db.notifications.forEach(n => {
      if (n.recipientId === user.id || (user.role === "admin" && n.recipientId === "admin")) {
        n.read = true;
      }
    });

    saveDatabase();
    res.json({ success: true });
  });

  // ADMIN OPERATIONS
  // ADMIN OPERATIONS
  app.get("/api/admin/requests", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized access: Administrator only authorization." });
    }

    if (isSupabaseConfigured) {
      const { data: pendingNGOs } = await supabase.from('ngos').select('*').eq('verified', 'pending');
      const { data: pendingCampaigns } = await supabase.from('campaigns').select('*').eq('status', 'pending');
      const { data: allNGOs } = await supabase.from('ngos').select('*');

      const mapNgo = (n: any) => ({
        id: n.id, userId: n.user_id, ngoName: n.ngo_name, registrationNumber: n.registration_number,
        description: n.description, verified: n.verified, documents: n.documents, logo: n.logo,
        bankAccount: n.bank_account, ifscCode: n.ifsc_code, upiId: n.upi_id,
        createdAt: n.created_at
      });

      const mapCampaign = (c: any) => ({
        id: c.id, ngoId: c.ngo_id, ngoName: c.ngo_name, title: c.title, description: c.description,
        category: c.category, goalAmount: c.goal_amount, raisedAmount: c.raised_amount,
        beneficiaryCount: c.beneficiary_count, deadline: c.deadline, location: c.location,
        bannerImage: c.banner_image, supportingDocuments: c.supporting_documents,
        status: c.status, createdAt: c.created_at
      });

      return res.json({
        pendingNGOs: (pendingNGOs || []).map(mapNgo),
        pendingCampaigns: (pendingCampaigns || []).map(mapCampaign),
        allNGOs: (allNGOs || []).map(mapNgo)
      });
    }

    const pendingNGOs = Object.values(db.ngos).filter(n => n.verified === "pending");
    const pendingCampaigns = Object.values(db.campaigns).filter(c => c.status === "pending");
    const allNGOs = Object.values(db.ngos);

    res.json({
      pendingNGOs,
      pendingCampaigns,
      allNGOs
    });
  });

  // ADMIN VERIFY NGO
  // ADMIN VERIFY NGO
  app.post("/api/admin/ngos/:id/verify", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin account required" });
    }

    const { action } = req.body; // 'approve' or 'reject'
    const newStatus = action === "approve" ? "approved" : "rejected";

    if (isSupabaseConfigured) {
      const { data: ngo, error } = await supabase.from('ngos').update({ verified: newStatus }).eq('id', req.params.id).select().single();
      if (!ngo || error) {
        return res.status(404).json({ error: "NGO record not found" });
      }

      await supabase.from('notifications').insert({
        recipient_id: ngo.user_id,
        title: action === "approve" ? "NGO Documents Approved!" : "NGO Documents Rejected",
        message: action === "approve"
          ? "Congratulations, your NGO verification is validated! You are now fully permitted to launch social campaigns."
          : "Your documents did not pass validator oversight. Please check compliance guidelines.",
        type: action === "approve" ? "success" : "warning",
      });

      return res.json({ success: true, ngo });
    }

    const ngo = db.ngos[req.params.id];
    if (!ngo) {
      return res.status(404).json({ error: "NGO record not found" });
    }

    ngo.verified = newStatus;

    // Add alert notification for NGO User
    db.notifications.push({
      id: "notif_" + Math.random().toString(36).substr(2, 5),
      recipientId: ngo.userId,
      title: action === "approve" ? "NGO Documents Approved!" : "NGO Documents Rejected",
      message: action === "approve"
        ? "Congratulations, your NGO verification is validated! You are now fully permitted to launch social campaigns."
        : "Your documents did not pass validator oversight. Please check compliance guidelines.",
      type: action === "approve" ? "success" : "warning",
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    res.json({ success: true, ngo });
  });

  // ADMIN APPROVE CAMPAIGN
  // ADMIN APPROVE CAMPAIGN
  app.post("/api/admin/campaigns/:id/verify", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin account required" });
    }

    const { action } = req.body;
    const newStatus = action === "approve" ? "active" : "rejected";

    if (isSupabaseConfigured) {
      const { data: campaign, error } = await supabase.from('campaigns').update({ status: newStatus }).eq('id', req.params.id).select().single();
      if (!campaign || error) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const { data: ngo } = await supabase.from('ngos').select('user_id').eq('id', campaign.ngo_id).single();
      if (ngo) {
        await supabase.from('notifications').insert({
          recipient_id: ngo.user_id,
          title: action === "approve" ? "Campaign Live Verified!" : "Campaign Request Status updated",
          message: action === "approve"
            ? `Your active fundraiser campaign: '${campaign.title}' is officially approved and live to global donors.`
            : `Your campaign '${campaign.title}' proposal was declined.`,
          type: action === "approve" ? "success" : "warning",
        });
      }

      return res.json({ success: true, campaign });
    }

    const campaign = db.campaigns[req.params.id];
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    campaign.status = newStatus;

    // Notification for NGO creator
    const ngo = db.ngos[campaign.ngoId];
    if (ngo) {
      db.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 5),
        recipientId: ngo.userId,
        title: action === "approve" ? "Campaign Live Verified!" : "Campaign Request Status updated",
        message: action === "approve"
          ? `Your active fundraiser campaign: '${campaign.title}' is officially approved and live to global donors.`
          : `Your campaign '${campaign.title}' proposal was declined.`,
        type: action === "approve" ? "success" : "warning",
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDatabase();
    res.json({ success: true, campaign });
  });

  // NGO DASHBOARD PERFORMANCE ANALYTICS
  app.get("/api/ngo/analytics", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "Access Denied" });
    }

    if (isSupabaseConfigured) {
      const { data: ngo } = await supabase.from('ngos').select('*').eq('user_id', user.id).single();
      if (!ngo) return res.status(404).json({ error: "NGO profile not found" });

      const { data: campaigns } = await supabase.from('campaigns').select('*').eq('ngo_id', ngo.id);
      const activeCount = (campaigns || []).filter(c => c.status === "active").length;
      const completedCount = (campaigns || []).filter(c => c.status === "completed").length;

      const { data: donations } = await supabase.from('donations').select('*').eq('ngo_id', ngo.id).neq('status', 'initiated');
      const totalRaised = (donations || []).reduce((sum, d) => sum + d.amount, 0);
      const donorsCount = new Set((donations || []).map(d => d.donor_id)).size;

      const mapCampaign = (c: any) => ({
        id: c.id, ngoId: c.ngo_id, ngoName: c.ngo_name, title: c.title, description: c.description,
        category: c.category, goalAmount: c.goal_amount, raisedAmount: c.raised_amount,
        beneficiaryCount: c.beneficiary_count, deadline: c.deadline, location: c.location,
        bannerImage: c.banner_image, supportingDocuments: c.supporting_documents,
        status: c.status, createdAt: c.created_at
      });

      return res.json({
        totalRaised, activeCount, completedCount, donorsCount,
        campaigns: (campaigns || []).map(mapCampaign),
        recentDonations: (donations || []).slice(0, 10).map(mapDonation)
      });
    }

    const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
    if (!ngo) {
      return res.status(404).json({ error: "NGO profile not found" });
    }

    const campaignList = Object.values(db.campaigns).filter(c => c.ngoId === ngo.id);
    const activeCount = campaignList.filter(c => c.status === "active").length;
    const completedCount = campaignList.filter(c => c.status === "completed").length;

    const donationsForNgo = Object.values(db.donations)
      .filter(d => d.ngoId === ngo.id && d.status !== "initiated");

    const totalRaised = donationsForNgo.reduce((sum, d) => sum + d.amount, 0);
    const donorsCount = new Set(donationsForNgo.map(d => d.donorId)).size;

    res.json({
      totalRaised,
      activeCount,
      completedCount,
      donorsCount,
      campaigns: campaignList,
      recentDonations: donationsForNgo.slice(0, 10)
    });
  });

  // NGO VERIFICATION SUBMIT
  app.post("/api/ngo/verify-submit", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "ngo") {
      return res.status(403).json({ error: "NGO authentication required to submit registration credentials" });
    }

    const { registrationNumber, documents } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: "At least one verification document (such as a PDF registration certificate) is required." });
    }

    if (isSupabaseConfigured) {
      const { data: ngo } = await supabase.from('ngos').select('*').eq('user_id', user.id).single();
      if (!ngo) return res.status(404).json({ error: "NGO profile record could not be found." });

      const updatedDocs = [
        ...(ngo.documents || []),
        ...documents.map((doc: any) => ({ name: doc.name || "Verification_Document.pdf", url: doc.url || "#" }))
      ];

      const { data: updatedNgo } = await supabase.from('ngos').update({
        registration_number: registrationNumber || ngo.registration_number,
        documents: updatedDocs,
        verified: 'pending'
      }).eq('id', ngo.id).select().single();

      await supabase.from('notifications').insert({
        recipient_id: '00000000-0000-0000-0000-000000000001',
        title: "New NGO Verification Received",
        message: `${ngo.ngo_name} has submitted ${documents.length} document(s) for verification review.`,
        type: "info"
      });

      return res.json({ success: true, ngo: updatedNgo });
    }

    const ngo = Object.values(db.ngos).find(n => n.userId === user.id);
    if (!ngo) {
      return res.status(404).json({ error: "NGO profile record could not be found." });
    }

    if (registrationNumber) {
      ngo.registrationNumber = registrationNumber;
    }

    // Append new documents
    ngo.documents = [
      ...(ngo.documents || []),
      ...documents.map((doc: any) => ({
        name: doc.name || "Verification_Document.pdf",
        url: doc.url || "#"
      }))
    ];

    // Set verification to pending
    ngo.verified = "pending";

    // Add notification to admin
    db.notifications.push({
      id: "notif_" + Math.random().toString(36).substr(2, 5),
      recipientId: "admin",
      title: "New NGO Verification Received",
      message: `${ngo.ngoName} has submitted ${documents.length} document(s) for verification review.`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    res.json({ success: true, ngo });
  });

  // DYNAMIC APP ENVIRONMENT SETUP
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TrustChain secure startup server hosting on http://localhost:${PORT}`);
  });
}

startServer();
