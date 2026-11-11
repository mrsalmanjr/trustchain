import urllib.request
import base64
import json

# Simple usecase diagram that mermaid.ink supports
code = """graph LR
    Donor((Donor)) -->|Browse Campaigns| B1[Browse Campaigns]
    Donor -->|Make Donation| B2[Make Donation]
    Donor -->|View Ledger| B3[Verify Receipt on Ledger]
    NGO((NGO)) -->|Submit Documents| C1[Register and Submit Docs]
    NGO -->|Launch Campaign| C2[Create Fundraising Campaign]
    NGO -->|Add Report| C3[Upload Utilization Report]
    Admin((Admin)) -->|Verify NGO| D1[Verify NGO Registration]
    Admin -->|Approve Campaign| D2[Approve Campaign Proposal]
    Admin -->|Monitor| D3[Monitor System Statistics]"""

payload = json.dumps({"code": code, "mermaid": {"theme": "default"}})
encoded = base64.urlsafe_b64encode(payload.encode()).decode()
url = f"https://mermaid.ink/img/{encoded}"
print("Fetching:", url[:100])
try:
    urllib.request.urlretrieve(url, "assets/diagrams/usecase.png")
    print("Downloaded usecase.png")
except Exception as e:
    print("Error:", e)
