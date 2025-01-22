/**
 * Handles the account page logic, including fetching user data, displaying saved collections,
 * enabling logout functionality, and handling token validation.
 *
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const accountContainer = document.querySelector(".container.my-5");

  /**
   * Displays the login and registration options in the account container.
   */
  const showLoginAndRegister = () => {
    accountContainer.innerHTML = `
      <div class="text-center">
        <h1>You are not logged in</h1>
        <p>Please log in or register to manage your account.</p>
        <a href="login.html" class="btn btn-primary">Login</a>
        <a href="register.html" class="btn btn-secondary">Register</a>
      </div>
    `;
  };

  // Redirect to login and register options if no token is present
  if (!token) {
    showLoginAndRegister();
    return;
  }

  try {
    // Fetch user details using the token
    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If the response is not okay, assume the token is invalid or expired
      throw new Error("Invalid or expired token.");
    }

    const userData = await response.json();

    // Render user account details
    accountContainer.innerHTML = `
      <h1>Welcome, ${userData.username}</h1>
      <p>Manage your account settings, view your uploaded models, and track your activity.</p>

      <section>
        <h2>Account Details</h2>
        <p>Email: ${userData.email}</p>
        <p>Saved Collections: ${userData.saved_collections.length || 0}</p>
        <button id="logoutButton" class="btn btn-danger">Logout</button>
      </section>

      <section>
        <h2>Saved Collections</h2>
        <ul id="collectionsList">
          ${
            userData.saved_collections
              .map(
                (collection) =>
                  `<li>${collection} <button class="btn btn-sm btn-outline-danger delete-collection" data-id="${collection}">Remove</button></li>`
              )
              .join("") || "<li>No saved collections yet.</li>"
          }
        </ul>
      </section>
    `;

    /**
     * Handles the logout process by clearing the token and redirecting to the login page.
     */
    document.getElementById("logoutButton").addEventListener("click", () => {
      localStorage.removeItem("token");
      alert("You have been logged out.");
      window.location.href = "/login.html";
    });

    /**
     * Adds event listeners to all "Remove Collection" buttons.
     */
    document.querySelectorAll(".delete-collection").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const collectionId = event.target.dataset.id;

        if (!collectionId) {
          alert("Collection ID is missing.");
          return;
        }

        try {
          const response = await fetch(`/api/users/collections/${collectionId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to remove collection.");
          }

          alert("Collection removed successfully.");
          window.location.reload();
        } catch (error) {
          console.error("Error removing collection:", error);
          alert("An error occurred. Please try again later.");
        }
      });
    });
  } catch (error) {
    // Handle any error by showing the login and register options
    console.error("Error during authentication or fetching user data:", error);
    showLoginAndRegister();
  }
});
