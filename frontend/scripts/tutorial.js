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

////////////////////////////////////////////
// Tutorial Navbar Tab Switching
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".product-navbar nav ul li a");
  const tabContents = document.querySelectorAll(".content-section");

  // Funktion, um alle Tab-Inhalte auszublenden
  function hideAllTabs() {
    tabContents.forEach((content) => {
      content.style.display = "none"; // Alle Inhalte verstecken
    });
  }

  // Funktion, um den entsprechenden Tab-Inhalt anzuzeigen
  function showTabContent(tabId) {
    const contentToShow = document.querySelector(`#${tabId}`);
    if (contentToShow) {
      contentToShow.style.display = "block"; // Gewünschten Inhalt anzeigen
    }
  }

  // Standardmäßig den ersten Tab aktivieren und seinen Inhalt anzeigen
  const defaultTab = document.querySelector(".product-navbar nav ul li a");
  if (defaultTab) {
    defaultTab.classList.add("active");
    const defaultTabId = defaultTab.getAttribute("id").replace("tab-", "");
    showTabContent(defaultTabId);
  }

  // Ereignis-Listener für Klicks auf die Navigationslinks
  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // Verhindert das Standardverhalten des Links

      // Entfernt die Klasse "active" von allen Links
      navLinks.forEach((nav) => nav.classList.remove("active"));

      // Fügt die Klasse "active" zum angeklickten Link hinzu
      this.classList.add("active");

      // Tab-Inhalte umschalten
      hideAllTabs();
      const targetTab = this.getAttribute("id").replace("tab-", "");
      showTabContent(targetTab);
    });
  });
});
