document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('/api/users/login', { // Use the relative route
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON header for POST data
      },
      body: JSON.stringify({ email, password }), // Send the form data as JSON
    });

    const result = await response.json(); // Process the response
    if (response.ok) {
      localStorage.setItem("token", result.token); // Save the JWT token in local storage
      alert(result.message || "Login successful!");
      window.location.href = "account.html"; // Redirect to the account page
    } else {
      alert(result.message || "Login failed. Please try again.");
    }
  } catch (error) {
    console.error(error); // Log the error in the console
    alert("An error occurred. Please try again later.");
  }
});
