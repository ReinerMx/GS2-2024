document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('/api/users/register', { // Use the relative route
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON header for POST data
      },
      body: JSON.stringify({ username, email, password }), // Send the form data as JSON
    });

    const result = await response.json(); // Process the response
    if (response.ok) {
      alert(result.message || "Registration successful!");
      window.location.href = "login.html"; // Redirect to the login page
    } else {
      alert(result.message || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.error(error); // Log the error in the console
    alert("An error occurred. Please try again later.");
  }
});
