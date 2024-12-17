document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".product-navbar nav ul li a");

  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Entfernt die Klasse "active" von allen Links
      navLinks.forEach((nav) => nav.classList.remove("active"));

      // Fügt die Klasse "active" zum angeklickten Link hinzu
      this.classList.add("active");
    });
  });

  // Standardmäßig den ersten Tab aktivieren
  document.querySelector(".product-navbar nav ul li a").classList.add("active");
});
