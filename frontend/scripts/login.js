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

    console.log("Login attempt with:", { email, password }); // Log the data being sent

    try {
      const response = await fetch("/api/Users/login", {
        // Use the relative route
        method: "POST",
        headers: {
          "Content-Type": "application/json", // JSON header for POST data
        },
        body: JSON.stringify({ email, password }), // Send the form data as JSON
      });

      const result = await response.json(); // Process the response
      console.log("Login response:", result);

      if (response.ok) {
        localStorage.setItem("token", result.token); // Save the JWT token in local storage
        alert(result.message || "Login successful!");
        window.location.href = "account.html"; // Redirect to the account page
      } else {
        console.error("Login failed:", result.message);
        alert(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again later.");
    }
  });

/* Password visibility toggle */
document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    /**
     * Determines the type of the password field.
     * If the current type is "password", it changes to "text" to show the password.
     * Otherwise, it changes to "password" to hide the password.
     *
     * @type {string} The new type of the password field, either "text" or "password".
     */
    const passwordFieldType =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", passwordFieldType);

    this.textContent = passwordFieldType === "password" ? "🔒" : "🔓";
  });
