document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('modelFile');
    const submitButton = document.getElementById('submitButton');
    const missingFieldsForm = document.getElementById('missingFieldsForm');
    const missingFieldsContainer = document.getElementById('missingFieldsContainer');
    const submitMissingDataButton = document.getElementById('submitMissingDataButton');
    const statusMessage = document.getElementById('statusMessage');

    // Function to display status messages
    const displayStatusMessage = (message, isError = false) => {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${isError ? 'text-danger' : 'text-success'}`;
    };

    // Handle the main form submission
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(uploadForm);

        if (!fileInput.files.length) {
            alert('Please upload a model file.');
            return;
        }

        try {
            // Show loading indicator
            submitButton.disabled = true;
            submitButton.innerText = 'Uploading...';

            // Make POST request to upload the model file
            const response = await fetch('/api/models/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                // Model uploaded successfully
                displayStatusMessage('Model uploaded successfully! Details:\n' + JSON.stringify(result.details, null, 2));
                uploadForm.reset(); // Clear the form after successful upload
                missingFieldsForm.style.display = 'none'; // Hide missing fields form
            } else if (response.status === 400 && result.missingFields) {
                // Missing required fields in the STAC metadata
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
     * Displays input fields for the missing metadata fields and enables the user to fill them in.
     * @param {Array} missingFields - List of missing field names.
     */
    function displayMissingFields(missingFields) {
        // Clear previous content
        missingFieldsContainer.innerHTML = '';

        // Create input fields for each missing field
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

        // Show the missing fields form and allow the user to submit the additional data
        missingFieldsForm.style.display = 'block';
    }

    // Event listener for the submit button to handle missing fields submission
    submitMissingDataButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const missingData = {};
        const formData = new FormData(uploadForm);

        // Collect manually entered missing field values
        missingFieldsContainer.querySelectorAll('input').forEach(input => {
            missingData[input.name] = input.value;
            formData.append(input.name, input.value); // Append to form data
        });

        try {
            // Show loading indicator
            submitMissingDataButton.disabled = true;
            submitMissingDataButton.innerText = 'Submitting...';

            // Resubmit form data with missing fields filled
            const response = await fetch('/api/models/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                displayStatusMessage('Model uploaded successfully with manually provided data!');
                uploadForm.reset(); // Clear the form after successful upload
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
