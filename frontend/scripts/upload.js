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
    placeholder: "Add model description, motivation, intended use cases and limitations, additional notes on model usage.",
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
      statusMessage.innerHTML = Array.isArray(message)
          ? message.map((msg) => `<li>${msg}</li>`).join("")
          : message;
  
      statusMessage.className = `alert ${isError ? "alert-danger" : "alert-success"}`;
      statusMessage.classList.remove("d-none");
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
      if (file && file.type !== 'application/json') {
          displayStatusMessage('Only JSON files are allowed. Please select a valid file.', true);
          fileInput.value = ''; // Clear the invalid file
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
  
      try {
        submitButton.disabled = true;
        submitButton.textContent = "Uploading...";
  
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
  
        if (response.ok) {
          displayStatusMessage(result.message || "Upload successful!");

          // Reset the form and editor
          uploadForm.reset();
          simplemde.value(""); // Clear SimpleMDE content
          dropZone.innerHTML = `<p>Drag & drop your file here, or <span class="text-primary click-trigger">click to select</span>.</p>`;
        } else {
          let errorMessage = result.error || "An error occurred.";
          if (result.details && Array.isArray(result.details)) {
            errorMessage += "\nDetails:\n" + result.details.map(detail => `• ${detail}`).join("\n");
          }
          displayStatusMessage(errorMessage, true);
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
  