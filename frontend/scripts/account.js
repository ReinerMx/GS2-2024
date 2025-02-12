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

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); 
      const expiry = new Date(payload.exp * 1000);
      console.log("Token Expiry:", expiry);
  
      if (expiry < new Date()) {
        console.warn("Token expired. Logging out...");
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  try {
    // Fetch user details using the token
    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If the response is not okay, assume the token is invalid or expired
      throw new Error("Invalid or expired token.");
    }

    const userData = await response.json();
    const userId = userData.id; // Extract userId from userData

    // Render user account details
    accountContainer.innerHTML = `
    <div style="
      font-family: Arial, sans-serif; 
      padding: 20px; 
      background-color: #f8f9fa; 
      border-radius: 8px; 
      text-align: center; 
      margin: 0 auto; 
      max-width: 800px;">
      <h1 style="font-size: 2rem; color: #000;">Welcome, ${userData.username}</h1>
      <p style="color: #555;">Manage your account settings, view your uploaded models, and track your activity.</p>
      
      <section style="margin-top: 20px;">
        <h2 style="font-size: 1.5rem; color: #007bff;">Account Details</h2>
        <p>Username: <strong>${userData.username}</strong></p>
        <p>Email: <strong>${userData.email}</strong></p>
        <p>Saved Collections: <strong>${userData.saved_collections.length || 0}</strong></p>
      </section>

      <section style="margin-top: 30px;">
        <h2 style="font-size: 1.5rem; color: #007bff;">Saved Collections</h2>
        <ul id="collectionsList" style="list-style: none; padding: 0;">
    
          ${
            userData.saved_collections
              .map(
                (collection) => `
                  <li style="margin: 10px 0; padding: 15px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    <strong style="color: #212529;">${collection}</strong>
                    <div style="margin-top: 10px;">
                      <button class="btn btn-sm btn-outline-danger delete-collection" data-id="${collection}" style="margin-right: 10px;">Remove</button>
                      <button class="btn btn-sm btn-outline-info view-items" data-id="${collection}">View Items</button>
                    </div>
                    <ul class="item-list" id="items-${collection}" style="display: none; margin-top: 10px; padding-left: 20px;">
                    </ul>
                  </li>`
              )
              .join("") || "<li style='color: #6c757d;'>No saved collections yet. <a href='upload.html' class='btn btn-secondary'>Upload</a></li>"
          }
        </ul>
      </section>
    </div>
    `;

     // Add the logout button at the end of the page
     const footer = document.createElement("footer");
     footer.style.textAlign = "center";
     footer.innerHTML = `
       <button id="logoutButton" class="btn btn-danger" style="margin-top: 20px;">Logout</button>
     `;
     accountContainer.appendChild(footer);

    // View items in a collection
    document.querySelectorAll(".view-items").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const collectionId = event.target.dataset.id;
        const itemList = document.getElementById(`items-${collectionId}`);
        itemList.style.display = itemList.style.display === "none" ? "block" : "none";

        console.log(`Fetching items for collection ID: ${collectionId}`);
        try {
          const response = await fetch(`/api/users/${userId}/savedCollections/${collectionId}/items`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch items.");
          }

          const data = await response.json();

          if (!data.items || data.items.length === 0) {
            itemList.innerHTML = "<li>No items found in this collection.</li>";
            return;
          }

          // Populate the item list
          itemList.innerHTML = data.items
            .map(
              (item) => `
                <li>
                  <a href="modelDetails.html?collection_id=${collectionId}&item_id=${item.item_id}">
                    ${item.properties['mlm:name'] || 'Unnamed Item'}
                  </a>
                  <button class="btn btn-sm btn-outline-danger delete-item" data-collection-id="${collectionId}" data-item-id="${item.item_id}">Delete</button>
                </li>`
            )
            .join("");

          // Attach delete item listeners
          itemList.querySelectorAll(".delete-item").forEach((deleteBtn) => {
            deleteBtn.addEventListener("click", async (e) => {
              const itemId = deleteBtn.dataset.itemId;

              try {
                const deleteResponse = await fetch(
                  `/api/users/${userId}/savedCollections/${collectionId}/items/${itemId}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (!deleteResponse.ok) {
                  throw new Error("Failed to delete item.");
                }

                alert("Item deleted successfully.");
                deleteBtn.parentElement.remove();
              } catch (err) {
                console.error(err);
                alert("Failed to delete item.");
              }
            });
          });
        } catch (error) {
          console.error("Error fetching items:", error);
          itemList.innerHTML = "<li>No items are uploaded in this collection and can thus not be viewed.  <a href='upload.html' class='btn btn-secondary'>Upload</a></li>";
        }
      });
    });

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
          const response = await fetch(`/api/users/${userId}/collections/${collectionId}`, {
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
