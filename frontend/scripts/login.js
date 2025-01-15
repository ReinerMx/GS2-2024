/**
 * Handles the login form submission by sending user credentials to the server.
 *
 * @event submit
 * @async
 * @param {Event} event - The form submission event, prevented from its default behavior.
 */
document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload on form submission.

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Send login credentials as JSON.
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token); // Store the authentication token.
        alert(result.message || "Login successful!");
        window.location.href = "account.html"; // Redirect to the account page.
      } else {
        alert(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error(error); // Log any errors during the process.
      alert("An error occurred. Please try again later.");
    }
  });
