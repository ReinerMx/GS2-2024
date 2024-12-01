/**
 * Initializes the Model Details page on DOMContentLoaded event.
 * Fetches model details based on the model ID from the URL parameters,
 * populates the page with model information, and displays a map showing spatial coverage if available.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const modelDetailsContainer = document.getElementById('modelDetailsContainer');
    
    // Check if model details container is available
    if (!modelDetailsContainer) {
        console.error('Error: modelDetailsContainer element not found');
        return;
    }

    // Retrieve model ID from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const modelId = urlParams.get('id');

    // Check if model ID is provided in the URL, otherwise display error
    if (!modelId) {
        modelDetailsContainer.innerHTML = '<p class="error-text">Error: Model ID not found in the URL.</p>';
        return;
    }

    console.log(`Loading model details for ID: ${modelId}`);

    /**
     * Fetches and loads model details based on the provided model ID.
     * 
     * @param {string} id - The model ID to fetch details for.
     */
    const loadModelDetails = async (id) => {
        try {
            // Fetch model details from the API
            const response = await fetch(`/api/models/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch model details');
            }
            const model = await response.json();

            // Generate temporal coverage HTML if data is available, otherwise show a default message
            const temporalCoverageHTML = model.temporalCoverage && model.temporalCoverage.start && model.temporalCoverage.end
                ? `<p><strong>Temporal Coverage:</strong> ${new Date(model.temporalCoverage.start).toLocaleDateString()} - ${new Date(model.temporalCoverage.end).toLocaleDateString()}</p>`
                : '<p class="info-text">No temporal coverage data available.</p>';

            // Populate the model details container with fetched information
            modelDetailsContainer.innerHTML = `
                <div class="model-details-container">
                    <!-- Text Section for Model Information -->
                    <div class="text-section">
                        <!-- Model Header with Name and Description -->
                        <div class="model-header">
                            <h3>${model.modelName || 'Model Name'}</h3>
                            <p>${model.description || 'No description available'}</p>
                        </div>

                        <!-- New fields -->
                        <p><strong>User Description:</strong> ${model.userDescription || 'No additional description provided'}</p>
                        
                        <!-- Overview Section for Basic Model Attributes -->
                        <div class="model-section">
                            <h4>Overview</h4>
                            <p><strong>Task Type:</strong> ${model.taskType || 'N/A'}</p>
                            <p><strong>Data Type:</strong> ${model.dataType || 'N/A'}</p>
                            <p><strong>Resolution:</strong> ${model.resolution || 'N/A'}</p>
                            <p><strong>Number of Bands:</strong> ${model.numberOfBands || 'N/A'}</p>
                            <p><strong>File Format:</strong> ${model.fileFormat || 'N/A'}</p>
                            ${temporalCoverageHTML}
                        </div>
                        
                        <!-- Technical Details Section with Framework and Architecture -->
                        <div class="model-section">
                            <h4>Technical Details</h4>
                            <p><strong>Framework:</strong> ${model.framework || 'N/A'}</p>
                            <p><strong>Framework Version:</strong> ${model.frameworkVersion || 'N/A'}</p>
                            <p><strong>Architecture:</strong> ${model.architecture || 'N/A'}</p>
                            <p><strong>Total Parameters:</strong> ${model.totalParameters || 'N/A'}</p>
                        </div>
                        
                        <!-- Links Section for Accessing Model, Code, and Data Source -->
                        <div class="model-section">
                            <h4>Links</h4>
                            <p><strong>Model Link:</strong> <a href="${model.modelLink}" class="styled-link" target="_blank">${model.modelLink || 'Not available'}</a></p>
                            <p><strong>Source Code Link:</strong> <a href="${model.sourceCodeLink}" class="styled-link" target="_blank">${model.sourceCodeLink || 'Not available'}</a></p>
                            <p><strong>Data Source Link:</strong> <a href="${model.dataSource}" class="styled-link" target="_blank">${model.dataSource || 'Not available'}</a></p>
                        </div>
                    </div>
                </div>
            `;

            // Initialize the map in the map container
            const map = L.map('map').setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Check if spatial coverage data is available and display it on the map
            if (model.spatialCoverage && model.spatialCoverage.coordinates) {
                const coordinates = model.spatialCoverage.coordinates;
                const coverageType = model.spatialCoverage.type;

                // Render polygon if spatial coverage is a polygon
                if (coverageType === 'Polygon') {
                    const polygonCoords = coordinates[0].map(coord => [coord[1], coord[0]]);
                    const polygon = L.polygon(polygonCoords, { color: 'blue' }).addTo(map);
                    map.fitBounds(polygon.getBounds());

                // Render point if spatial coverage is a point
                } else if (coverageType === 'Point') {
                    const point = L.marker([coordinates[1], coordinates[0]]).addTo(map);
                    map.setView([coordinates[1], coordinates[0]], 10);
                } else {
                    console.warn('Unsupported spatial coverage type:', coverageType);
                }
            } 
        } catch (error) {
            // Display error message if model details could not be loaded
            console.error('Error loading model details:', error);
            modelDetailsContainer.innerHTML = '<p class="error-text">Error loading model details.</p>';
        }
    };

    // Load the model details by calling the async function
    await loadModelDetails(modelId);
});
