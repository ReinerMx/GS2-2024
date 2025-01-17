/**
 * Handles the account page logic, including fetching user data, displaying saved collections,
 * enabling logout functionality, and removing saved collections.
 *
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const accountContainer = document.querySelector(".container.my-5");

  /**
   * Displays a message in the account container.
   *
   * @param {string} message - The message to display.
   * @param {boolean} [isError=true] - Whether the message is an error or a success message.
   */
  const displayMessage = (message, isError = true) => {
    accountContainer.innerHTML = `
      <div class="alert ${isError ? "alert-danger" : "alert-success"}" role="alert">
        ${message}
      </div>
    `;
  };

  // Redirect to login page if no token is found
  if (!token) {
    accountContainer.innerHTML = `
      <div class="text-center">
        <h1>You are not logged in</h1>
        <p>Please log in or register to manage your account.</p>
        <a href="login.html" class="btn btn-primary">Login</a>
        <a href="register.html" class="btn btn-secondary">Register</a>
      </div>
    `;
    return;
  }

  try {
    // Fetch user details using the provided token
    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details. Please log in again.");
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
          ${userData.saved_collections
            .map(
              (collection) =>
                `<li>${collection} <button class="btn btn-sm btn-outline-danger delete-collection" data-id="${collection}">Remove</button></li>`
            )
            .join("") || "<li>No saved collections yet.</li>"}
        </ul>
      </section>
    `;

    // Handle logout button click
    document.getElementById("logoutButton").addEventListener("click", () => {
      localStorage.removeItem("token");
      alert("You have been logged out.");
      window.location.href = "/login.html";
    });

    // Add click event listeners to the "Remove" buttons for saved collections
    document.querySelectorAll('.delete-collection').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const collectionId = event.target.dataset.id;
    
        if (!collectionId) {
          alert('Collection ID is missing.');
          return;
        }
    
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`/api/users/collections/${collectionId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
    
          const result = await response.json();
    
          if (response.ok) {
            alert('Collection removed successfully.');
            window.location.reload(); // Reload the page to reflect changes
          } else {
            alert(result.message || 'Failed to remove collection.');
          }
        } catch (error) {
          console.error('Error removing collection:', error);
          alert('An error occurred. Please try again later.');
        }
      });
    });

  } catch (error) {
    // Display error message if user details could not be fetched
    displayMessage(error.message);
  }
});
