/**
 * Handles the registration form submission by sending user data to the server.
 *
 * @event submit
 * @async
 * @param {Event} event - The form submission event, prevented from its default behavior.
 */
document
  .getElementById("registerForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload on form submission.

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }), // Send registration data as JSON.
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Registration successful!");
        window.location.href = "login.html"; // Redirect to the login page after successful registration.
      } else {
        alert(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error(error); // Log any errors during the registration process.
      alert("An error occurred. Please try again later.");
    }
  });
