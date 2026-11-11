import fetch from "node-fetch";

async function run() {
  try {
    // 1. Login as Donor (we can try to login with any generic credentials, let's see if we can find them or just use a known test account)
    // Wait, the db has mock users. I can check db.users or just login with donor@trustchain.org / donor123
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "donor@trustchain.org", password: "password" })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginData);

    const token = loginData.token;

    // 2. Initiate Donation
    const donateRes = await fetch("http://localhost:3000/api/donations/create", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        campaignId: "e72b71f4-12dc-40fa-9be2-52c1ca683f33",
        amount: 10,
        paymentMethod: "UPI"
      })
    });
    
    console.log("Status:", donateRes.status);
    console.log("Response:", await donateRes.text());
  } catch(e) {
    console.error(e);
  }
}
run();
