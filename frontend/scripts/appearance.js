//////////////////////////////////////////////////////
///////////////////////DARMODE////////////////////////
//////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
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

function enableDarkMode(body, nav, footer) {
  body.classList.add("dark-mode");
  if (nav) {
    nav.classList.remove("navbar-light", "bg-light");
    nav.classList.add("navbar-dark", "bg-dark");
  }
  if (footer) footer.classList.add("dark-mode");
}

function disableDarkMode(body, nav, footer) {
  body.classList.remove("dark-mode");
  if (nav) {
    nav.classList.remove("navbar-dark", "bg-dark");
    nav.classList.add("navbar-light", "bg-light");
  }
  if (footer) footer.classList.remove("dark-mode");
}

//////////////////////////////////////////////////////
///////////////////////SEARCHBAR////////////////////////
//////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  // Autocomplete logic
  const input = document.getElementById("search-bar");
  const autocompleteList = document.getElementById("autocomplete-list");

  const pages = [
    {
      name: "Account",
      link: "account.html",
      aliases: [
        "profile",
        "user",
        "account settings",
        "my account",
        "dashboard",
      ],
    },
    {
      name: "Catalog",
      link: "catalog.html",
      aliases: ["models", "search", "items", "products", "store"],
    },
    {
      name: "Impressum",
      link: "impressum.html",
      aliases: ["legal", "contact", "about", "terms", "privacy policy"],
    },
    {
      name: "Home",
      link: "index.html",
      aliases: ["main", "welcome", "dashboard", "homepage", "start"],
    },
    {
      name: "Login",
      link: "login.html",
      aliases: ["signin", "access", "sign in", "log in", "authentication"],
    },
    {
      name: "Model Details",
      link: "modelDetails.html",
      aliases: [
        "details",
        "info",
        "model info",
        "specifications",
        "view model",
      ],
    },
    {
      name: "Register",
      link: "register.html",
      aliases: ["signup", "join", "create account", "sign up", "new account"],
    },
    {
      name: "Tutorials",
      link: "tutorials.html",
      aliases: ["guides", "help", "how-to", "manuals", "instructions"],
    },
    {
      name: "Upload",
      link: "upload.html",
      aliases: ["add", "new", "submit", "post", "upload model"],
    },
  ];

  if (input) {
    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();
      autocompleteList.innerHTML = "";

      if (query) {
        const suggestions = pages.filter(
          (page) =>
            page.name.toLowerCase().includes(query) ||
            page.aliases.some((alias) => alias.includes(query))
        );

        suggestions.forEach((page) => {
          const listItem = document.createElement("li");
          listItem.textContent = page.name;
          listItem.addEventListener("click", () => {
            window.location.href = page.link;
          });
          autocompleteList.appendChild(listItem);
        });
      }
    });

    // Navigate on Enter key
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const query = input.value.trim().toLowerCase();
        const match = pages.find(
          (page) =>
            page.name.toLowerCase() === query ||
            page.aliases.some((alias) => alias === query)
        );
        if (match) {
          window.location.href = match.link;
        } else {
          alert("Page not found!");
        }
      }
    });
  }
});
