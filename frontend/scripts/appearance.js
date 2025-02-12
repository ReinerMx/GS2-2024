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

  // Data for local pages
  const pages = [
    { name: "Account", link: "account.html", aliases: ["profile", "dashboard"] },
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

  // Fetch suggestions from the server (models & users)
  const fetchServerSuggestions = async (query) => {
    if (!query.trim()) return { models: [], users: [] };
    try {
      const [modelResponse, userResponse] = await Promise.all([
        fetch(`/searchbar?keyword=${encodeURIComponent(query)}`), // Model search
        fetch(`/api/users/search?keyword=${encodeURIComponent(query)}`) // User search
      ]);

      if (!modelResponse.ok || !userResponse.ok) {
        throw new Error("Error fetching suggestions");
      }

      const models = await modelResponse.json();
      const users = await userResponse.json();

      return {
        models: models.suggestions || [],
        users: users.users || []
      };
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return { models: [], users: [] };
    }
  };

  // Render autocomplete suggestions, including local pages
  const renderSuggestions = ({ models, users }, pageSuggestions) => {
    autocompleteList.innerHTML = ""; // Clear previous suggestions

    // Local pages
    pageSuggestions.forEach((page) => {
      const pageItem = document.createElement("li");
      pageItem.textContent = page.name;
      pageItem.addEventListener("click", () => {
        window.location.href = page.link;
      });
      autocompleteList.appendChild(pageItem);
    });

    // Models
    models.forEach((model) => {
      const modelItem = document.createElement("li");
      modelItem.textContent = model.title || "Unnamed Model";
      modelItem.addEventListener("click", () => {
        window.location.href = `catalog.html?search=${encodeURIComponent(model.title)}`;
      });
      autocompleteList.appendChild(modelItem);
    });

    // Users
    users.forEach((user) => {
      const userItem = document.createElement("li");
      userItem.innerHTML = `@${user.username}`;
      userItem.addEventListener("click", () => {
        window.location.href = `/viewAccount.html?id=${user.id}`;
      });
      autocompleteList.appendChild(userItem);
    });

    autocompleteList.style.display = "block"; // Show the autocomplete list
  };


  // Handle user input in search bar
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

    // Fetch models and usernames from the server
    const serverSuggestions = await fetchServerSuggestions(query);

    // Combine results from local data, models, and users
    renderSuggestions(serverSuggestions, pageSuggestions);
  });

  // Hide autocomplete when clicking outside
  document.addEventListener("click", (event) => {
    if (!autocompleteList.contains(event.target) && event.target !== input) {
      autocompleteList.innerHTML = "";
    }
  });

  // Adjust position on resize
  window.addEventListener("resize", positionAutocomplete);
});