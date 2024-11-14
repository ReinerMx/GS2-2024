document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('resultsContainer');
    const searchInput = document.getElementById('searchInput');

    // Function to fetch and display all models initially
    const loadAllModels = async () => {
        try {
            const response = await fetch('/api/models');
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
                <button class="btn btn-info view-details-btn" data-id="${model.id}">View Details</button>
            `;
            resultsContainer.appendChild(modelDiv);
        });

        // Attach event listeners to "View Details" buttons
        attachViewDetailsListeners();
    };

    // Function to attach click listeners to "View Details" buttons
    const attachViewDetailsListeners = () => {
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const modelId = event.target.getAttribute('data-id');
                viewDetails(modelId);
            });
        });
    };

    // Function to navigate to the details page
    const viewDetails = (modelId) => {
        window.location.href = `modelDetails.html?id=${modelId}`;
    };

    // Load all models on page load
    loadAllModels();

    // Attach search functionality
    searchInput.addEventListener('input', performSearch);
});
