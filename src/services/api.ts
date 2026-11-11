/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const TOKEN_KEY = "trustchain_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(params: any) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    const data = await handleResponse(res);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async login(params: any) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    const data = await handleResponse(res);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getMe() {
    if (!getAuthToken()) return { user: null, ngo: null };
    const res = await fetch("/api/auth/me", {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(profileData: any) {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  logout() {
    removeAuthToken();
  },

  // Campaigns
  async getCampaigns(filters?: { search?: string; category?: string; sort?: string }) {
    const query = new URLSearchParams();
    if (filters?.search) query.append("search", filters.search);
    if (filters?.category) query.append("category", filters.category);
    if (filters?.sort) query.append("sort", filters.sort);

    const res = await fetch(`/api/campaigns?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getCampaignDetails(id: string) {
    const res = await fetch(`/api/campaigns/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createCampaign(campaignData: any) {
    const res = await fetch("/api/campaigns/create", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(res);
  },

  async editCampaign(id: string, campaignData: any) {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(res);
  },

  async deleteCampaign(id: string) {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async uploadUpdate(campaignId: string, updateData: any) {
    const res = await fetch(`/api/campaigns/${campaignId}/updates`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(res);
  },

  async uploadReport(campaignId: string, reportData: any) {
    const res = await fetch(`/api/campaigns/${campaignId}/reports`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(reportData)
    });
    return handleResponse(res);
  },

  // Donations & Payments
  async initiateDonation(params: { campaignId: string; amount: number; paymentMethod: string }) {
    const res = await fetch("/api/donations/create", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    return handleResponse(res);
  },

  async verifyPayment(params: { donationId: string; razorpay_payment_id?: string; razorpay_order_id?: string; razorpay_signature?: string }) {
    const res = await fetch("/api/donations/verify", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    return handleResponse(res);
  },

  async createDonationQr(params: { donationId: string; amount: number; description: string }) {
    const res = await fetch("/api/donations/qr", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    return handleResponse(res);
  },

  async pollQrPayment(qrId: string) {
    const res = await fetch(`/api/donations/qr/${qrId}/status`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getMyDonations() {
    const res = await fetch("/api/donations/user", {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async trackDonation(idOrHash: string) {
    const res = await fetch(`/api/donations/track/${idOrHash}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Blockchain Ledger Explorer
  async getBlockchain(search?: string) {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    const res = await fetch(`/api/blockchain?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getBlockDetails(idAndHash: string) {
    const res = await fetch(`/api/blockchain/block/${idAndHash}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Global Analytical Statistics
  async getStats() {
    const res = await fetch("/api/stats", {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    if (!getAuthToken()) return [];
    const res = await fetch("/api/notifications", {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async readNotifications() {
    const res = await fetch("/api/notifications/read", {
      method: "POST",
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // NGO Analytics Dashboard
  async getNgoAnalytics() {
    const res = await fetch("/api/ngo/analytics", { headers: getHeaders() });
    return handleResponse(res);
  },

  async updateNgoProfile(payload: any) {
    const res = await fetch("/api/ngos/profile", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async submitNgoVerification(params: { registrationNumber?: string; documents: { name: string; url: string }[] }) {
    const res = await fetch("/api/ngo/verify-submit", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    return handleResponse(res);
  },

  // Admin Verification Panel
  async getAdminRequests() {
    const res = await fetch("/api/admin/requests", {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async adminVerifyNGO(ngoId: string, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/ngos/${ngoId}/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ action })
    });
    return handleResponse(res);
  },

  async adminVerifyCampaign(campaignId: string, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/campaigns/${campaignId}/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ action })
    });
    return handleResponse(res);
  }
};
