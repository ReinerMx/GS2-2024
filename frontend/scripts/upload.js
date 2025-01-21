document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("modelFile");
  const dropZone = document.getElementById("dropZone");
  const submitButton = document.getElementById("submitButton");
  const statusMessage = document.getElementById("statusMessage");

  // Hide status message initially
  statusMessage.classList.add("d-none");

  // Initialize SimpleMDE for userDescription
  const simplemde = new SimpleMDE({
    element: document.getElementById("userDescription"),
    placeholder:
      "Add model description, motivation, intended use cases and limitations, additional notes on model usage.",
    spellChecker: true, // Enable spell checker
    autosave: {
      enabled: true,
      unique_id: "userDescription_autosave",
      delay: 1000,
    },
  });

  /**
   * Displays feedback messages to the user.
   */
  function displayStatusMessage(message, isError = false) {
    if (Array.isArray(message)) {
      // Display multiple errors in a list
      statusMessage.innerHTML = `<ul>${message
        .map((msg) => `<li>${msg}</li>`)
        .join("")}</ul>`;
    } else {
      statusMessage.innerHTML = `<p>${message}</p>`;
    }
    statusMessage.className = `alert ${
      isError ? "alert-danger" : "alert-success"
    }`;
    statusMessage.classList.remove("d-none");

    if (!isError) {
      setTimeout(() => {
        statusMessage.classList.add("d-none");
      }, 5000); // Auto-hide success messages
    }
  }

  /**
   * Updates drop zone text after a file is selected.
   */
  const updateDropZoneText = (fileName) => {
    dropZone.innerHTML = `<p>File ready to upload: <strong>${fileName}</strong></p>`;
  };

  /**
   * Drag-and-drop event handlers.
   */
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragging");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragging");
    const files = e.dataTransfer.files;
    if (files.length) {
      fileInput.files = files;
      updateDropZoneText(files[0].name);
    }
  });

  // File input click trigger
  dropZone.addEventListener("click", () => fileInput.click());

  // Update drop zone text when file is selected
  fileInput.addEventListener("change", () => {
    statusMessage.classList.add("d-none"); // Hide previous message when file is changed
    if (fileInput.files.length) {
      updateDropZoneText(fileInput.files[0].name);
    }
    const file = fileInput.files[0];
    if (file && file.type !== "application/json") {
      displayStatusMessage(
        "Only JSON files are allowed. Please select a valid file.",
        true
      );
      fileInput.value = ""; // Clear the invalid file
    }
  });

  /**
   * Handles form submission.
   */
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!fileInput.files.length) {
      displayStatusMessage("Please select a file before uploading.", true);
      return;
    }

    const formData = new FormData(uploadForm);
    // Include the rendered Markdown content as part of the form submission
    formData.set("userDescription", simplemde.value());

    const token = localStorage.getItem("token");
    if (!token) {
      displayStatusMessage("Please log in to upload.", true);
      submitButton.disabled = true;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = "Uploading...";

      const response = await fetch("/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // add token
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // successful upload
        displayStatusMessage(result.message || "Upload successful!");
        // Reset the form and editor
        uploadForm.reset();
        simplemde.value(""); // Clear SimpleMDE content
        dropZone.innerHTML = `<p>Drag & drop your file here, or <span class="text-primary click-trigger">click to select</span>.</p>`;
      } else if (response.status === 404) {
        displayStatusMessage(
          result.message || "Please log in before uploading.",
          true
        );
      } else if (response.status === 401) {
        // user not logged in
        displayStatusMessage(
          "Access denied. Please log in before uploading.",
          true
        );
      } else if (response.status === 400) {
        // incorrect entries
        let errorMessage = result.error || "Invalid input data.";
        if (result.details && Array.isArray(result.details)) {
          errorMessage +=
            "\nDetails:\n" +
            result.details.map((detail) => `• ${detail}`).join("\n");
        }
        displayStatusMessage(errorMessage, true);
      } else {
        // unexpected error
        displayStatusMessage(
          "An unexpected error occurred. Please try again.",
          true
        );
      }
    } catch (error) {
      console.error("Upload failed:", error);
      displayStatusMessage(error.message, true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Upload Model";
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const uploadFormContainer = document.getElementById("uploadContainer");

  /**
   * Displays a message in the upload container container.
   *
   * @param {string} message - The message to display.
   * @param {boolean} [isError=true] - Whether the message is an error or a success message.
   */
  const displayMessage = (message, isError = true) => {
    uploadFormContainer.innerHTML = `
      <div class="alert ${
        isError ? "alert-danger" : "alert-success"
      }" role="alert">
        ${message}
      </div>
    `;
  };

  // Redirect to login page if no token is found
  if (!token) {
    uploadFormContainer.innerHTML = `
      <div class="text-center">
        <h1>You are not logged in</h1>
        <p>Please log in or register to upload models.</p>
        <a href="login.html" class="btn btn-primary">Login</a>
        <a href="register.html" class="btn btn-secondary">Register</a>
      </div>
    `;
    return;
  }

  try {
    // Verify the token by fetching user details
    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate. Please log in again.");
    }

    const userData = await response.json();

    // User is authenticated, display the upload form
    uploadFormContainer.innerHTML = `
      <h2 class="upload-title">Upload Your Model</h2>
        <p class="upload-instructions">
          Follow these steps to upload your files: <br />
          1. Upload the <strong>Collection</strong> file first. <br />
          2. Then upload <strong>Item</strong> files related to the collection. <br />
          <br />
          All uploaded files will be validated against the
          <a href="https://github.com/stac-extensions/mlm">STAC specifications</a> to ensure
          compliance. <br />
          If any errors are found, you will be notified and guided to resolve them. <br />
          <br />
          <strong>Need help?</strong> Check out our <a href="tutorials.html">tutorials</a>.
        </p>

        <div id="statusMessage" class="status-message"></div>

        <!-- Drag-and-Drop + File Upload Section -->
        <div id="dropZone" class="drop-zone">
          <p>Drag & drop your file here or <span class="click-trigger">click to select</span>.</p>
        </div>

        <form id="uploadForm" enctype="multipart/form-data">
          <input
            type="file"
            id="modelFile"
            name="modelFile"
            class="form-control-file d-none"
            accept=".json"
            required
          />
          <textarea
            id="userDescription"
            name="userDescription"
            rows="10"
            placeholder="Optional: Add additional details about your model using Markdown..."
          ></textarea>

          <button type="submit" id="submitButton" class="btn btn-primary btn-lg btn-block mt-3">
            Upload Model
          </button>
        </form>
        <small class="form-text text-muted mt-3 text-center">
          Ensure the file adheres to the STAC metadata format. <br />
          Need help? Check out our <a href="tutorials.html">tutorials</a>.
        </small>
    `;
  } catch (error) {
    // Display error message if user details could not be fetched
    displayMessage(error.message);
  }
});
