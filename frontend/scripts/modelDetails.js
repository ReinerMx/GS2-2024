document.addEventListener('DOMContentLoaded', async () => {
    const modelDetailsContainer = document.getElementById('modelDetails');

    // Function to get the model ID from the URL query string
    const getModelIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    // Function to load model details based on the ID
    const loadModelDetails = async () => {
        const modelId = getModelIdFromUrl();
        if (!modelId) {
            modelDetailsContainer.innerHTML = '<p>Model ID not found in URL.</p>';
            return;
        }

        try {
            const response = await fetch(`/api/models/${modelId}`); // API endpoint for model details
            if (!response.ok) throw new Error('Failed to fetch model details');
            const model = await response.json();

            // Display model details
            modelDetailsContainer.innerHTML = `
                <h3>${model.modelName}</h3>
                <p><strong>Description:</strong> ${model.description}</p>
                <p><strong>Task Type:</strong> ${model.taskType}</p>
                <p><strong>Data Type:</strong> ${model.dataType}</p>
                <p><strong>Resolution:</strong> ${model.resolution}</p>
                <p><strong>Number of Bands:</strong> ${model.numberOfBands}</p>
                <p><strong>File Format:</strong> ${model.fileFormat}</p>
                <p><strong>Data Source:</strong> <a href="${model.dataSource}" target="_blank">${model.dataSource}</a></p>
                <p><strong>Framework:</strong> ${model.framework}</p>
                <p><strong>Architecture:</strong> ${model.architecture}</p>
                <p><strong>Total Parameters:</strong> ${model.totalParameters}</p>
            `;
        } catch (error) {
            console.error('Error loading model details:', error);
            modelDetailsContainer.innerHTML = '<p>Error loading model details.</p>';
        }
    };

    loadModelDetails();
});
