document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  if (!userId || userId === "undefined" || userId.trim() === "") {
      console.error("Invalid userId detected.");
      return;
  }

  const accountContainer = document.querySelector(".container.my-5");

  if (!accountContainer) {
      console.error("Account container is missing in viewAccount.html.");
      return;
  }

  try {
      const response = await fetch(`/api/users/${userId}/public`);

      if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();

      const emailLink = userData.email 
        ? `<a href="mailto:${userData.email}" style="text-decoration: none; color: #007bff;">${userData.email}</a>` 
        : "Not available";

      accountContainer.innerHTML = `
      <div style="
        font-family: Arial, sans-serif; 
        padding: 20px; 
        background-color: #f8f9fa; 
        border-radius: 8px; 
        text-align: center; 
        margin: 0 auto; 
        max-width: 800px;">
        <h1 style="font-size: 2rem; color: #000;">${userData.username}</h1>
        <p style="color: #555;">Viewing public profile</p>

        <section style="margin-top: 20px;">
          <h2 style="font-size: 1.5rem; color: #007bff;">Account Details</h2>
          <p>Username: <strong>${userData.username}</strong></p>
          <p>Email: <strong>${emailLink}</strong></p>
        </section>

        <section style="margin-top: 30px;">
          <h2 style="font-size: 1.5rem; color: #007bff;">Collections</h2>
          <ul id="collectionsList" style="list-style: none; padding: 0;">
      
            ${
              userData.collections.length > 0
                ? userData.collections
                    .map(
                      (collection) => `
                        <li style="margin: 10px 0; padding: 15px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                          <strong style="color: #212529;">${collection.name}</strong>
                          <ul style="margin-top: 10px; padding-left: 20px;">
                            ${
                              collection.items.length > 0
                                ? collection.items
                                    .map(
                                      (item) => `
                                        <li>
                                          <a href="modelDetails.html?collection_id=${collection.collection_id}&item_id=${item.item_id}">
                                            ${item.name}
                                          </a>
                                        </li>`
                                    )
                                    .join("")
                                : "<li style='color: #6c757d;'>No items available</li>"
                            }
                          </ul>
                        </li>`
                    )
                    .join("")
                : "<li style='color: #6c757d;'>No collections available.</li>"
            }
          </ul>
        </section>
      </div>
      `;

  } catch (error) {
      console.error("Error loading user data:", error);
      accountContainer.innerHTML = `
      <div class="text-center">
          <h1>Error loading user account</h1>
          <p>There was an issue retrieving user data. Please try again later.</p>
          <a href="index.html" class="btn btn-primary">Back to Home</a>
      </div>
      `;
  }
});
