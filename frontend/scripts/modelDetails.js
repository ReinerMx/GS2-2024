document.addEventListener('DOMContentLoaded', async () => {
    const modelDetailsContainer = document.getElementById('modelDetailsContainer');
    const temporalChartContainer = document.getElementById('temporalChart');
    const modelNameElement = document.getElementById('modelName');
    const userDescriptionElement = document.getElementById('userDescription');

    if (!modelDetailsContainer || !temporalChartContainer || !modelNameElement || !userDescriptionElement) {
        console.error('Error: Required elements not found');
        return;
    }

    // Retrieve item and collection IDs from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('item_id');
    const collectionId = urlParams.get('collection_id');

    if (!itemId || !collectionId) {
        modelDetailsContainer.innerHTML = '<p class="error-text">Error: Collection ID or Item ID is missing in the URL.</p>';
        return;
    }

    const loadModelDetails = async (collectionId, itemId) => {
        try {
            const response = await fetch(`/collections/${collectionId}/items/${itemId}`);
            if (!response.ok) throw new Error('Failed to fetch model details');
            const model = await response.json();

            // Populate Model Name and User Description
            modelNameElement.textContent = model.properties['mlm:name'] || 'Unknown Model';
            userDescriptionElement.textContent = model.user_description || 'No description provided.';

            // Render Temporal Coverage Timeline
            if (model.properties.start_datetime && model.properties.end_datetime) {
                const startDate = new Date(model.properties.start_datetime);
                const endDate = new Date(model.properties.end_datetime);
                temporalChartContainer.innerHTML = `
                    <div class="temporal-timeline">
                        <span class="start-date">${startDate.toLocaleDateString()}</span>
                        <span class="timeline-line"></span>
                        <span class="end-date">${endDate.toLocaleDateString()}</span>
                    </div>
                `;
            } else {
                temporalChartContainer.innerHTML = '<p class="text-muted"><em>No temporal coverage data available.</em></p>';
            }

            // Render Assets Section
            const assetsHTML = model.assets?.map(asset => `
                <div class="asset">
                    <h5>${asset.title || 'Untitled Asset'}</h5>
                    <p>${asset.description || 'No description available.'}</p>
                    <p><strong>Type:</strong> ${asset.type}</p>
                    <p><strong>Link:</strong> <a href="${asset.href}" target="_blank">${asset.href}</a></p>
                </div>
            `).join('') || '<p>No assets available.</p>';

            // Render Input and Output
            const inputsHTML = model.properties['mlm:input']?.map(input => `
                <div>
                    <h6>Input: ${input.name}</h6>
                    <p>Bands: ${input.bands.join(', ')}</p>
                    <p>Shape: ${input.input.shape.join(' × ')}</p>
                    <p>Data Type: ${input.input.data_type}</p>
                    <p>Dimensions Order: ${input.input.dim_order.join(' > ')}</p>
                </div>
            `).join('') || '<p>No input data available.</p>';

            const outputsHTML = model.properties['mlm:output']?.map(output => `
                <div>
                    <h6>Output: ${output.name}</h6>
                    <p>Result Shape: ${output.result.shape.join(' × ')}</p>
                    <p>Data Type: ${output.result.data_type}</p>
                    <p>Dimensions Order: ${output.result.dim_order.join(' > ')}</p>
                    <h6>Classification:</h6>
                    ${output['classification:classes']?.map(cls => `
                        <div>
                            <p><strong>${cls.name}</strong> (Value: ${cls.value}, Color: ${cls.color_hint || 'N/A'})</p>
                            <p>${cls.description || 'No description'}</p>
                        </div>
                    `).join('') || '<p>No classification data available.</p>'}
                </div>
            `).join('') || '<p>No output data available.</p>';

            // Populate Model Details
            modelDetailsContainer.innerHTML = `
                <div class="model-details-container">
                    <div class="text-section">
                        <h4>Overview</h4>
                        <p><strong>Architecture:</strong> ${model.properties['mlm:architecture'] || 'N/A'}</p>
                        <p><strong>Framework:</strong> ${model.properties['mlm:framework']} v${model.properties['mlm:framework_version'] || 'N/A'}</p>
                        <p><strong>Tasks:</strong> ${model.properties['mlm:tasks']?.join(', ') || 'N/A'}</p>
                        <p><strong>Accelerator:</strong> ${model.properties['mlm:accelerator'] || 'N/A'}</p>
                    </div>
                    <div class="input-section">
                        <h4>Input</h4>
                        ${inputsHTML}
                    </div>
                    <div class="output-section">
                        <h4>Output</h4>
                        ${outputsHTML}
                    </div>
                    <div class="assets-section">
                        <h4>Assets</h4>
                        ${assetsHTML}
                    </div>
                </div>
            `;

            // Render Spatial Coverage (Map)
            const map = L.map('map').setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            if (model.geometry) {
                if (model.geometry.type === 'Polygon') {
                    const polygonCoords = model.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                    L.polygon(polygonCoords, { color: 'blue' }).addTo(map).bindTooltip('Spatial Coverage').openTooltip();
                    map.fitBounds(polygonCoords);
                } else if (model.geometry.type === 'Point') {
                    const [lon, lat] = model.geometry.coordinates;
                    L.marker([lat, lon]).addTo(map).bindTooltip('Location').openTooltip();
                    map.setView([lat, lon], 10);
                }
            }
        } catch (error) {
            console.error('Error loading model details:', error);
            modelDetailsContainer.innerHTML = '<p class="error-text">Error loading model details.</p>';
        }
    };

    await loadModelDetails(collectionId, itemId);
});
