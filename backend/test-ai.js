async function testAIGeneration() {
  // 1. Login to get token
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Test@12345"
    })
  });
  const { token } = await loginRes.json();

  console.log("Logged in. Requesting Gemini AI to generate notes...");

  // 2. Call AI Generation endpoint
  const aiRes = await fetch("http://localhost:5000/api/notes/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      topic: "Quantum Computing Basics",
      format: "bullet-points"
    })
  });

  const aiData = await aiRes.json();
  console.log("AI Generation Status:", aiRes.status);
  console.log("Generated Note:\n", aiData.note?.content);
}

testAIGeneration();