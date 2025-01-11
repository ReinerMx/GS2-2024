////////////////////////////////////////////
// Q&A Toggle Animation
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
// EmailJS initialisieren
emailjs.init("IVnkcCqedyLZPnBOn"); // Ersetze "IVnkcCqedyLZPnBOn" mit deinem Public Key

// Formular-Handler
document.getElementById("contact-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Verhindert Standardverhalten des Formulars (Seiten-Reload)

  const status = document.getElementById("form-status"); // Statusnachricht
  const form = this; // Das aktuelle Formular

  // Setze das Feld from_name mit der E-Mail-Adresse aus dem Formular
  document.getElementById("from_name").value = document.getElementById("from_email").value;

  // EmailJS sendet die Daten
  emailjs
    .sendForm("service_v29cusi", "template_yyg0558", form) // Ersetze service_xxx123 und template_abc456
    .then(
      function () {
        status.textContent = "Message sent successfully!";
        status.style.color = "green";
        form.reset(); // Formular zurücksetzen
      },
      function (error) {
        status.textContent = "Failed to send message. Please try again.";
        status.style.color = "red";
        console.error("EmailJS Error:", error);
      }
    );
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

////////////////////////////////////////////
/////////////////TEST///////////////////////
////////////////////////////////////////////
/*
console.error = function () {}; // Nichts tun: Unterdrückt alle Fehler
console.log = function () {};
console.warn = function () {}; 
 */

// const originalConsoleError = console.error;

/*
console.error = function (...args) {
  if (args[0]?.includes("runtime.lastError")) {
    // Ignoriere nur Fehlermeldungen mit "runtime.lastError"
    return;
  }
  //originalConsoleError.apply(console, args); // Alle anderen Fehler weiterhin ausgeben
};

Object.defineProperty(window, "console", {
  value: {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {},
  },
  configurable: false,
  writable: false,
});
*/

//////////////////////////////////////////////////////////////////
/////////////////////SCROLL///////////////////////////////////////
//////////////////////////////////////////////////////////////////
// Füge einen Event-Listener nur für den "Contact Us"-Link hinzu
document.getElementById("contact-link").addEventListener("click", function (event) {
  event.preventDefault(); // Verhindert das Standardverhalten des Links

  // Aktiviere den Tab "leasing"
  document.getElementById("tab-leasing").classList.add("active");
  document.getElementById("leasing").style.display = "block";

  // Deaktiviere andere Tabs
  document.querySelectorAll(".content-section").forEach((section) => {
    if (section.id !== "leasing") {
      section.style.display = "none";
    }
  });

  // Scroll zur gewünschten Stelle
  const target = document.getElementById("more-questions");
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth" });
    }, 200); // Leichte Verzögerung für ein besseres Scroll-Erlebnis
  }
});

// Event Listener für externe Links
document.querySelectorAll('a[href^="tutorials.html#"]').forEach((link) => {
  link.addEventListener("click", function (event) {
    const hash = this.href.split("#")[1]; // Extrahiere die ID aus dem Link
    const targetTab = document.getElementById(hash);

    if (targetTab) {
      // Entferne "active" von allen Tabs und Sektionen
      document.querySelectorAll(".tutorial-nav-link").forEach((tab) => {
        tab.classList.remove("active");
      });

      document.querySelectorAll(".content-section").forEach((section) => {
        section.style.display = "none";
      });

      // Setze den aktuellen Tab und die zugehörige Sektion auf "active"
      targetTab.classList.add("active");
      const targetSection = document.getElementById(hash.replace("tab-", ""));
      if (targetSection) {
        targetSection.style.display = "block";
      }
    }
  });
});
