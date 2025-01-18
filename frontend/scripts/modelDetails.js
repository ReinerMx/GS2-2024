document.addEventListener("DOMContentLoaded", async () => {
  const modelDetailsContainer = document.getElementById(
    "modelDetailsContainer"
  );
  const temporalChartContainer = document.getElementById("temporalChart");
  const modelNameElement = document.getElementById("modelName");
  const userDescriptionElement = document.getElementById("userDescription");
  const linksContainer = document.getElementById("linksContainer");

  if (
    !modelDetailsContainer ||
    !temporalChartContainer ||
    !modelNameElement ||
    !userDescriptionElement
  ) {
    console.error("Error: Required elements not found");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("item_id");
  const collectionId = urlParams.get("collection_id");

  if (!itemId || !collectionId) {
    modelDetailsContainer.innerHTML =
      '<p class="error-text">Error: Collection ID or Item ID is missing in the URL.</p>';
    return;
  }

  const loadModelDetails = async (collectionId, itemId) => {
    try {
      const response = await fetch(
        `/collections/${collectionId}/items/${itemId}`
      );
      if (!response.ok) throw new Error("Failed to fetch model details");
      const model = await response.json();

      // Populate Model Name and User Description
      modelNameElement.textContent =
        model.properties["mlm:name"];

      // Add uploader's username to the top section
      const uploaderElement = document.createElement("p");
      uploaderElement.className = "uploader-info";
      uploaderElement.innerHTML = `<strong>Uploaded by:</strong> ${
        model.uploader || "Unknown"
      }`;
      modelNameElement.parentElement.insertBefore(
        uploaderElement,
        modelNameElement.nextSibling
      );

      userDescriptionElement.innerHTML = model.user_description
        ? marked.parse(model.user_description)
        : "<em>No description provided.</em>";

      // Render Temporal Coverage Timeline
      if (model.properties.start_datetime && model.properties.end_datetime) {
        const startDate = new Date(model.properties.start_datetime);
        const endDate = new Date(model.properties.end_datetime);
        const timelineContainer =
          temporalChartContainer.querySelector(".temporal-timeline");
        if (timelineContainer) {
          timelineContainer.innerHTML = `
                        <span class="start-date">${startDate.toLocaleDateString()}</span>
                        <span class="timeline-line"></span>
                        <span class="end-date">${endDate.toLocaleDateString()}</span>
                    `;
        }
      } else {
        const timelineContainer =
          temporalChartContainer.querySelector(".temporal-timeline");
        if (timelineContainer) {
          timelineContainer.innerHTML =
            '<p class="text-muted"><em>No temporal coverage data available.</em></p>';
        }
      }

      // Render STAC Extensions as Links
      const renderStacExtensions = (extensions) => {
        if (!extensions || extensions.length === 0)
          return "<p>No extensions available.</p>";
        return extensions
          .map(
            (ext) =>
              `<a href="${ext}" target="_blank" rel="noopener noreferrer">${ext}</a>`
          )
          .join(", ");
      };

      // Render Classification Classes with Color Boxes
      const renderClassificationClasses = (classes) => {
        if (!classes || classes.length === 0)
          return "<p>No classification data available.</p>";
        return `
                    <div class="classification-classes">
                        ${classes
                          .map(
                            (cls) => `
                            <div class="class-item">
                                <div class="color-box" data-color="#${
                                  cls.color_hint || "FFFFFF"
                                }"></div>
                                <p><strong>${cls.name}</strong> (Value: ${
                              cls.value
                            }, Color: #${cls.color_hint || "N/A"})</p>
                                <p>${
                                  cls.description || "No description available"
                                }</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `;
      };

      // Dynamically apply colors after rendering
      const applyColorBoxes = () => {
        document.querySelectorAll(".color-box").forEach((box) => {
          const color = box.getAttribute("data-color");
          if (color) {
            box.style.backgroundColor = color;
          }
        });
      };

      const inputsHTML =
        model.properties["mlm:input"]
          ?.map(
            (input) => `
                <div>
                    <h6><strong>Input:</strong> ${input.name}</h6>
                    <p><strong>Bands: </strong>${input.bands.join(", ")}</p>
                    <p><strong>Shape: </strong>${input.input.shape.join(
                      " × "
                    )}</p>
                    <p><strong>Data Type: </strong>${input.input.data_type}</p>
                    <p><strong>Dimensions Order: </strong>${input.input.dim_order.join(
                      " > "
                    )}</p>
                </div>
            `
          )
          .join("") || "<p>No input data available.</p>";

      const outputsHTML =
        model.properties["mlm:output"]
          ?.map(
            (output) => `
                <div>
                    <h6><strong>Output: </strong>${output.name}</h6>
                    <p><strong>Result Shape: </strong>${output.result.shape.join(
                      " × "
                    )}</p>
                    <p><strong>Data Type: </strong>${
                      output.result.data_type
                    }</p>
                    <p><strong>Dimensions Order: </strong>${output.result.dim_order.join(
                      " > "
                    )}</p>
                    <h6><strong>Classification:</strong></h6>
                    ${renderClassificationClasses(
                      output["classification:classes"]
                    )}
                </div>
            `
          )
          .join("") || "<p>No output data available.</p>";

      const renderHyperparameters = (hyperparameters) => {
        if (
          !hyperparameters ||
          typeof hyperparameters !== "object" ||
          Object.keys(hyperparameters).length === 0
        ) {
          return ""; // Skip rendering if hyperparameters are null, not an object, or empty
        }
        return `
                    <div class="hyperparameters-section">
                        <p><strong>Hyperparameters:</strong></p>
                        <ul>
                            ${Object.entries(hyperparameters)
                              .map(
                                ([key, value]) =>
                                  `<li><strong>${key}:</strong> ${value}</li>`
                              )
                              .join("")}
                        </ul>
                    </div>
                `;
      };

      const createDetailRow = (label, value) => {
        if (value == null || value === "N/A") return ""; // Skip rendering if value is null or 'N/A'
        return `<p><strong>${label}:</strong> ${value}</p>`;
      };

      modelDetailsContainer.innerHTML = `
                <div class="model-details-container">
                    <div class="text-section">
                        <h4>Overview</h4>
                        ${createDetailRow(
                          "Collection",
                          model.parentCollection?.title
                        )}
                        ${createDetailRow("STAC Version", model.stac_version)}
                        ${createDetailRow(
                          "STAC Extensions",
                          renderStacExtensions(model.stac_extensions)
                        )}
                        ${createDetailRow(
                          "Architecture",
                          model.properties["mlm:architecture"]
                        )}
                        ${createDetailRow(
                          "Tasks",
                          model.properties["mlm:tasks"]?.join(", ")
                        )}
                        ${createDetailRow(
                          "Framework",
                          `${model.properties["mlm:framework"] || ""} v${
                            model.properties["mlm:framework_version"] || ""
                          }`.trim()
                        )}
                        ${createDetailRow(
                          "Memory Size",
                          model.properties["mlm:memory_size"]
                        )}
                        ${createDetailRow(
                          "Total Parameters",
                          model.properties["mlm:total_parameters"]
                        )}
                        ${createDetailRow(
                          "Pretrained",
                          model.properties["mlm:pretrained"]
                            ? `Yes (Source: ${
                                model.properties["mlm:pretrained_source"] ||
                                "N/A"
                              })`
                            : null
                        )}
                        ${createDetailRow(
                          "Batch Size Suggestion",
                          model.properties["mlm:batch_size_suggestion"]
                        )}
                        ${createDetailRow(
                          "Accelerator",
                          model.properties["mlm:accelerator"]
                        )}
                        ${createDetailRow(
                          "Accelerator Constrained",
                          model.properties["mlm:accelerator_constrained"]
                            ? "Yes"
                            : "No"
                        )}
                        ${createDetailRow(
                          "Accelerator Summary",
                          model.properties["mlm:accelerator_summary"]
                        )}
                        ${createDetailRow(
                          "Accelerator Count",
                          model.properties["mlm:accelerator_count"]
                        )}
                        ${renderHyperparameters(
                          model.properties["mlm:hyperparameters"]
                        )}
                    </div>
                    <div class="input-section">
                        <h4>Input</h4>
                        ${inputsHTML}
                    </div>
                    <div class="output-section">
                        <h4>Output</h4>
                        ${outputsHTML}
                    </div>
                </div>
            `;

      applyColorBoxes();

      // Render Spatial Coverage (Map)
      const map = L.map("map").setView([0, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      if (model.geometry) {
        if (model.geometry.type === "Polygon") {
          const polygonCoords = model.geometry.coordinates[0].map((coord) => [
            coord[1],
            coord[0],
          ]);
          L.polygon(polygonCoords, { color: "blue" })
            .addTo(map)
            .bindTooltip("Spatial Coverage")
            .openTooltip();
          map.fitBounds(polygonCoords);
        } else if (model.geometry.type === "Point") {
          const [lon, lat] = model.geometry.coordinates;
          L.marker([lat, lon]).addTo(map).bindTooltip("Location").openTooltip();
          map.setView([lat, lon], 10);
        }
      }

      // Links Section
      if (model.assets) {
        const linksHTML = Object.keys(model.assets)
          .map((key) => {
            const asset = model.assets[key];
            return `
                            <div class="link-item">
                                <p><strong>${asset.title || key}:</strong> ${
              asset.description || ""
            }</p>
                                <p><strong>Type:</strong> ${
                                  asset.type || "Unknown"
                                }</p>
                                <a href="${asset.href}" target="_blank">${
              asset.href
            }</a>
                            </div>
                        `;
          })
          .join("");
        linksContainer.innerHTML = `
                    <h4>Assets</h4>
                    <div class="links-box">
                        ${linksHTML}
                    </div>
                `;
      } else {
        linksContainer.innerHTML = "<p>No links available.</p>";
      }
    } catch (error) {
      console.error("Error loading model details:", error);
      modelDetailsContainer.innerHTML =
        '<p class="error-text">Error loading model details.</p>';
    }
  };

  await loadModelDetails(collectionId, itemId);
});
