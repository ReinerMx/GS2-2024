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

    const token = localStorage.getItem("token");
    if (!token) {
      // Priority check: user is not logged in
      displayStatusMessage(
        `Access denied. Please <a href="login.html">log in</a> to upload files.`,
        true
      );
      return;
    }

    if (!fileInput.files.length) {
      displayStatusMessage("Please select a file before uploading.", true);
      return;
    }

    const formData = new FormData(uploadForm);
    // Include the rendered Markdown content as part of the form submission
    formData.set("userDescription", simplemde.value());

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
      } else if (response.status === 403) {
        // User doesn't own the collection
        displayStatusMessage(
          result.message || "Access denied. You don't have permission to upload to this collection.",
          true
        );
      } else if (response.status === 404) {
        displayStatusMessage(result.message || "Please <a href=\"login.html\">log in</a> to upload files.", true);
      } else if (response.status === 401) {
        // user not logged in
        displayStatusMessage("Access denied. Please <a href=\"login.html\">log in</a> to upload files.", true);
      } else if (response.status === 400) {
        // incorrect entries
        let errorMessage = result.error || "Invalid input data.";
        if (result.details && Array.isArray(result.details)) {
          errorMessage += "\nDetails:\n" + result.details.map((detail) => `• ${detail}`).join("\n");
        }
        displayStatusMessage(errorMessage, true);
      } else {
        // unexpected error
        displayStatusMessage("An unexpected error occurred. Please try again.", true);
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
