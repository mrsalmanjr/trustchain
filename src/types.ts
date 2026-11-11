/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "donor" | "ngo" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  preferredCategory?: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    milestones: boolean;
  };
}

export interface NGOProfile {
  id: string;
  userId: string;
  ngoName: string;
  registrationNumber: string;
  description: string;
  verified: "pending" | "approved" | "rejected";
  documents: { name: string; url: string }[];
  logo: string;
  createdAt: string;
}

export type CampaignCategory = 
  | "Education"
  | "Medical"
  | "Disaster Relief"
  | "Animal Welfare"
  | "Environment"
  | "Community Support";

export type CampaignStatus = "pending" | "approved" | "rejected" | "active" | "completed";

export interface Campaign {
  id: string;
  ngoId: string;
  ngoName: string;
  title: string;
  description: string;
  category: CampaignCategory;
  goalAmount: number;
  raisedAmount: number;
  beneficiaryCount: number;
  deadline: string;
  location: string;
  bannerImage: string;
  supportingDocuments: string[];
  status: CampaignStatus;
  createdAt: string;
  utilizationReports: LiabilityReport[];
  updates: CampaignUpdate[];
}

export interface LiabilityReport {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  amountUsed: number;
  recipientName: string;
  supportingInvoiceUrl?: string;
  uploadedAt: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  mediaUrl?: string;
  createdAt: string;
}

export type PaymentMethod = "UPI" | "Card" | "Net Banking";

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorId: string;
  donorName: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentId: string;
  blockchainHash: string;
  status: "initiated" | "paid" | "verified" | "hashed" | "transferred" | "utilized" | "impacted";
  createdAt: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  donationId: string;
  amount: number;
  campaignId: string;
  campaignTitle: string;
  donorHash: string;
  ngoAddress: string;
  hash: string;
  previousHash: string;
  nonce: number;
}

export interface Notification {
  id: string;
  recipientId: string; // userId or NGO id or "admin"
  title: string;
  message: string;
  type: "success" | "info" | "warning";
  read: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalDonations: number;
  totalDonors: number;
  verifiedNGOs: number;
  activeCampaigns: number;
}
