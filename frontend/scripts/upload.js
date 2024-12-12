/**
 * JavaScript file to handle the DOM interaction and form submission for uploading models.
 * This file includes validation for input fields and handling responses from the server.
 */

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('modelFile');
    const submitButton = document.getElementById('submitButton');
    const missingFieldsForm = document.getElementById('missingFieldsForm');
    const missingFieldsContainer = document.getElementById('missingFieldsContainer');
    const submitMissingDataButton = document.getElementById('submitMissingDataButton');
    const statusMessage = document.getElementById('statusMessage');

    /**
     * Displays a status message to the user.
     *
     * @param {string} message - The message to display.
     * @param {boolean} [isError=false] - Whether the message represents an error.
     */
    const displayStatusMessage = (message, isError = false) => {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${isError ? 'text-danger' : 'text-success'}`;
    };

    /**
     * Handles the main form submission, validates fields, and sends the data to the server.
     *
     * @param {Event} event - The submit event.
     */
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Create FormData object and append additional fields
        const formData = new FormData(uploadForm);
        formData.append('userDescription', document.getElementById('userDescription').value.trim());

        // Validate file input
        if (!fileInput.files.length) {
            alert('Please upload a model file.');
            return;
        }

        try {
            // Show loading indicator
            submitButton.disabled = true;
            submitButton.innerText = 'Uploading...';

            // Send the POST request
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            // Handle the server response
            if (response.ok) {
                displayStatusMessage('Model uploaded successfully! Details:\n' + JSON.stringify(result.details, null, 2));
                uploadForm.reset(); // Reset the form
                missingFieldsForm.style.display = 'none'; // Hide missing fields form
            } else if (response.status === 400 && result.missingFields) {
                alert('The file is missing required STAC-compliant metadata fields. Please provide them below.');
                displayMissingFields(result.missingFields);
            } else {
                displayStatusMessage(`Error: ${result.message}`, true);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            displayStatusMessage('An error occurred while uploading the model.', true);
        } finally {
            // Reset loading indicator
            submitButton.disabled = false;
            submitButton.innerText = 'Upload Model';
        }
    });

    /**
     * Displays input fields for the missing metadata fields and allows the user to fill them in.
     *
     * @param {Array<string>} missingFields - List of missing field names.
     */
    function displayMissingFields(missingFields) {
        // Clear previous content
        missingFieldsContainer.innerHTML = '';

        // Create input fields dynamically for each missing field
        missingFields.forEach(field => {
            const fieldLabel = document.createElement('label');
            fieldLabel.textContent = `Please provide ${field}:`;
            fieldLabel.htmlFor = field;

            const fieldInput = document.createElement('input');
            fieldInput.type = 'text';
            fieldInput.id = field;
            fieldInput.name = field;
            fieldInput.className = 'form-control';
            fieldInput.required = true;

            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.appendChild(fieldLabel);
            formGroup.appendChild(fieldInput);

            missingFieldsContainer.appendChild(formGroup);
        });

        // Show the missing fields form
        missingFieldsForm.style.display = 'block';
    }

    /**
     * Handles submission of additional data for missing fields.
     *
     * @param {Event} event - The click event on the submit button.
     */
    submitMissingDataButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const formData = new FormData(uploadForm);

        // Collect additional data for missing fields
        missingFieldsContainer.querySelectorAll('input').forEach(input => {
            formData.append(input.name, input.value);
        });

        try {
            // Show loading indicator
            submitMissingDataButton.disabled = true;
            submitMissingDataButton.innerText = 'Submitting...';

            // Resubmit form data
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                displayStatusMessage('Model uploaded successfully with manually provided data!');
                uploadForm.reset(); // Clear the form
                missingFieldsForm.style.display = 'none'; // Hide missing fields form
            } else {
                displayStatusMessage(`Error: ${result.message}`, true);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            displayStatusMessage('An error occurred while uploading the model with the additional data.', true);
        } finally {
            // Reset loading indicator
            submitMissingDataButton.disabled = false;
            submitMissingDataButton.innerText = 'Submit Additional Data';
        }
    });
});
