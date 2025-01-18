//////////////////////////////////////////////////////
///////////////////////DARKMODE////////////////////////
//////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Toggles dark mode based on user preference stored in localStorage or toggle state.
   * @event DOMContentLoaded - Ensures the script runs after the DOM is fully loaded.
   */
  const toggle = document.getElementById("appearanceToggle");
  const body = document.body;
  const nav = document.querySelector("nav");
  const footer = document.querySelector("footer");

  // Load dark mode preference from localStorage
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    enableDarkMode(body, nav, footer);
    toggle.checked = true; // Ensure the toggle is in the correct position
  }

  // Toggle dark mode on checkbox change
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      enableDarkMode(body, nav, footer);
      localStorage.setItem("darkMode", "true");
    } else {
      disableDarkMode(body, nav, footer);
      localStorage.setItem("darkMode", "false");
    }
  });
});

/**
 * Enables dark mode by adding relevant CSS classes to elements.
 * @param {HTMLElement} body - The body element of the page.
 * @param {HTMLElement} nav - The navigation element.
 * @param {HTMLElement} footer - The footer element.
 */
function enableDarkMode(body, nav, footer) {
  body.classList.add("dark-mode");

  document
    .querySelectorAll(
      "h1, h2, h3, p, .content-section, .faq-grid, .grid-item, .license-section, .upload-title, .stac-details, .example-card, .bg-light, .editor-toolbar"
    )
    .forEach((el) => {
      el.classList.add("dark-mode");
    });

  if (nav) {
    nav.classList.remove("navbar-light", "bg-light");
    nav.classList.add("navbar-dark", "bg-dark");
  }

  if (footer) footer.classList.add("dark-mode");
}

/**
 * Disables dark mode by removing relevant CSS classes from elements.
 * @param {HTMLElement} body - The body element of the page.
 * @param {HTMLElement} nav - The navigation element.
 * @param {HTMLElement} footer - The footer element.
 */
function disableDarkMode(body, nav, footer) {
  body.classList.remove("dark-mode");

  document
    .querySelectorAll(
      "h1, h2, h3, p, .content-section, .faq-grid, .grid-item, .license-section, .upload-title, .stac-details, .example-card, .bg-light, .editor-toolbar"
    )
    .forEach((el) => {
      el.classList.remove("dark-mode");
    });

  if (nav) {
    nav.classList.remove("navbar-dark", "bg-dark");
    nav.classList.add("navbar-light", "bg-light");
  }

  if (footer) footer.classList.remove("dark-mode");
}

//////////////////////////////////////////////////////
///////////////////////SEARCHBAR///////////////////////
//////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-bar");
  const autocompleteList = document.getElementById("autocomplete-list");

  // Data for the first function (local pages)
  const pages = [
    {
      name: "Account",
      link: "account.html",
      aliases: ["profile", "dashboard"],
    },
    { name: "Catalog", link: "catalog.html", aliases: ["models", "store"] },
    { name: "Home", link: "index.html", aliases: ["main", "welcome"] },
    { name: "Tutorials", link: "tutorials.html", aliases: ["guides", "help"] },
    { name: "Login", link: "login.html", aliases: ["signin", "access"] },
    { name: "Register", link: "register.html", aliases: ["signup", "join"] },
  ];

  // Positions the autocomplete list relative to the input field
  const positionAutocomplete = () => {
    const rect = input.getBoundingClientRect();
    autocompleteList.style.position = "absolute";
    autocompleteList.style.top = `${rect.bottom + window.scrollY}px`;
    autocompleteList.style.left = `${rect.left + window.scrollX}px`;
    autocompleteList.style.width = `${rect.width}px`;
  };

  // Function to fetch suggestions from the server
  const fetchServerSuggestions = async (query) => {
    if (!query.trim()) return [];
    try {
      const response = await fetch(
        `/searchbar?keyword=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Error fetching server suggestions");
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error("Error fetching server suggestions:", error);
      return [];
    }
  };

  // Function to render autocomplete suggestions
  const renderSuggestions = (suggestions) => {
    autocompleteList.innerHTML = ""; // Clear previous suggestions
    suggestions.forEach((suggestion) => {
      const listItem = document.createElement("li");
      listItem.textContent = suggestion.name || suggestion.title || "Unnamed";

      listItem.addEventListener("click", () => {
        if (suggestion.link) {
          // Local pages: Navigate directly to the specific page
          window.location.href = suggestion.link;
        } else if (suggestion.title) {
          // Server data: Redirect to the catalog page with query parameters
          window.location.href = `catalog.html?search=${encodeURIComponent(
            suggestion.title
          )}`;
        }
        autocompleteList.innerHTML = ""; // Clear the autocomplete list
      });

      autocompleteList.appendChild(listItem);
    });

    autocompleteList.style.display = "block"; // Show the autocomplete list
  };

  if (!input || !autocompleteList) {
    console.warn("Search input (search-bar) or autocomplete list not found.");
    return;
  }

  // Event: Handle user input
  input.addEventListener("input", async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      autocompleteList.innerHTML = "";
      return;
    }

    // Filter local page data based on query
    const pageSuggestions = pages.filter(
      (page) =>
        page.name.toLowerCase().includes(query) ||
        page.aliases.some((alias) => alias.includes(query))
    );

    // Fetch suggestions from the server
    const serverSuggestions = await fetchServerSuggestions(query);

    // Combine results from local data and server
    const combinedSuggestions = [
      ...pageSuggestions,
      ...serverSuggestions.map((s) => ({ name: s.title || "Unnamed Item" })),
    ];

    renderSuggestions(combinedSuggestions);
  });

  // Hide autocomplete when clicking outside the input field or the suggestion list
  document.addEventListener("click", (event) => {
    if (!autocompleteList.contains(event.target) && event.target !== input) {
      autocompleteList.innerHTML = "";
    }
  });

  // Reposition autocomplete list on window resize
  window.addEventListener("resize", positionAutocomplete);
});