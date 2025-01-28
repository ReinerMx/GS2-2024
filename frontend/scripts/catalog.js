let drawnGeometry = null;

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".filter-sidebar");
  const toggleButton = document.querySelector(".toggle-sidebar-btn");

  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
});

// Attach click listeners to "View Details" buttons
const attachViewDetailsListeners = () => {
  console.log('Attaching event listeners to "View Details" buttons.');
  document.querySelectorAll(".view-details-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const collectionId = event.target.getAttribute("data-collection-id");
      const itemId = event.target.getAttribute("data-item-id");
      console.log(
        `"View Details" button clicked for Collection ID: ${collectionId}, Item ID: ${itemId}`
      );
      window.location.href = `modelDetails.html?collection_id=${collectionId}&item_id=${itemId}`;
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const resultsContainer = document.getElementById("resultsContainer");
  const searchInput = document.getElementById("searchInput");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const autocompleteList = document.createElement("ul");
  autocompleteList.setAttribute("id", "autocomplete-list");
  autocompleteList.setAttribute("class", "autocomplete");
  document.body.appendChild(autocompleteList);

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      const query = event.target.value.trim();
      if (query) {
        console.log(`Search triggered with query: ${query}`);
        fetchSearchResults(query);
      }
    }
  };

  searchInput.addEventListener("keypress", handleSearch);

  // Adjust the position of the autocomplete list
  const positionAutocomplete = () => {
    if (autocompleteList.style.display === "block") {
      const rect = searchInput.getBoundingClientRect();
      autocompleteList.style.position = "absolute";
      autocompleteList.style.top = `${rect.bottom + window.scrollY}px`;
      autocompleteList.style.left = `${rect.left + window.scrollX}px`;
      autocompleteList.style.width = `${rect.width}px`;
    }
  };

  // Event listener for updating autocomplete position on resize
  window.addEventListener("resize", positionAutocomplete);

  // Function to fetch and display autocomplete suggestions
  const fetchAutocompleteSuggestions = async (query) => {
    console.log("Fetching suggestions for:", query);

    // if input is empty
    if (!query.trim()) {
      autocompleteList.innerHTML = "";
      autocompleteList.style.display = "none"; // dont show empty list
      return;
    }

    try {
      const response = await fetch(
        `/searchbar?keyword=${encodeURIComponent(query)}`
      );
      if (!response.ok)
        throw new Error("Error fetching autocomplete suggestions");

      const { suggestions } = await response.json();
      console.log("Autocomplete Suggestions:", suggestions); // Debug log
      autocompleteList.innerHTML = ""; // Clear previous suggestions

      // Only shows list if items are there
      if (suggestions.length > 0) {
        autocompleteList.style.display = "block";
      } else {
        autocompleteList.style.display = "none";
      }

      const highlight = (text, query) => {
        const regex = new RegExp(query, "gi");
        return text.replace(regex, (match) => `<mark>${match}</mark>`);
      };

      suggestions.forEach((suggestion) => {
        const li = document.createElement("li");
        li.classList.add("autocomplete-item");

        if (suggestion.type === "collection") {
          li.innerHTML = `
            <strong>${highlight(
              suggestion.title || "Unnamed Collection",
              query
            )}</strong>
            <small>Keywords: ${
              suggestion.keywords
                ? suggestion.keywords.map((k) => highlight(k, query)).join(", ")
                : "None"
            }</small>
          `;
        } else if (suggestion.type === "item") {
          li.innerHTML = `
            <strong>${highlight(
              suggestion.title || "Unnamed Item",
              query
            )}</strong>
            <small>Tasks: ${
              suggestion.tasks
                ? suggestion.tasks.map((t) => highlight(t, query)).join(", ")
                : "None"
            }</small>
            <small>Architecture: ${highlight(
              suggestion.architecture,
              query
            )}</small>
            <small>Framework: ${highlight(suggestion.framework, query)}</small>
          `;
        }

        li.addEventListener("click", () => handleSuggestionClick(suggestion));
        autocompleteList.appendChild(li);
      });

      positionAutocomplete();
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
    }
  };
  positionAutocomplete;

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    // Set up the redirection to catalog.html with the query
    const searchQuery = suggestion.title || suggestion.name;
    const url = `catalog.html?search=${encodeURIComponent(searchQuery)}`;

    // Redirect to the Catalog page
    window.location.href = url;
  };

  // Ensure suggestions from the server are clickable
  autocompleteList.addEventListener("click", (event) => {
    const clickedElement = event.target.closest(".autocomplete-item");
    if (clickedElement) {
      const suggestion = clickedElement.dataset.suggestion
        ? JSON.parse(clickedElement.dataset.suggestion)
        : null;
      if (suggestion) {
        handleSuggestionClick(suggestion);
      }
    }
  });

  // Attach an input event listener to the search input
  searchInput.addEventListener("input", (e) => {
    console.log("Input event triggered:", e.target.value);
    fetchAutocompleteSuggestions(e.target.value.trim());
  });

  // Clear input and autocomplete list when focus is lost
  searchInput.addEventListener("blur", (event) => {
    setTimeout(() => {
      if (!autocompleteList.contains(document.activeElement)) {
        searchInput.value = "";
        autocompleteList.innerHTML = "";
        autocompleteList.style.display = "none";
      }
    }, 100);
  });

  // Close the autocomplete list if the user clicks outside
  document.addEventListener("click", (event) => {
    if (
      !autocompleteList.contains(event.target) &&
      event.target !== searchInput
    ) {
      setTimeout(() => {
        autocompleteList.innerHTML = "";
      }, 100);
    }
  });

  const filterContainer = document.getElementById("filterContainer");

  const loadFilters = async () => {
    try {
      const response = await fetch("/filters");
      if (!response.ok) throw new Error("Error fetching filters");
      const { tasks, frameworks, architectures, keywords, dataTypes } =
        await response.json();

      // Pass all filters to renderFilters
      renderFilters({
        tasks,
        frameworks,
        architectures,
        keywords,
        dataTypes,
      });
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  /**
   * Function to render filters dynamically
   * @param {*} filters
   */
  const renderFilters = (filters) => {
    filterContainer.innerHTML = `
    <div class="additional-filters-container mt-3">
      <div class="d-flex justify-content-between align-items-center additional-filters-header" data-toggle="collapse" data-target="#advancedFilters" aria-expanded="false" aria-controls="advancedFilters">
        <span class="filter-title">Additional Filters</span>
        <span class="caret-icon">&#9660;</span>
      </div>
      <div class="collapse mt-2" id="advancedFilters">
        <div class="card card-body">
          <div class="left-column">
            <div class="filter-category">
              <h6>Tasks</h6>
              <div id="tasksContainer"></div>
            </div>
            <div class="filter-category">
              <h6>Frameworks</h6>
              <div id="frameworksContainer"></div>
            </div>
            <div class="filter-category">
              <h6>Architectures</h6>
              <div id="architecturesContainer"></div>
            </div>
          </div>
          <div class="right-column">
            <div class="filter-category">
              <h6>Keywords</h6>
              <div id="keywordsContainer"></div>
            </div>
            <div class="filter-category">
              <h6>Data Types</h6>
              <div id="dataTypesContainer"></div>
            </div>
        </div>
      </div>
    </div>
`;

    // Fill each specific filter category
    const tasksContainer = document.getElementById("tasksContainer");
    const frameworksContainer = document.getElementById("frameworksContainer");
    const architecturesContainer = document.getElementById(
      "architecturesContainer"
    );
    const keywordsContainer = document.getElementById("keywordsContainer");
    const dataTypesContainer = document.getElementById("dataTypesContainer");

    // Helper function to populate filters
    const populateFilterCategory = (container, items) => {
      if (items && container) {
        items.forEach((item) => {
          const filterItem = document.createElement("div");
          filterItem.classList.add("filter-item");
          filterItem.textContent = item;
          filterItem.addEventListener("click", () => {
            searchInput.value = item; // Fill search input
            fetchSearchResults(item); // Trigger search on click
          });
          container.appendChild(filterItem);
        });
      }
    };

    // Populate the filter categories
    populateFilterCategory(tasksContainer, filters.tasks);
    populateFilterCategory(frameworksContainer, filters.frameworks);
    populateFilterCategory(architecturesContainer, filters.architectures);
    populateFilterCategory(keywordsContainer, filters.keywords);
    populateFilterCategory(dataTypesContainer, filters.dataTypes);
  };

  loadFilters(); // Initialize filters on page load

  // Initialize Leaflet map
  const map = L.map("map").setView([51.505, -0.09], 3);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
  }).addTo(map);

  // Add Leaflet Draw tool
  const drawControl = new L.Control.Draw({
    draw: {
      polygon: false,
      rectangle: true,
      polyline: false,
      circle: false,
      marker: false,
      circlemarker: false,
    },
  });
  map.addControl(drawControl);

  // Save geometry after drawing
  map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    map.addLayer(layer); // Add the drawn shape to the map
    drawnGeometry = layer;
    console.log("GeoJSON:", layer.toGeoJSON());
  });

  // Event listener for applying geographic filter
  document
    .getElementById("applyGeoFilter")
    .addEventListener("click", async () => {
      const filters = {}; // Initialize the filters object

      // Ensure either geometry or time range is provided
      if (!drawnGeometry && !(startDateInput.value || endDateInput.value)) {
        alert("Please provide either a geographic region or a time range!");
        return;
      }

      // Add the geographic filter if a shape was drawn
      if (drawnGeometry) {
        const geoJSON = drawnGeometry.toGeoJSON();
        console.log("Geographic Filter GeoJSON:", geoJSON);
        filters.geoFilter = geoJSON.geometry;
        console.log("Received GeoJSON:", JSON.stringify(geoJSON)); // Log only when geoJSON exists

        // Calculate Bounding Box
        const bbox = turf.bbox(geoJSON); // Requires turf.js
        filters.bbox = bbox; // Speichere die Bounding Box
        console.log("Bounding Box:", bbox);

        if (drawnGeometry) {
          const filterLayer = L.geoJSON(drawnGeometry.toGeoJSON(), {
            style: { color: "#ff7800", weight: 2, fillOpacity: 0.2 },
          }).addTo(map);

          map.fitBounds(filterLayer.getBounds());
        }
      }

      // Add the time filter if startDate or endDate is provided
      if (startDateInput.value || endDateInput.value) {
        filters.datetime = `${startDateInput.value || ".."}/${
          endDateInput.value || ".."
        }`;
      }

      console.log("Sending filters:", filters);
      console.log("Received geoFilter on server:", filters.geoFilter);
      console.log(
        "Serialized geoFilter for PostGIS:",
        JSON.stringify(filters.geoFilter)
      );

      // Send filters to the backend
      try {
        const response = await fetch("/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        });

        if (!response.ok) throw new Error("Error fetching filtered models");

        const models = await response.json();
        console.log("Filtered Models:", models);

        displayModels(models.features || [], filters);
      } catch (error) {
        console.error("Error applying filters:", error);
        resultsContainer.innerHTML = "<p>Error fetching filtered models.</p>";
      }
    });

  // Debugging initialization
  console.log("Document loaded. Initializing collections and event listeners.");

  // Function to fetch and display all collections
  const loadAllCollections = async () => {
    console.log("Starting to load all collections...");
    try {
      const response = await fetch("/collections");
      console.log("Fetch response for collections:", response);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Fetched collections data:", data);
      const collections = data.collections || [];
      displayCollections(collections);
    } catch (error) {
      console.error("Error loading collections:", error);
      resultsContainer.innerHTML = "<p>Error loading collections.</p>";
    }
  };

  // Function to fetch and display items in a specific collection
  const loadItemsInCollection = async (collectionId) => {
    console.log(`Starting to load items for collection ID: ${collectionId}`);
    try {
      const response = await fetch(`/collections/${collectionId}/items`);
      console.log(
        `Fetch response for items in collection ${collectionId}:`,
        response
      );
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      console.log("Fetched items data:", data);
      displayItems(data.items || []);
    } catch (error) {
      console.error(
        `Error loading items for collection ID ${collectionId}:`,
        error
      );
      resultsContainer.innerHTML = `<p>Error loading items for collection ${collectionId}.</p>`;
    }
  };

  // Function to display collections
  const displayCollections = (collections) => {
    console.log("Displaying collections:", collections);
    resultsContainer.innerHTML = ""; // Clear previous content

    if (collections.length === 0) {
      resultsContainer.innerHTML = "<p>No collections found.</p>";
      return;
    }

    collections.forEach((collection) => {
      console.log("Rendering collection:", collection);
      const collectionDiv = document.createElement("div");
      collectionDiv.classList.add("model-item", "mb-4");

      // render keyords as single span elements (for arrays)
      const keywordsHTML =
        Array.isArray(collection.keywords) && collection.keywords.length > 0
          ? collection.keywords
              .map((keyword) => `<span>${keyword.trim()}</span>`)
              .join(" ")
          : "";

      // username from uploader
      const uploader = collection.uploader;

      collectionDiv.innerHTML = `
                <h4>${collection.title}</h4>
                <p>${collection.description}</p>
                <p><strong>Uploaded by:</strong> ${uploader}</p>
                <div class="collection-keywords">${keywordsHTML}</div>
                <button class="btn btn-primary view-items-btn" data-id="${collection.collection_id}">View Items</button>
            `;

      resultsContainer.appendChild(collectionDiv);
    });

    attachViewItemsListeners();
  };

  // Function to display items in a collection
  const displayItems = (items) => {
    console.log("Displaying items:", items);
    resultsContainer.innerHTML = ""; // Clear previous content

    if (items.length === 0) {
      resultsContainer.innerHTML = "<p>No items found in this collection.</p>";
      return;
    }

    items.forEach((item) => {
      console.log("Rendering item:", item);
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("model-item", "mb-4");

      itemDiv.innerHTML = `
                <h5>${item.properties["mlm:name"] || "No Name"}</h5>
                <p>${
                  item.properties.description || "No Description Available"
                }</p>
                <p><strong>Collection:</strong> ${item.collection_id}</p>
                <button class="btn btn-info view-details-btn" data-collection-id="${
                  item.collection_id
                }" data-item-id="${item.item_id}">View Details</button>
            `;

      resultsContainer.appendChild(itemDiv);
    });

    attachViewDetailsListeners();
  };

  // Attach click listeners to "View Items" buttons
  const attachViewItemsListeners = () => {
    console.log('Attaching event listeners to "View Items" buttons.');
    document.querySelectorAll(".view-items-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const collectionId = event.target.getAttribute("data-id");
        console.log(
          `"View Items" button clicked for collection ID: ${collectionId}`
        );
        loadItemsInCollection(collectionId);
      });
    });
  };

  // Debugging DOM element checks
  console.log("Search input element:", searchInput);
  console.log("Results container element:", resultsContainer);

  // Load all collections on page load
  console.log("Loading all collections on page load...");
  loadAllCollections();

  // Attach search functionality
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim();
    console.log("Search input changed:", searchTerm);
    if (!searchTerm) {
      loadAllCollections(); // shows all collections
    } else {
      fetchSearchResults(searchTerm); // shows search results
    }
  });

  const fetchSearchResults = async (keyword) => {
    try {
      const response = await fetch(
        `/searchbar?keyword=${encodeURIComponent(keyword)}`
      );
      if (!response.ok) throw new Error("Error fetching search results");
      const { collections, items } = await response.json();
      console.log("Search Results:", { collections, items });

      displaySearchResults(collections, items);
    } catch (error) {
      console.error("Error during search:", error);
      resultsContainer.innerHTML = "<p>Error fetching search results.</p>";
    }
  };

  // function to display search results
  const displaySearchResults = (collections, items) => {
    resultsContainer.innerHTML = "";

    if (collections.length === 0 && items.length === 0) {
      resultsContainer.innerHTML = "<p>No results found.</p>";
      return;
    }

    if (collections.length > 0) {
      const collectionHeader = document.createElement("h4");
      collectionHeader.textContent = "Collections";
      resultsContainer.appendChild(collectionHeader);

      displayCollections(collections);
    }

    if (items.length > 0) {
      const itemHeader = document.createElement("h4");
      itemHeader.textContent = "Items";
      resultsContainer.appendChild(itemHeader);

      displayItems(items);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("search");

  if (searchQuery) {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = searchQuery;

    fetchSearchResults(searchQuery);
  }
});

/**
 * Function to initialize the map
 * @param {*} mapId
 * @param {*} bbox
 * @returns
 */
const initializeMap = (mapId, bbox) => {
  if (!bbox || bbox.length !== 4) {
    console.warn(`Invalid BBOX for map ${mapId}:`, bbox);
    return null; // Return null if bbox is invalid
  }

  const [minX, minY, maxX, maxY] = bbox;

  // Initialize the Leaflet map
  const map = L.map(mapId).setView([(minY + maxY) / 2, (minX + maxX) / 2], 5);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add a rectangle for the BBOX
  const bounds = [
    [minY, minX],
    [maxY, maxX],
  ];
  L.rectangle(bounds, { color: "#3388ff", weight: 1 }).addTo(map);

  // Fit the map to the BBOX
  map.fitBounds(bounds);

  return map; // Return the map object
};

// Function to display models for geographic filter
const displayModels = (models, filters) => {
  resultsContainer.innerHTML = ""; // Clear previous content

  let filtersSummary = [];
  if (filters.geoFilter) {
    filtersSummary.push("Geographic Filter Applied");
    if (filters.bbox) {
      const [minX, minY, maxX, maxY] = filters.bbox;
      filtersSummary.push(
        `Bounding Box: [${minX.toFixed(2)}, ${minY.toFixed(2)}, ${maxX.toFixed(
          2
        )}, ${maxY.toFixed(2)}]`
      );
    }
  }
  if (filters.datetime) filtersSummary.push(`Time Range: ${filters.datetime}`);
  if (filtersSummary.length === 0) filtersSummary = "None";

  resultsContainer.innerHTML = `
        <div class="filtered-results-header">
            <h4>Filtered Models</h4>
            <p><strong>Filters used:</strong> ${filtersSummary.join(" | ")}</p>
            <p>Displaying <strong>${models.length}</strong> models.</p>
        </div>
        <div class="row" id="modelGrid"></div>
    `;

  const grid = document.getElementById("modelGrid");

  models.forEach((model, index) => {
    const overlap = model.properties.overlap_percentage
      ? parseFloat(model.properties.overlap_percentage).toFixed(2) + "%"
      : "No spatial filter applied."; // Fallback if overlap_percentage is null or undefined

    // Extract and format temporal coverage
    const startDatetime = model.properties?.start_datetime
      ? new Date(model.properties.start_datetime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
    const endDatetime = model.properties?.end_datetime
      ? new Date(model.properties.end_datetime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    const modelDiv = document.createElement("div");
    modelDiv.classList.add("model-item");
    modelDiv.innerHTML = `
            <h5>${model.properties["mlm:name"]}</h5>
            <p>${model.properties.description}</p>
            <p><strong>Collection:</strong> ${model.collection}</p>
            <p><strong>Temporal Coverage:</strong> ${startDatetime} - ${endDatetime}</p>
            <p><strong>Area covered by the model:</strong> ${overlap}</p>
            <p><strong>Legend:</strong> 
            <span style="color: orange;">●</span> Filtered Region 
            <span style="color: blue;">●</span> Model Region
        </p>
        
            <div id="map-${index}" style="height: 200px;"></div>
            <button class="btn btn-primary view-details-btn" 
                data-collection-id="${model.collection}" 
                data-item-id="${model.id}">
                View Details
            </button>
        `;
    grid.appendChild(modelDiv);

    // Initialize the map for this item's bbox
    const map = initializeMap(`map-${index}`, model.bbox);

    if (map && drawnGeometry) {
      // Ensure the map and drawnGeometry exist
      const filterLayer = L.geoJSON(drawnGeometry.toGeoJSON(), {
        style: { color: "#ff7800", weight: 2, fillOpacity: 0.2 },
      }).addTo(map);

      map.fitBounds(filterLayer.getBounds());
    }
  });

  attachViewDetailsListeners();
};
