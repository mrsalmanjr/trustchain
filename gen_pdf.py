import base64
import subprocess
import os

def img_to_base64(path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode()
    return ""

d = "assets/diagrams"
imgs = {
    "block": img_to_base64(f"{d}/block_diagram.png"),
    "usecase": img_to_base64(f"{d}/usecase.png"),
    "arch": img_to_base64(f"{d}/architecture.png"),
    "dfd0": img_to_base64(f"{d}/dfd0.png"),
    "dfd1": img_to_base64(f"{d}/dfd1.png"),
    "cls": img_to_base64(f"{d}/class_diagram.png"),
    "seq": img_to_base64(f"{d}/sequence.png"),
    "er": img_to_base64(f"{d}/er.png"),
}

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Courier+New&display=swap');
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
    background: #fff;
  }}
  .page {{
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 25mm 25mm 20mm 30mm;
  }}
  h1 {{ font-size: 18pt; text-align: center; margin-bottom: 6px; }}
  h2 {{ font-size: 15pt; text-align: center; margin-bottom: 20px; color: #333; }}
  .separator {{ border: none; border-top: 2px solid #000; margin: 20px 0; }}
  .toc-title {{ font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 16px; letter-spacing: 2px; }}
  .toc {{ margin-bottom: 30px; }}
  .toc-item {{ display: flex; justify-content: space-between; padding: 2px 0; }}
  .toc-item.chapter {{ font-weight: bold; margin-top: 8px; }}
  .toc-item.sub {{ padding-left: 20px; }}
  .toc-item.subsub {{ padding-left: 40px; }}
  .toc-dots {{ flex: 1; border-bottom: 1px dotted #000; margin: 0 4px 4px 4px; }}
  .chapter-heading {{
    font-size: 16pt;
    font-weight: bold;
    margin: 40px 0 16px 0;
    page-break-before: always;
  }}
  .chapter-heading:first-of-type {{ page-break-before: avoid; }}
  h3 {{ font-size: 13pt; font-weight: bold; margin: 20px 0 10px 0; }}
  h4 {{ font-size: 12pt; font-weight: bold; margin: 14px 0 8px 0; font-style: italic; }}
  p {{ margin-bottom: 10px; text-align: justify; }}
  ul, ol {{ margin: 8px 0 8px 24px; }}
  li {{ margin-bottom: 4px; }}
  .figure-label {{
    text-align: center;
    font-style: italic;
    font-size: 10pt;
    margin: 6px 0 20px 0;
    color: #333;
  }}
  .diagram {{
    text-align: center;
    margin: 16px 0 4px 0;
    page-break-inside: avoid;
  }}
  .diagram img {{
    max-width: 100%;
    max-height: 220px;
    object-fit: contain;
    border: 1px solid #ccc;
    padding: 8px;
    background: #fafafa;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 20px 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }}
  th {{
    background: #2c3e50;
    color: #fff;
    padding: 8px 10px;
    border: 1px solid #999;
    text-align: left;
    font-weight: bold;
  }}
  td {{
    padding: 6px 10px;
    border: 1px solid #bbb;
  }}
  tr:nth-child(even) {{ background: #f2f2f2; }}
  .table-label {{
    font-style: italic;
    font-size: 10pt;
    margin-bottom: 14px;
    color: #333;
  }}
  .code-block {{
    background: #f4f4f4;
    border: 1px solid #ccc;
    border-left: 4px solid #2c3e50;
    padding: 12px;
    font-family: "Courier New", monospace;
    font-size: 9pt;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 10px 0 16px 0;
    page-break-inside: avoid;
  }}
  .cover {{
    text-align: center;
    padding-top: 80px;
    min-height: 297mm;
  }}
  .cover .logo {{ font-size: 60pt; margin-bottom: 20px; }}
  .cover h1 {{ font-size: 28pt; margin-bottom: 10px; letter-spacing: 2px; }}
  .cover h2 {{ font-size: 16pt; color: #555; border: none; }}
  .cover .subtitle {{ font-size: 13pt; color: #666; margin-top: 10px; }}
  .cover .divider {{ width: 60%; border: 2px solid #2c3e50; margin: 30px auto; }}
  .cover .meta {{ margin-top: 60px; font-size: 12pt; line-height: 2; }}
  @media print {{
    .page {{ padding: 20mm 20mm 20mm 25mm; }}
    .chapter-heading {{ page-break-before: always; }}
  }}
  @page {{ size: A4; margin: 0; }}
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page cover">
  <div class="logo">⛓</div>
  <h1>TrustChain</h1>
  <div class="subtitle">Blockchain-Enabled Transparent Charity Platform</div>
  <div class="divider"></div>
  <h2>Project Documentation &amp; Technical Report</h2>
  <div class="meta">
    <strong>Platform:</strong> React.js &bull; Node.js &bull; Supabase &bull; Ethereum Sepolia<br>
    <strong>Contract:</strong> 0x77fc100F4bfEFE0EC99d2BC62b40ea6Ecd6f5c3c<br>
    <strong>Network:</strong> Ethereum Sepolia Testnet<br>
    <strong>Version:</strong> 1.0.0 &mdash; Production Release
  </div>
</div>

<!-- MAIN CONTENT -->
<div class="page">

<!-- TABLE OF CONTENTS -->
<div class="toc-title">TABLE OF CONTENTS</div>
<div class="toc">
  <div class="toc-item chapter"><span>1. Introduction</span><span class="toc-dots"></span><span>1</span></div>
  <div class="toc-item sub"><span>1.1 Literature Survey</span><span class="toc-dots"></span><span>1</span></div>
  <div class="toc-item sub"><span>1.2 Challenges and Motivation</span><span class="toc-dots"></span><span>1</span></div>
  <div class="toc-item sub"><span>1.3 Objectives of the Project</span><span class="toc-dots"></span><span>2</span></div>
  <div class="toc-item sub"><span>1.4 Problem Definition</span><span class="toc-dots"></span><span>2</span></div>
  <div class="toc-item chapter"><span>2. Proposed System</span><span class="toc-dots"></span><span>3</span></div>
  <div class="toc-item sub"><span>2.1 Architecture &amp; Block Diagram</span><span class="toc-dots"></span><span>3</span></div>
  <div class="toc-item sub"><span>2.2 Description of Target Users</span><span class="toc-dots"></span><span>3</span></div>
  <div class="toc-item subsub"><span>2.2.1 Advantages</span><span class="toc-dots"></span><span>4</span></div>
  <div class="toc-item subsub"><span>2.2.2 Applications</span><span class="toc-dots"></span><span>4</span></div>
  <div class="toc-item subsub"><span>2.2.3 Scope</span><span class="toc-dots"></span><span>4</span></div>
  <div class="toc-item chapter"><span>3. Software Requirement Specification (SRS)</span><span class="toc-dots"></span><span>5</span></div>
  <div class="toc-item sub"><span>3.1 Overview of SRS</span><span class="toc-dots"></span><span>5</span></div>
  <div class="toc-item sub"><span>3.2 Requirement Specifications</span><span class="toc-dots"></span><span>5</span></div>
  <div class="toc-item sub"><span>3.3 Software &amp; Hardware Requirements</span><span class="toc-dots"></span><span>7</span></div>
  <div class="toc-item sub"><span>3.4 GUI Walkthrough</span><span class="toc-dots"></span><span>7</span></div>
  <div class="toc-item chapter"><span>4. System Design</span><span class="toc-dots"></span><span>8</span></div>
  <div class="toc-item sub"><span>4.1 Architecture of the System</span><span class="toc-dots"></span><span>8</span></div>
  <div class="toc-item sub"><span>4.2 Class Diagram</span><span class="toc-dots"></span><span>10</span></div>
  <div class="toc-item sub"><span>4.3 Sequence Diagram</span><span class="toc-dots"></span><span>11</span></div>
  <div class="toc-item sub"><span>4.4 ER Diagram</span><span class="toc-dots"></span><span>12</span></div>
  <div class="toc-item sub"><span>4.5 Database Table Schemas</span><span class="toc-dots"></span><span>13</span></div>
  <div class="toc-item chapter"><span>5. Implementation</span><span class="toc-dots"></span><span>15</span></div>
  <div class="toc-item sub"><span>5.1 Methodology (Waterfall)</span><span class="toc-dots"></span><span>15</span></div>
  <div class="toc-item sub"><span>5.2 Requirement Analysis</span><span class="toc-dots"></span><span>15</span></div>
  <div class="toc-item sub"><span>5.3 Smart Contract Code</span><span class="toc-dots"></span><span>16</span></div>
  <div class="toc-item sub"><span>5.4 Backend Implementation</span><span class="toc-dots"></span><span>17</span></div>
  <div class="toc-item sub"><span>5.5 Blockchain Integration</span><span class="toc-dots"></span><span>18</span></div>
  <div class="toc-item sub"><span>5.6 Frontend API Service</span><span class="toc-dots"></span><span>19</span></div>
  <div class="toc-item chapter"><span>6. Testing</span><span class="toc-dots"></span><span>20</span></div>
  <div class="toc-item chapter"><span>7. Results and Discussions</span><span class="toc-dots"></span><span>21</span></div>
  <div class="toc-item sub"><span>7.1 Conclusion</span><span class="toc-dots"></span><span>21</span></div>
  <div class="toc-item sub"><span>7.2 Future Scope</span><span class="toc-dots"></span><span>22</span></div>
  <div class="toc-item chapter"><span>8. References</span><span class="toc-dots"></span><span>23</span></div>
</div>

<hr class="separator">

<!-- LIST OF TABLES -->
<div class="toc-title" style="margin-top:20px;">LIST OF TABLES</div>
<div class="toc">
  <div class="toc-item"><span>Table 3.1 &mdash; Minimum System Requirements</span><span class="toc-dots"></span><span>7</span></div>
  <div class="toc-item"><span>Table 4.1 &mdash; users Table Schema</span><span class="toc-dots"></span><span>13</span></div>
  <div class="toc-item"><span>Table 4.2 &mdash; ngos Table Schema</span><span class="toc-dots"></span><span>13</span></div>
  <div class="toc-item"><span>Table 4.3 &mdash; campaigns Table Schema</span><span class="toc-dots"></span><span>14</span></div>
  <div class="toc-item"><span>Table 4.4 &mdash; donations Table Schema</span><span class="toc-dots"></span><span>14</span></div>
  <div class="toc-item"><span>Table 6.1 &mdash; Test Cases for Donor, NGO, Admin Modules</span><span class="toc-dots"></span><span>20</span></div>
</div>

<hr class="separator">

<!-- LIST OF FIGURES -->
<div class="toc-title" style="margin-top:20px;">LIST OF FIGURES</div>
<div class="toc">
  <div class="toc-item"><span>Figure 2.1 &mdash; System Block Diagram</span><span class="toc-dots"></span><span>3</span></div>
  <div class="toc-item"><span>Figure 3.1 &mdash; UseCase Diagram</span><span class="toc-dots"></span><span>6</span></div>
  <div class="toc-item"><span>Figure 4.1 &mdash; 3-Tier System Architecture</span><span class="toc-dots"></span><span>8</span></div>
  <div class="toc-item"><span>Figure 4.2 &mdash; Level 0 Data Flow Diagram</span><span class="toc-dots"></span><span>9</span></div>
  <div class="toc-item"><span>Figure 4.3 &mdash; Level 1 Data Flow Diagram</span><span class="toc-dots"></span><span>9</span></div>
  <div class="toc-item"><span>Figure 4.4 &mdash; Class Diagram</span><span class="toc-dots"></span><span>10</span></div>
  <div class="toc-item"><span>Figure 4.5 &mdash; Sequence Diagram</span><span class="toc-dots"></span><span>11</span></div>
  <div class="toc-item"><span>Figure 4.6 &mdash; Entity-Relationship Diagram (ERD)</span><span class="toc-dots"></span><span>12</span></div>
</div>

<!-- CHAPTER 1 -->
<div class="chapter-heading">Chapter 1: Introduction</div>
<p>The charity sector has long been plagued by issues of trust, transparency, and accountability. Donors often contribute to causes without knowing if their funds actually reach the intended beneficiaries or how they are spent. Conversely, legitimate Non-Governmental Organizations (NGOs) struggle to prove their credibility and verification status to potential backers.</p>
<p><strong>TrustChain</strong> is a decentralized, transparent crowdfunding and charity platform designed to bridge this trust gap. By combining a modern web application stack with a secure database backend (Supabase) and public blockchain tracking (Ethereum Sepolia Testnet), TrustChain provides immutable proof of every single donation. In TrustChain, whenever a donor contributes, the donation is registered on a tamper-proof blockchain ledger, ensuring absolute transparency.</p>

<h3>1.1 Literature Survey</h3>
<p>Traditional charitable systems rely on centralized databases or manual accounting audits. Literature in philanthropy indicates several systemic problems:</p>
<ol>
  <li><strong>Lack of Transaction Tracking:</strong> Traditional platforms do not offer transactional tracking after the money leaves the donor's account.</li>
  <li><strong>Intermediate Administrative Losses:</strong> Heavy administrative overheads reduce the actual money deployed on the ground.</li>
  <li><strong>Syndicated Scams:</strong> Unverified NGOs posting fake campaigns.</li>
  <li><strong>Existing Blockchain Solutions:</strong> Early Web3 charity applications suffer from high usability barriers (requiring MetaMask, Web3 wallets, and cryptocurrency). TrustChain addresses this by letting users pay using standard payment gateways (simulated via Razorpay) while automatically logging transactions to the Ethereum blockchain behind the scenes.</li>
</ol>

<h3>1.2 Challenges and Motivation</h3>
<ul>
  <li><strong>The "Black Box" Problem:</strong> Donors send money, but have zero visibility into final resource utilization.</li>
  <li><strong>Complex On-Chain UX:</strong> Forcing non-technical donors to handle gas fees, private keys, and cryptocurrency slows adoption.</li>
  <li><strong>Security &amp; Verification:</strong> Lack of centralized SLA controls for verifying NGOs before they publish campaigns.</li>
  <li><strong>Database vs. Blockchain Sync:</strong> Ensuring rapid operations are handled by Supabase while transaction integrity is sealed on-chain.</li>
</ul>

<h3>1.3 Objectives of the Project</h3>
<ul>
  <li><strong>Ensure Immutable Transparency:</strong> Log every validated donation on the Ethereum Sepolia Testnet.</li>
  <li><strong>Dual-persistence Layer:</strong> Combine high-performance Supabase query capabilities with Ethereum smart contracts.</li>
  <li><strong>Role-Based Workspaces:</strong> Provide distinct, optimized portals for Donors, NGO Managers, and Administrators.</li>
  <li><strong>Verification Workflow:</strong> Implement a vetting pipeline where Admins review NGO documentation before certifying them.</li>
  <li><strong>Real-time Tracking:</strong> Enable donors to track their specific donation ID/transaction hash via a Blockchain Explorer.</li>
</ul>

<h3>1.4 Problem Definition</h3>
<p>To design and build a secure, responsive, and intuitive dual-database charity platform (TrustChain) that enables secure donor registration, NGO credential submission, campaign review/management by administrators, and transaction logging on the Sepolia Testnet, satisfying both modern performance standards and cryptographic auditability.</p>

<!-- CHAPTER 2 -->
<div class="chapter-heading">Chapter 2: Proposed System</div>

<h3>2.1 Proposed System Architecture &amp; Block Diagram</h3>
<p>TrustChain coordinates Presentation, Application, and Data layers seamlessly, combining a React frontend with a Node.js/Express backend that simultaneously writes to Supabase and the Ethereum blockchain.</p>

<div class="diagram">
  <img src="{imgs['block']}" alt="System Block Diagram" />
</div>
<div class="figure-label">Figure 2.1: System Block Diagram</div>

<ul>
  <li><strong>Donor Module:</strong> Browse campaigns, make payments, view donation history, verify on ledger.</li>
  <li><strong>NGO Module:</strong> Submit registration documents, launch fundraising campaigns, upload utilization reports.</li>
  <li><strong>Admin Module:</strong> Verify NGOs, approve campaigns, monitor platform statistics and blockchain logs.</li>
</ul>

<h3>2.2 Description of Target Users</h3>
<ul>
  <li><strong>Donors:</strong> Individuals or corporate sponsors seeking transparent channels to fund humanitarian causes.</li>
  <li><strong>NGOs / Fundraisers:</strong> Vetted organizations that need a secure crowdfunding portal.</li>
  <li><strong>System Administrators:</strong> Platform operators responsible for audit checks, verification, and contract health monitoring.</li>
</ul>

<h4>2.2.1 Advantages</h4>
<ul>
  <li><strong>Hybrid Web2/Web3 UX:</strong> No web3 wallet installation required for donors.</li>
  <li><strong>Tamper-Proof Proofs:</strong> Transaction receipts contain unique block numbers and hashes verifiable on Etherscan.</li>
  <li><strong>Accountability Control:</strong> Campaigns must be reviewed and approved by Admins before going public.</li>
  <li><strong>Real-time Verification:</strong> Any donor can verify their donation on the public blockchain at any time.</li>
</ul>

<h4>2.2.2 Applications</h4>
<ul>
  <li>Disaster relief mobilization.</li>
  <li>Public healthcare crowd-funding.</li>
  <li>Transparent educational scholarships.</li>
  <li>Corporate Social Responsibility (CSR) auditing.</li>
</ul>

<h4>2.2.3 Scope (Boundary of Proposed System)</h4>
<p><strong>In-Scope:</strong> User authentication via secure custom JWTs; NGO profiles, campaign creation, and validation pipeline; Razorpay-simulated checkout; automated Ethereum contract transactions via Ethers.js; dynamic ledger explorer.</p>
<p><strong>Out-of-Scope:</strong> Direct fiat-to-crypto exchanges, automated Solidity gas fee optimization, and direct multi-signature wallet integrations.</p>

<!-- CHAPTER 3 -->
<div class="chapter-heading">Chapter 3: Software Requirement Specification (SRS)</div>

<h3>3.1 Overview of SRS</h3>
<p>This Software Requirement Specification (SRS) defines the complete functionality, performance, and design constraints of the TrustChain Charity Platform. It acts as a formal agreement between developers and stakeholders to ensure the system meets all required transparency, tracking, and notification needs efficiently.</p>

<h3>3.2 Requirement Specifications</h3>

<h4>3.2.1 Functional Requirements</h4>
<ol>
  <li><strong>User Management:</strong> Registration, login, and profile modification with distinct roles (donor, ngo, admin).</li>
  <li><strong>NGO Verification Flow:</strong> NGOs must upload a registration number and description. Admins must approve status before campaigns launch.</li>
  <li><strong>Campaign Management:</strong> Vetted NGOs can post campaigns with target amounts, descriptions, and end dates.</li>
  <li><strong>Donation Processing:</strong> Processes simulated checkout, records donation status, triggers on-chain logging, and returns the Sepolia transaction hash.</li>
  <li><strong>Blockchain Explorer:</strong> Live querying of block numbers, timestamp confirmations, from/to wallet addresses, and transaction metadata.</li>
</ol>

<h4>3.2.2 UseCase Diagram</h4>
<div class="diagram">
  <img src="{imgs['usecase']}" alt="UseCase Diagram" />
</div>
<div class="figure-label">Figure 3.1: UseCase Diagram for TrustChain Roles</div>

<h4>3.2.3 Non-functional Requirements</h4>
<ul>
  <li><strong>Security:</strong> JWT-based session security, cryptographically hashed passwords (bcrypt), and schema-level row checks.</li>
  <li><strong>Performance:</strong> API responses under 200ms (cached or local DB), blockchain transaction verification within 15 seconds.</li>
  <li><strong>Responsiveness:</strong> Fully responsive CSS layout adjusting gracefully to mobile viewports.</li>
  <li><strong>Availability:</strong> 99% uptime on cloud hosting environment.</li>
</ul>

<h3>3.3 Software &amp; Hardware Requirement Specifications</h3>
<table>
  <tr>
    <th>Component</th>
    <th>Minimum Specification</th>
    <th>Recommended Specification</th>
  </tr>
  <tr><td>Processor</td><td>Intel i3 / Apple M1</td><td>Intel i7 / Apple M2 or higher</td></tr>
  <tr><td>RAM</td><td>8 GB</td><td>16 GB</td></tr>
  <tr><td>Storage</td><td>20 GB free SSD space</td><td>50 GB free SSD space</td></tr>
  <tr><td>Operating System</td><td>macOS / Linux / Windows 10</td><td>Latest macOS / Ubuntu 22.04 LTS</td></tr>
  <tr><td>Node.js Version</td><td>v16.x or higher</td><td>v20.x (LTS)</td></tr>
  <tr><td>Database</td><td>Supabase Cloud Instance</td><td>Dedicated Supabase Pro / PostgreSQL</td></tr>
  <tr><td>Blockchain Node</td><td>Public Sepolia RPC URL (Allnodes)</td><td>Infura / Alchemy Dedicated RPC Endpoint</td></tr>
</table>
<div class="table-label">Table 3.1: Minimum System Requirements</div>

<h3>3.4 Graphical User Interface (GUI) Walkthrough</h3>
<ul>
  <li><strong>Landing Page:</strong> Displays featured campaigns, platform impact metrics, and recent blockchain blocks.</li>
  <li><strong>Auth Modal:</strong> Dual-mode login and registration interface with toggling between Donor and NGO parameters.</li>
  <li><strong>Donor Dashboard:</strong> Lists donation history with direct links to the Sepolia Etherscan explorer.</li>
  <li><strong>NGO Workspace:</strong> Displays verification status alerts, campaign creation forms, and receipt histories.</li>
  <li><strong>Admin Master Console:</strong> Shows pending NGO approvals, campaign approvals, and live blockchain status logs.</li>
</ul>

<!-- CHAPTER 4 -->
<div class="chapter-heading">Chapter 4: System Design</div>

<h3>4.1 Architecture of the System</h3>
<p>TrustChain follows a modular MVC-style architecture. The frontend React client communicates with the Node.js Express server using JSON over HTTP. The server coordinates between Supabase (PostgreSQL) and the Ethereum smart contract.</p>

<div class="diagram">
  <img src="{imgs['arch']}" alt="3-Tier System Architecture" />
</div>
<div class="figure-label">Figure 4.1: 3-Tier System Architecture</div>

<h4>4.1.1 Level 0 Data Flow Diagram</h4>
<p>Level 0 DFD shows the main process "TrustChain Engine" with all external inputs and outputs:</p>

<div class="diagram">
  <img src="{imgs['dfd0']}" alt="Level 0 DFD" />
</div>
<div class="figure-label">Figure 4.2: Level 0 Data Flow Diagram</div>

<h4>4.1.2 Level 1 Detailed DFD</h4>
<p>The detailed DFD breaks down the main process into sub-processes: Auth Router, Campaign Manager, Donation Router, and Ledger Router.</p>

<div class="diagram">
  <img src="{imgs['dfd1']}" alt="Level 1 DFD" />
</div>
<div class="figure-label">Figure 4.3: Level 1 Data Flow Diagram</div>

<h3>4.2 Class Diagram</h3>
<div class="diagram">
  <img src="{imgs['cls']}" alt="Class Diagram" />
</div>
<div class="figure-label">Figure 4.4: Class Diagram</div>

<h3>4.3 Sequence Diagram</h3>
<div class="diagram">
  <img src="{imgs['seq']}" alt="Sequence Diagram" />
</div>
<div class="figure-label">Figure 4.5: Sequence Diagram — Donation Flow</div>

<h3>4.4 ER Diagram</h3>
<p>This ER diagram represents the TrustChain database, detailing entities: Users, NGOs, Campaigns, and Donations. It shows their attributes and relationships such as registering, creating, and making donations.</p>

<div class="diagram">
  <img src="{imgs['er']}" alt="ER Diagram" />
</div>
<div class="figure-label">Figure 4.6: Entity-Relationship Diagram (ERD)</div>

<h3>4.5 Database Table Schemas</h3>

<h4>Table 4.1: users Table Schema</h4>
<table>
  <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
  <tr><td>id</td><td>uuid</td><td>PRIMARY KEY, default UUIDv4</td><td>Unique identifier for each user</td></tr>
  <tr><td>email</td><td>text</td><td>UNIQUE, NOT NULL</td><td>Registration and Login email address</td></tr>
  <tr><td>name</td><td>text</td><td>NOT NULL</td><td>User's display name</td></tr>
  <tr><td>role</td><td>text</td><td>check(role in ('donor','ngo','admin'))</td><td>Access control role</td></tr>
  <tr><td>password_hash</td><td>text</td><td>NOT NULL</td><td>Bcrypt-hashed credentials</td></tr>
  <tr><td>created_at</td><td>timestamp</td><td>DEFAULT now()</td><td>Registration timestamp</td></tr>
</table>
<div class="table-label">Table 4.1: users Table Schema</div>

<h4>Table 4.2: ngos Table Schema</h4>
<table>
  <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
  <tr><td>id</td><td>uuid</td><td>PRIMARY KEY, default UUIDv4</td><td>Unique NGO profile identifier</td></tr>
  <tr><td>user_id</td><td>uuid</td><td>FOREIGN KEY (users.id), ON DELETE CASCADE</td><td>Linked user account</td></tr>
  <tr><td>ngo_name</td><td>text</td><td>NOT NULL</td><td>Name of charity organization</td></tr>
  <tr><td>registration_number</td><td>text</td><td>NOT NULL</td><td>Government registration ID</td></tr>
  <tr><td>verified</td><td>text</td><td>check('pending','approved','rejected')</td><td>Validation status</td></tr>
  <tr><td>logo</td><td>text</td><td>nullable</td><td>Profile image URL</td></tr>
</table>
<div class="table-label">Table 4.2: ngos Table Schema</div>

<h4>Table 4.3: campaigns Table Schema</h4>
<table>
  <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
  <tr><td>id</td><td>uuid</td><td>PRIMARY KEY, default UUIDv4</td><td>Unique campaign identifier</td></tr>
  <tr><td>ngo_id</td><td>uuid</td><td>FOREIGN KEY (ngos.id), ON DELETE CASCADE</td><td>Creator NGO profile link</td></tr>
  <tr><td>title</td><td>text</td><td>NOT NULL</td><td>Public campaign title</td></tr>
  <tr><td>goal_amount</td><td>numeric</td><td>NOT NULL, DEFAULT 0</td><td>Funding milestone target in INR</td></tr>
  <tr><td>raised_amount</td><td>numeric</td><td>NOT NULL, DEFAULT 0</td><td>Total collected funds in INR</td></tr>
  <tr><td>status</td><td>text</td><td>DEFAULT 'pending'</td><td>Campaign state (pending/active/closed)</td></tr>
</table>
<div class="table-label">Table 4.3: campaigns Table Schema</div>

<h4>Table 4.4: donations Table Schema</h4>
<table>
  <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
  <tr><td>id</td><td>uuid</td><td>PRIMARY KEY, default UUIDv4</td><td>Unique donation index ID</td></tr>
  <tr><td>campaign_id</td><td>uuid</td><td>FOREIGN KEY (campaigns.id)</td><td>Targeted campaign</td></tr>
  <tr><td>donor_id</td><td>uuid</td><td>FOREIGN KEY (users.id)</td><td>Linked donor account</td></tr>
  <tr><td>ngo_id</td><td>uuid</td><td>FOREIGN KEY (ngos.id)</td><td>Receiving organization</td></tr>
  <tr><td>amount</td><td>numeric</td><td>NOT NULL</td><td>Donated amount in INR</td></tr>
  <tr><td>status</td><td>text</td><td>NOT NULL</td><td>Payment status (initiated/completed)</td></tr>
  <tr><td>blockchain_hash</td><td>text</td><td>UNIQUE</td><td>Transaction hash on Sepolia network</td></tr>
</table>
<div class="table-label">Table 4.4: donations Table Schema</div>

<!-- CHAPTER 5 -->
<div class="chapter-heading">Chapter 5: Implementation</div>

<h3>5.1 Proposed Methodology (Waterfall Model)</h3>
<p>The development of TrustChain followed the Waterfall Model, a linear and structured approach consisting of distinct, sequential phases. Each phase was completed before moving on to the next to ensure systematic delivery.</p>

<h3>5.2 Requirement Analysis</h3>
<ul>
  <li>Identified key user roles: Donor, Admin, and NGO</li>
  <li>Collected functional requirements: NGO verification pipeline, campaign management, donation processing, blockchain tracking</li>
  <li>Analyzed non-functional requirements: performance, scalability, and security constraints</li>
  <li>Ensured compatibility between JSON-RPC constraints (Sepolia gas costs, transaction speeds) and front-end usability</li>
</ul>

<h3>5.3 Smart Contract Code (TrustChainLedger.sol)</h3>
<div class="code-block">// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract TrustChainLedger {{
    struct Donation {{
        string donationId;
        string campaignId;
        uint256 amount;
        uint256 timestamp;
    }}

    mapping(string => Donation) private donations;
    event DonationRecorded(
        string indexed donationId,
        string indexed campaignId,
        uint256 amount,
        uint256 timestamp
    );

    function recordDonation(
        string memory _donationId,
        string memory _campaignId,
        uint256 _amount
    ) public {{
        donations[_donationId] = Donation(
            _donationId, _campaignId, _amount, block.timestamp
        );
        emit DonationRecorded(_donationId, _campaignId, _amount, block.timestamp);
    }}
}}</div>

<h3>5.4 Backend Implementation (server.ts)</h3>
<div class="code-block">app.post("/api/auth/register", async (req, res) => {{
  const {{ name, email, password, role, ngoParams }} = req.body;
  const emailLower = email.toLowerCase().trim();
  const hashedPassword = await bcrypt.hash(password, 10);

  if (isSupabaseConfigured) {{
    const {{ data: existingUser }} = await supabase
      .from('users').select('id').eq('email', emailLower).single();
    if (existingUser) return res.status(400).json({{ error: "Email already registered" }});

    const {{ data: newUser, error }} = await supabase
      .from('users')
      .insert({{ email: emailLower, name, role, password_hash: hashedPassword }})
      .select().single();

    if (role === "ngo" && ngoParams) {{
      const {{ error: ngoError }} = await supabase.from('ngos').insert({{
        user_id: newUser.id, ngo_name: ngoParams.ngoName, verified: "pending"
      }});
    }}
    const token = jwt.sign({{ id: newUser.id, role: newUser.role }}, JWT_SECRET, {{ expiresIn: "7d" }});
    return res.status(201).json({{ user: userResponse, token }});
  }}
}});</div>

<h3>5.5 Blockchain Integration (blockchain.ts)</h3>
<div class="code-block">import {{ ethers }} from "ethers";

export let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

if (isBlockchainConfigured) {{
  provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
  wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY!, provider);
  contract = new ethers.Contract(
    process.env.BLOCKCHAIN_CONTRACT_ADDRESS!,
    ["function recordDonation(string,string,uint256) public"],
    wallet
  );
}}

export const recordDonationOnChain = async (
  donationId: string, campaignId: string, amount: number
): Promise&lt;string&gt; => {{
  const tx = await contract!.recordDonation(donationId, campaignId, Math.floor(amount));
  const receipt = await tx.wait();
  return receipt.hash;
}};

export const getTransactionDetails = async (txHash: string) => {{
  const receipt = await provider!.getTransactionReceipt(txHash);
  const block = await provider!.getBlock(receipt!.blockNumber);
  return {{
    blockNumber: receipt!.blockNumber,
    timestamp: new Date(block!.timestamp * 1000).toISOString(),
    blockHash: receipt!.blockHash,
    from: receipt!.from,
    to: receipt!.to
  }};
}};</div>

<h3>5.6 Frontend API Service (api.ts)</h3>
<div class="code-block">export const api = {{
  async register(params: any) {{
    const res = await fetch("/api/auth/register", {{
      method: "POST",
      headers: {{ "Content-Type": "application/json" }},
      body: JSON.stringify(params),
    }});
    const data = await handleResponse(res);
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  }},

  async getBlockchain(search?: string) {{
    const res = await fetch(`/api/blockchain?search=${{search || ""}}`);
    return handleResponse(res);
  }},

  async makeDonation(params: any) {{
    const res = await fetch("/api/donations/create", {{
      method: "POST",
      headers: {{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${{localStorage.getItem("token")}}`
      }},
      body: JSON.stringify(params),
    }});
    return handleResponse(res);
  }}
}};</div>

<!-- CHAPTER 6 -->
<div class="chapter-heading">Chapter 6: Testing</div>

<p>We performed systematic validation checks across all application tiers — Authentication, NGO management, Campaign lifecycle, Donation processing, and Blockchain ledger verification.</p>

<table>
  <tr>
    <th>Test ID</th>
    <th>Module</th>
    <th>Test Scenario</th>
    <th>Input</th>
    <th>Expected Output</th>
    <th>Result</th>
  </tr>
  <tr><td>TC01</td><td>Auth</td><td>User Registration (Donor)</td><td>valid email, password, name</td><td>JWT token returned, user saved in Supabase</td><td>Pass</td></tr>
  <tr><td>TC02</td><td>Auth</td><td>User Registration (NGO)</td><td>name, email, ngoParams</td><td>NGO record created in pending state</td><td>Pass</td></tr>
  <tr><td>TC03</td><td>Auth</td><td>User Login</td><td>registered email &amp; password</td><td>JWT token returned, user data mapped correctly</td><td>Pass</td></tr>
  <tr><td>TC04</td><td>Admin</td><td>NGO Certification Vetting</td><td>Approve NGO trigger</td><td>NGO verified status updated to 'approved'</td><td>Pass</td></tr>
  <tr><td>TC05</td><td>Campaign</td><td>Launch Campaign</td><td>title, goal amount, description</td><td>Campaign created, awaits admin verification</td><td>Pass</td></tr>
  <tr><td>TC06</td><td>Campaign</td><td>Admin Approves Campaign</td><td>Campaign ID + approval action</td><td>Campaign status changes to 'active'</td><td>Pass</td></tr>
  <tr><td>TC07</td><td>Donation</td><td>Make Donation</td><td>donationId, campaignId, amount</td><td>Sepolia transaction hash returned and stored</td><td>Pass</td></tr>
  <tr><td>TC08</td><td>Ledger</td><td>Live Block Details Query</td><td>valid transaction hash</td><td>Block number, timestamp from Sepolia returned</td><td>Pass</td></tr>
  <tr><td>TC09</td><td>Auth</td><td>Invalid Login Attempt</td><td>wrong email/password</td><td>Error message shown, no token issued</td><td>Pass</td></tr>
  <tr><td>TC10</td><td>Auth</td><td>Duplicate Email Registration</td><td>existing email</td><td>Error: "Email already registered"</td><td>Pass</td></tr>
</table>
<div class="table-label">Table 6.1: Test Cases for Donor, NGO, and Admin Modules</div>

<!-- CHAPTER 7 -->
<div class="chapter-heading">Chapter 7: Results and Discussions</div>

<p>The TrustChain application was successfully developed and thoroughly tested. The application meets all core objectives and functional requirements defined in scope.</p>
<ul>
  <li><strong>User Registration/Login:</strong> Donors, admins, and NGOs securely register and login using role-based authentication with proper data mapping between the database and frontend.</li>
  <li><strong>Donor Dashboard:</strong> Donors can browse campaigns, make donations, and immediately verify their transaction hash on the Ethereum Sepolia network via the built-in ledger explorer.</li>
  <li><strong>NGO Campaign Management:</strong> Verified NGOs can create campaigns, track raised amounts, and post utilization reports to maintain transparency.</li>
  <li><strong>Admin Dashboard:</strong> Admins have full control to approve/reject NGO registrations and campaign proposals, with access to live blockchain status metrics.</li>
  <li><strong>Live Blockchain Integration:</strong> The platform uses Ethers.js to query real transaction receipts from the Ethereum Sepolia testnet, providing genuine block numbers, timestamps, and wallet addresses.</li>
</ul>

<h3>7.1 Conclusion</h3>
<p>TrustChain was successfully built, tested, and integrated with the Ethereum Sepolia network and the Supabase relational database. Key achievements include:</p>
<ul>
  <li>Role-based login system with dedicated dashboards for Donors, NGOs, and Admins.</li>
  <li>Seamless dual-persistence: Supabase for fast queries, Ethereum for immutable audit trails.</li>
  <li>Every donation is cryptographically sealed on a public blockchain, verifiable by anyone at any time via Sepolia Etherscan.</li>
  <li>The NGO verification pipeline ensures only authenticated organizations can raise funds.</li>
  <li>Secure, responsive web-based interface developed using the modern TypeScript/React/Node stack.</li>
</ul>

<h3>7.2 Future Scope</h3>
<ul>
  <li><strong>Layer 2 Gas Optimization:</strong> Integrating Arbitrum or Polygon to reduce transaction fee overhead significantly.</li>
  <li><strong>Decentralized Document Storage:</strong> Using IPFS to store NGO certificates, making them tamper-proof and verifiable.</li>
  <li><strong>Mobile Application:</strong> Developing an Android/iOS app for broader donor accessibility.</li>
  <li><strong>Automated Yield Strategies:</strong> Smart contracts to put idle campaign funds to work in secure DeFi vaults.</li>
  <li><strong>Multi-language Support:</strong> Enable regional languages for improved accessibility in tier-2 and tier-3 cities.</li>
  <li><strong>AI-based Fraud Detection:</strong> Machine learning models to detect suspicious donation patterns and fraudulent NGO registrations.</li>
</ul>

<!-- CHAPTER 8 -->
<div class="chapter-heading">Chapter 8: References</div>

<ol>
  <li>Buterin, V. (2014). <em>Ethereum: A next-generation smart contract and decentralized application platform</em>. Ethereum Foundation.</li>
  <li>Sommerville, I. (2015). <em>Software Engineering (10th Edition)</em>. Pearson.</li>
  <li>Pressman, R.S., &amp; Maxim, B.R. (2020). <em>Software Engineering: A Practitioner's Approach (9th ed.)</em>. McGraw-Hill Education.</li>
  <li>Nakamoto, S. (2008). <em>Bitcoin: A Peer-to-Peer Electronic Cash System</em>.</li>
  <li>Ethers.js Documentation (v6). Retrieved from https://docs.ethers.org</li>
  <li>Supabase Documentation. Retrieved from https://supabase.com/docs</li>
  <li>Solidity Language Reference. Retrieved from https://soliditylang.org</li>
  <li>Postman. (2023). API Testing Tool Documentation. Retrieved from https://www.postman.com/</li>
  <li>GitHub. (2023). Version Control and Collaboration. Retrieved from https://docs.github.com/</li>
</ol>

</div>
</body>
</html>"""

with open("project_documentation.html", "w") as f:
    f.write(html)

print("HTML written successfully")
