document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const uploadFormContainer = document.getElementById("uploadContainer");
  const statusMessage = document.getElementById("statusMessage");

  /**
   * Displays feedback messages to the user.
   * @param {string} message - The message to display.
   * @param {boolean} [isError=true] - Whether the message is an error or a success message.
   */
  const displayMessage = (message, isError = true) => {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.innerHTML = `<div class="alert ${
      isError ? "alert-danger" : "alert-success"
    }" role="alert">${message}</div>`;
    statusMessage.classList.remove("d-none");

    if (!isError) {
      setTimeout(() => {
        statusMessage.classList.add("d-none");
      }, 5000);
    }
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
        <a href="https://github.com/stac-extensions/mlm">STAC specifications</a> to ensure compliance. <br />
        If any errors are found, you will be notified and guided to resolve them. <br />
        <br />
        <strong>Need help?</strong> Check out our <a href="tutorials.html">tutorials</a>.
      </p>

      <div id="statusMessage" class="status-message d-none"></div>


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

    const uploadForm = document.getElementById("uploadForm");
    const fileInput = document.getElementById("modelFile");
    const dropZone = document.getElementById("dropZone");
    const submitButton = document.getElementById("submitButton");

    const simplemde = new SimpleMDE({
      element: document.getElementById("userDescription"),
      placeholder:
        "Add model description, motivation, intended use cases and limitations, additional notes on model usage.",
      spellChecker: true,
      autosave: {
        enabled: true,
        unique_id: "userDescription_autosave",
        delay: 1000,
      },
    });

    const updateDropZoneText = (fileName) => {
      dropZone.innerHTML = `<p>File ready to upload: <strong>${fileName}</strong></p>`;
    };

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

    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      statusMessage.classList.add("d-none");
      if (fileInput.files.length) {
        updateDropZoneText(fileInput.files[0].name);
      }
      const file = fileInput.files[0];
      if (file && file.type !== "application/json") {
        displayMessage(
          "Only JSON files are allowed. Please select a valid file.",
          true
        );
        fileInput.value = "";
      }
    });

    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!fileInput.files.length) {
        displayMessage("Please select a file before uploading.", true);
        return;
      }

      const formData = new FormData(uploadForm);
      formData.set("userDescription", simplemde.value());

      try {
        submitButton.disabled = true;
        submitButton.textContent = "Uploading...";

        const response = await fetch("/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();

        // Handle different response statuses
        if (response.ok) {
          displayMessage(result.message || "Upload successful!", false); // isError explizit auf false setzen
          uploadForm.reset();
          simplemde.value("");
          dropZone.innerHTML = `<p>Drag & drop your file here, or <span class="text-primary click-trigger">click to select</span>.</p>`;
        } else if (response.status === 400) {
          displayMessage(
            result.message || "Bad Request: Invalid data provided.",
            true
          );
        } else if (response.status === 401) {
          displayMessage("Unauthorized: Please log in.", true);
        } else if (response.status === 500) {
          displayMessage("Server error: Please try again later.", true);
        } else {
          displayMessage("An unknown error occurred.", true);
        }
      } catch (error) {
        console.error("Error during upload:", error);
        displayMessage("An unexpected error occurred. Please try again.", true);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Upload Model";
      }
    });
  } catch (error) {
    displayMessage(error.message);
  }
});
