import https from "https";
import fs from "fs";
import path from "path";

const diagrams: { [key: string]: string } = {
  block_diagram: `graph TD
    Donor[Donor Client] -->|Browse / Pay / Verify| Server[TrustChain Backend Express]
    NGO[NGO Client] -->|Submit Docs / Launch Campaigns| Server
    Admin[Admin Client] -->|Approve NGOs & Campaigns| Server
    Server -->|Persist Metadata| DB[(Supabase Database)]
    Server -->|Secure On-Chain logs| BC[Ethereum Sepolia Testnet]`,
  
  usecase: `left-to-right direction
actor Donor
actor NGO
actor Admin
rectangle TrustChain {
    Donor --> (Browse Campaigns)
    Donor --> (Make Donations)
    Donor --> (Verify Receipts on Ledger)
    NGO --> (Register & Submit Documents)
    NGO --> (Create Fundraising Campaigns)
    NGO --> (Upload Reports)
    Admin --> (Verify NGO Registrations)
    Admin --> (Approve Campaign Proposals)
    Admin --> (Monitor System Stats)
}`,

  architecture: `graph LR
    subgraph Presentation Layer
        React[React.js SPA Client]
    end
    subgraph Application Layer
        Express[Node.js / Express Server]
    end
    subgraph Data Layer
        Supabase[(Supabase PG Database)]
        Ethereum[Ethereum Sepolia Contract]
    end
    React <-->|REST APIs & JWT| Express
    Express <-->|SQL Queries| Supabase
    Express -->|Ethers.js Transactions| Ethereum`,

  dfd0: `graph TD
    Users[Donors & NGOs] -->|Credentials & Inputs| System((TrustChain Engine))
    System -->|Dashboards & Receipts| Users
    Admin[Admin User] -->|Verification Commands| System
    System -->|System Metrics| Admin
    System -->|On-Chain Transactions| Sepolia[Sepolia Blockchain]`,

  dfd1: `graph TD
    Auth[Auth Router] -->|Validate Auth| DB[(Supabase DB)]
    Campaign[Campaign Manager] -->|Fetch/Create Campaigns| DB
    Donation[Donation Router] -->|Trigger Payment| Gateway[Razorpay Gateway]
    Donation -->|Record Tx status| DB
    Donation -->|Record on Contract| BC[Ethereum Sepolia]
    Ledger[Ledger Router] -->|Verify Receipt| BC
    Ledger -->|Load Metadata| DB`,

  class_diagram: `classDiagram
    class User {
        +UUID id
        +String email
        +String name
        +String role
        +String password_hash
        +register()
        +login()
    }
    class NGO {
        +UUID id
        +UUID user_id
        +String ngo_name
        +String registration_number
        +String verified
    }
    class Campaign {
        +UUID id
        +UUID ngo_id
        +String title
        +Number goal_amount
        +Number raised_amount
        +String status
    }
    class Donation {
        +UUID id
        +UUID campaign_id
        +UUID donor_id
        +Number amount
        +String status
        +String blockchain_hash
    }
    User "1" --> "0..1" NGO
    NGO "1" --> "0..*" Campaign
    Campaign "1" --> "0..*" Donation
    User "1" --> "0..*" Donation : donor`,

  sequence: `sequenceDiagram
    actor Donor
    participant Client as React Client
    participant Server as Express Server
    participant DB as Supabase DB
    participant BC as Sepolia Testnet
    Donor ->> Client: Initiate Donation
    Client ->> Server: POST /api/donations/create
    Server ->> DB: Insert Donation (initiated)
    Server ->> BC: recordDonation()
    BC -->> Server: Tx Hash
    Server ->> DB: Update Donation (completed)
    Server -->> Client: Return Tx Hash
    Client -->> Donor: Show Block Receipt`,

  er: `erDiagram
    USERS {
        uuid id
        text email
        text name
        text role
        text password_hash
    }
    NGOS {
        uuid id
        uuid user_id
        text ngo_name
        text registration_number
        text verified
    }
    CAMPAIGNS {
        uuid id
        uuid ngo_id
        text title
        numeric goal_amount
        numeric raised_amount
        text status
    }
    DONATIONS {
        uuid id
        uuid campaign_id
        uuid donor_id
        uuid ngo_id
        numeric amount
        text status
        text blockchain_hash
    }
    USERS ||--o| NGOS : ""
    USERS ||--o{ DONATIONS : ""
    NGOS ||--o{ CAMPAIGNS : ""
    CAMPAIGNS ||--o{ DONATIONS : ""
    NGOS ||--o{ DONATIONS : ""`
};

const outputDir = path.join(process.cwd(), "assets", "diagrams");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadDiagram(name: string, code: string) {
  return new Promise<void>((resolve, reject) => {
    // We clean up the code for URL encoding
    const encoded = Buffer.from(JSON.stringify({ code, mermaid: { theme: "default" } })).toString("base64url");
    const url = `https://mermaid.ink/img/${encoded}`;
    
    const file = fs.createWriteStream(path.join(outputDir, `${name}.png`));
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${name}: status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log(`Downloaded ${name}.png`);
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(path.join(outputDir, `${name}.png`), () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const [name, code] of Object.entries(diagrams)) {
    try {
      await downloadDiagram(name, code);
    } catch (e) {
      console.error(e);
    }
  }
}

run();
