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
