# TrustChain 🛡️

> **Blockchain-Enabled Transparent Charity Platform**  
> Bringing end-to-end accountability, real-time donation tracking, and immutable proof-of-impact to philanthropic giving.

---

## 🌟 Overview

**TrustChain** solves the lack of transparency in traditional charity ecosystems. By combining modern web technologies with EVM-compatible blockchain verification and Supabase backend services, TrustChain guarantees that every donation is traceable from the donor's wallet to verified milestone expenditures by NGOs.

---

## ✨ Key Features

- **🏛️ Multi-Role Portals**:
  - **Donors**: Discover verified charity campaigns, contribute via Razorpay or simulated gateways, track donation status in real time, and view on-chain proof.
  - **NGOs**: Create campaigns, request milestone disbursements, submit expense receipts, and publish detailed liability/utilization reports.
  - **Admins**: Review and verify NGO credentials, audit campaign expenditure, and manage platform integrity.
- **⛓️ Immutable Blockchain Ledger**: Records cryptographic hashes of donations and liability milestone reports on Polygon (EVM-compatible) smart contracts.
- **🔍 Public Blockchain Explorer**: Live block viewer and hash verifier to independently validate any transaction without intermediaries.
- **💳 Payment Gateway**: Integrated Razorpay payment workflow (UPI / Cards / NetBanking) with automated fallback simulation for sandbox testing.
- **📊 Interactive Impact Visualizations**: Live interactive map showing campaign locations, category filtering, and real-time donation leaderboards.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Backend** | Node.js, Express, TypeScript (`tsx`) |
| **Database & Auth** | Supabase (PostgreSQL, Row-Level Security, JWT Auth) |
| **Blockchain** | Solidity Smart Contracts (`TrustChainLedger.sol`), Ethers.js v6, Polygon Amoy Testnet |
| **Payments** | Razorpay SDK & Webhooks |

---

## 📁 Project Structure

```text
trustchain/
├── contracts/               # Solidity Smart Contracts (TrustChainLedger.sol)
├── src/
│   ├── components/          # React components (Dashboards, Explorer, Auth, UI)
│   ├── lib/                 # Core utilities (blockchain, supabase, razorpay, pdf)
│   ├── services/            # API service layer (api.ts)
│   ├── App.tsx              # Main application router and state
│   └── types.ts             # TypeScript domain definitions
├── supabase/                # Database migrations & schema (schema.sql)
├── server.ts                # Express backend API & Vite integration
├── package.json             # Project dependencies and npm scripts
└── .env.example             # Template for required environment variables
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9+) or **yarn** / **pnpm**
- A **Supabase** project (or local Supabase instance)
- *(Optional)* EVM RPC URL & Private Key for testnet on-chain recording
- *(Optional)* Razorpay test keys for live payment processing

### 2. Clone and Install

```bash
git clone https://github.com/mrsalmanjr/trustchain.git
cd trustchain
npm install
```

### 3. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret key |
| `RAZORPAY_KEY_ID` | *(Optional)* Razorpay Test Key ID |
| `RAZORPAY_KEY_SECRET` | *(Optional)* Razorpay Key Secret |
| `BLOCKCHAIN_RPC_URL` | *(Optional)* EVM RPC (e.g., Polygon Amoy) |
| `BLOCKCHAIN_PRIVATE_KEY` | *(Optional)* Wallet private key for signing contract txs |
| `BLOCKCHAIN_CONTRACT_ADDRESS`| *(Optional)* Address of deployed `TrustChainLedger` contract |

> **Note**: If Razorpay or Blockchain keys are omitted, the application runs seamlessly in simulated/sandbox mode for evaluation.

### 4. Database Setup

Execute the SQL script in `supabase/schema.sql` in your Supabase SQL Editor to create the required tables, relations, and indexes.

### 5. Run the Application

```bash
npm run dev
```

Open your browser at `http://localhost:3000` (or the port specified by Vite/Express).

---

## 📜 Smart Contract

The on-chain ledger contract is located at `contracts/TrustChainLedger.sol`.  
It can be compiled and deployed via Remix, Hardhat, or Foundry to any EVM-compatible chain (Polygon Amoy, Sepolia, Arbitrum, etc.).

---

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).
