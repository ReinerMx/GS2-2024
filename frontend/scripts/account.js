// account.js

// Funktion, um Modelle zu laden und auf der Seite anzuzeigen
async function loadUserModels() {
    try {
        // Abrufen der Modellinformationen von der API
        const response = await fetch('/api/user/models');
        const models = await response.json();

        // Überprüfen, ob Modelle existieren
        if (models.length === 0) {
            document.getElementById('modelList').innerHTML = '<p>No models uploaded yet.</p>';
            return;
        }

        // Modellliste rendern
        const modelList = document.getElementById('modelList');
        modelList.innerHTML = ''; // Lösche vorhandene Inhalte
        
        models.forEach(model => {
            // Erstelle eine Karte für jedes Modell
            const modelCard = document.createElement('div');
            modelCard.className = 'model-card';

            modelCard.innerHTML = `
                <h5>${model.name}</h5>
                <p>${model.description}</p>
                <button class="view-details-btn" onclick="viewModelDetails('${model.id}')">View Details</button>
            `;

            modelList.appendChild(modelCard);
        });
    } catch (error) {
        console.error('Fehler beim Laden der Modelle:', error);
        document.getElementById('modelList').innerHTML = '<p>Error loading models.</p>';
    }
}

// Funktion zum Anzeigen von Modelldetails
function viewModelDetails(modelId) {
    // Weiterleitung oder Anzeige der Details in einem Modal
    window.location.href = `/model/${modelId}`;
}

// Modelle beim Laden der Seite abrufen
document.addEventListener('DOMContentLoaded', loadUserModels);