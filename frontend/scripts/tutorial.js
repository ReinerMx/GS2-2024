// FAQ Toggle Animation
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Schließe alle offenen FAQ-Einträge
      faqItems.forEach((i) => {
        i.classList.remove("open");
        i.querySelector(".faq-answer").style.maxHeight = null;
      });

      // Öffne den aktuellen Eintrag, falls er nicht bereits geöffnet ist
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px"; // Setze die maximale Höhe auf den Inhalt
      }
    });
  });
});

// Tutorial Navbar Tab Switching
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
