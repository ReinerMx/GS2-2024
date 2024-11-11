document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const modelId = urlParams.get('id');
    const modelDetailsContainer = document.getElementById('modelDetailsContainer');

    if (modelId) {
        try {
            const response = await fetch(`/api/models/${modelId}`);
            const model = await response.json();

            modelDetailsContainer.innerHTML = `
                <h3>${model.modelName}</h3>
                <p><strong>Description:</strong> ${model.description}</p>
                <p><strong>Task Type:</strong> ${model.taskType}</p>
                <p><strong>Data Type:</strong> ${model.dataType}</p>
                <p><strong>Language:</strong> ${model.language}</p>
                <p><strong>File Path:</strong> ${model.filePath}</p>
            `;
        } catch (error) {
            console.error('Error loading model details:', error);
            modelDetailsContainer.innerHTML = '<p>Error loading model details.</p>';
        }
    } else {
        modelDetailsContainer.innerHTML = '<p>No model selected.</p>';
    }
});
