// account.js

/**
 * Fetches and displays the list of user-uploaded models.
 * If no models are found, displays a "no models" message.
 * If an error occurs, displays an error message.
 *
 * @async
 * @function loadUserModels
 * @returns {Promise<void>}
 */
async function loadUserModels() {
  try {
    // Fetch the models from the API
    const response = await fetch("/api/user/models");
    const models = await response.json();

    const modelList = document.getElementById("modelList");

    if (models.length === 0) {
      // Display a message if no models are uploaded
      modelList.innerHTML = "<p>No models uploaded yet.</p>";
      return;
    }

    // Clear the current content
    modelList.innerHTML = "";

    // Populate the list with model cards
    models.forEach((model) => {
      const modelCard = document.createElement("div");
      modelCard.className = "model-card";

      modelCard.innerHTML = `
                  <h5>${model.name}</h5>
                  <p>${model.description}</p>
                  <button class="view-details-btn" onclick="viewModelDetails('${model.id}')">View Details</button>
              `;

      modelList.appendChild(modelCard);
    });
  } catch (error) {
    console.error("Error loading models:", error);
    // Display an error message if fetching models fails
    document.getElementById("modelList").innerHTML =
      "<p>Error loading models.</p>";
  }
}

/**
 * Navigates to the details page of a specific model.
 *
 * @function viewModelDetails
 * @param {string} modelId - The unique identifier of the model.
 */
function viewModelDetails(modelId) {
  // Redirect to the model details page
  window.location.href = `/model/${modelId}`;
}

/**
 * Event listener to load models when the page is fully loaded.
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", loadUserModels);
