async function testNotes() {
  // 1. Login to get JWT
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Test@12345"
    })
  });

  const { token } = await loginRes.json();
  console.log("Logged in successfully.");

  // 2. Create Note
  const createRes = await fetch("http://localhost:5000/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "My First AI Note",
      content: "This note is linked securely to my user account."
    })
  });

  const createData = await createRes.json();
  console.log("Create Note Status:", createRes.status, createData);

  // 3. Fetch All Notes
  const fetchRes = await fetch("http://localhost:5000/api/notes", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const fetchData = await fetchRes.json();
  console.log("Fetch Notes Status:", fetchRes.status, fetchData);
}

testNotes();