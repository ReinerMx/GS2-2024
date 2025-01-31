document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");
  
    const usernameElem = document.getElementById("username");
    const collectionsList = document.getElementById("collectionsList");
  
    try {
      const response = await fetch(`/api/users/${userId}/public`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
  
      const userData = await response.json();
  
      // Set username
      usernameElem.textContent = `Account: ${userData.username}`;
  
      // Display collections and items
      if (userData.collections.length === 0) {
        collectionsList.innerHTML = "<li>No collections found</li>";
      } else {
        userData.collections.forEach((collection) => {
          const collectionElem = document.createElement("li");
          collectionElem.innerHTML = `
            <strong>${collection.name}</strong>
            <ul>
              ${collection.items
                .map(
                  (item) => `<li>${item.properties["mlm:name"] || "Unnamed Item"}</li>`
                )
                .join("")}
            </ul>
          `;
          collectionsList.appendChild(collectionElem);
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      usernameElem.textContent = "Error loading user account.";
      collectionsList.innerHTML = "<li>Error loading data</li>";
    }
  });
  