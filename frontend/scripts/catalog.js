document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('resultsContainer');
    const searchInput = document.getElementById('searchInput');

    // Function to fetch and display all models initially
    const loadAllModels = async () => {
        try {
            const response = await fetch('/api/models'); // Backend API to fetch all models
            const models = await response.json();
            displayModels(models);
        } catch (error) {
            console.error('Error loading models:', error);
            resultsContainer.innerHTML = '<p>Error loading models.</p>';
        }
    };

    // Function to perform search based on input
    const performSearch = async () => {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            loadAllModels();
            return;
        }
        
        try {
            const response = await fetch(`/api/models/search?term=${encodeURIComponent(searchTerm)}`);
            const models = await response.json();
            displayModels(models);
        } catch (error) {
            console.error('Error searching models:', error);
            resultsContainer.innerHTML = '<p>Error searching models.</p>';
        }
    };

    // Function to display models
    const displayModels = (models) => {
        resultsContainer.innerHTML = ''; // Clear previous content
        if (models.length === 0) {
            resultsContainer.innerHTML = '<p>No models found.</p>';
            return;
        }
        
        models.forEach(model => {
            const modelDiv = document.createElement('div');
            modelDiv.classList.add('model-item', 'mb-4');
            modelDiv.innerHTML = `
                <h4>${model.modelName}</h4>
                <p>${model.description}</p>
                <button class="btn btn-info" onclick="viewDetails('${model.id}')">View Details</button>
            `;
            resultsContainer.appendChild(modelDiv);
        });
    };

    // Load all models on page load
    loadAllModels();
});

function viewDetails(modelId) {
    window.location.href = `modelDetails.html?id=${modelId}`;
}
