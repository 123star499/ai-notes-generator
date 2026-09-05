async function testProtected() {
  // Step 1: Login karke token lein
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Test@12345"
    })
  });

  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log("Logged in. Token received.");

  // Step 2: Us token ke sath protected profile route call karein
  const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  console.log("Profile Status:", profileRes.status);
  const profileData = await profileRes.json();
  console.log("Profile Response:", profileData);
}

testProtected();
