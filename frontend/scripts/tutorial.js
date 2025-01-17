////////////////////////////////////////////
// Q&A Toggle Animation
////////////////////////////////////////////
/**
 * Initializes FAQ toggle functionality.
 * Toggles the visibility of FAQ answers and ensures only one is open at a time.
 * Adds a visual effect when a question is clicked.
 */
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    /**
     * Handles the click event for an FAQ question.
     * Adds a clicked effect and toggles the corresponding answer's visibility.
     *
     * @param {MouseEvent} event - The click event triggered on a question.
     */
    question.addEventListener("click", (event) => {
      const isOpen = item.classList.contains("open");

      // Add the clicked effect
      question.classList.add("clicked");

      // Remove the clicked effect after 1 second
      setTimeout(() => {
        question.classList.remove("clicked");
      }, 1000);

      // Close all open FAQ items
      faqItems.forEach((i) => {
        i.classList.remove("open");
        i.querySelector(".faq-answer").style.maxHeight = null;
      });

      // Open the clicked item if it was not already open
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = `${answer.scrollHeight}px`; // Set max height to the scrollable height
      }
    });
  });
});

////////////////////////////////////////////
// EmailJS Initialization
////////////////////////////////////////////
/**
 * Initializes EmailJS with the public key.
 * @constant {string} PUBLIC_KEY - The public key for EmailJS initialization.
 */
emailjs.init("IVnkcCqedyLZPnBOn");

/**
 * Handles form submission for sending messages via EmailJS.
 * Prevents default form submission and sends the form data via EmailJS.
 */
document
  .getElementById("contact-form")
  .addEventListener("submit", function (event) {
    /**
     * @event submit
     * @param {Event} event - The submit event object.
     */
    event.preventDefault();

    const status = document.getElementById("form-status"); // Status message element
    const form = this; // Reference to the form element

    // Set the from_name field with the email address from the form
    document.getElementById("from_name").value =
      document.getElementById("from_email").value;

    /**
     * Sends form data using EmailJS.
     * @param {string} serviceID - The EmailJS service ID.
     * @param {string} templateID - The EmailJS template ID.
     * @param {HTMLFormElement} form - The form element containing the message data.
     */
    emailjs.sendForm("service_v29cusi", "template_yyg0558", form).then(
      /**
       * Handles successful message sending.
       */
      function () {
        status.textContent = "Message sent successfully!";
        status.style.color = "green";
        form.reset(); // Reset the form fields.
      },
      /**
       * Handles errors during message sending.
       * @param {Error} error - The error object returned by EmailJS.
       */
      function (error) {
        status.textContent = "Failed to send message. Please try again.";
        status.style.color = "red";
        console.error("EmailJS Error:", error);
      }
    );
  });

////////////////////////////////////////////
// Tutorial Navbar Tab Switching
////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  /**
   * Handles tab switching in the tutorial navigation.
   */
  const navLinks = document.querySelectorAll(".product-navbar nav ul li a");
  const tabContents = document.querySelectorAll(".content-section");

  /**
   * Hides all tab content sections.
   * Iterates through all tab content elements and hides them by setting their display to "none".
   */
  function hideAllTabs() {
    tabContents.forEach((content) => {
      content.style.display = "none";
    });
  }

  /**
   * Shows the content of the specified tab.
   * @param {string} tabId - The ID of the tab to show.
   */
  function showTabContent(tabId) {
    const contentToShow = document.querySelector(`#${tabId}`);
    if (contentToShow) {
      contentToShow.style.display = "block";
    }
  }

  // Activate the first tab and show its content by default.
  const defaultTab = document.querySelector(".product-navbar nav ul li a");
  if (defaultTab) {
    defaultTab.classList.add("active");
    const defaultTabId = defaultTab.getAttribute("id").replace("tab-", "");
    showTabContent(defaultTabId);
  }

  /**
   * Adds click event listeners to navigation links for tab switching.
   */
  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      /**
       * @event click
       * @param {Event} event - The click event object.
       */
      event.preventDefault();

      // Remove the "active" class from all links.
      navLinks.forEach((nav) => nav.classList.remove("active"));

      // Add the "active" class to the clicked link.
      this.classList.add("active");

      // Switch tab content.
      hideAllTabs();
      const targetTab = this.getAttribute("id").replace("tab-", "");
      showTabContent(targetTab);
    });
  });
});

////////////////////////////////////////////
// JSON Examples - Copy and Download
////////////////////////////////////////////
/**
 * Copies JSON content to the clipboard.
 * Retrieves the text content of a specified element by ID, trims it, and writes it to the clipboard.
 * @param {string} elementId - The ID of the element containing the JSON content to be copied.
 */
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).innerText.trim();
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Copied to clipboard!");
    })
    .catch((err) => {
      alert("Failed to copy: " + err);
    });
}

/**
 * Downloads JSON content as a file.
 * Retrieves and validates JSON content from a specified element by ID, formats it, and downloads it as a JSON file.
 * @param {string} filename - The name of the file to be downloaded (including the .json extension).
 * @param {string} elementId - The ID of the element containing the JSON content.
 */
function downloadJSON(filename, elementId) {
  const preElement = document.getElementById(elementId);
  if (!preElement) {
    alert("Element not found.");
    return;
  }

  // Extract the raw text content.
  const text = preElement.textContent.trim();

  try {
    // Validate and parse JSON content.
    const jsonData = JSON.parse(text);
    const formattedJSON = JSON.stringify(jsonData, null, 2); // Format JSON with indentation.

    // Create a Blob for the JSON data and trigger a download.
    const blob = new Blob([formattedJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    alert("Invalid JSON format. Please check your content.");
    console.error("JSON Parse Error:", error);
  }
}

////////////////////////////////////////////
// R/Python - Copy and Download
////////////////////////////////////////////

// Copy works with JSON Copy

 /**
   * Downloads the content of a specified element as a text file.
   * @param {string} elementId - The ID of the element containing the code to download.
   * @param {string} fileName - The name of the file to be downloaded.
   */
function downloadCode(elementId, fileName) {
  const code = document.getElementById(elementId).innerText;
  const blob = new Blob([code], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

////////////////////////////////////////////
// Smooth Scroll for "Contact Us" Link
////////////////////////////////////////////
/**
 * Adds a smooth scroll behavior to the "Contact Us" link.
 * When clicked, it activates the "Q&A" tab, deactivates other tabs,
 * and smoothly scrolls to the "More Questions" section.
 *
 * @event click - Triggered when the "Contact Us" link is clicked.
 * @param {Event} event - The click event, which is prevented to enable custom navigation.
 */
document
  .getElementById("contact-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default link behavior.

    // Activate the "Q&A" tab.
    document.getElementById("tab-q-and-a").classList.add("active");
    document.getElementById("q-and-a").style.display = "block";

    // Deactivate other tabs.
    document.querySelectorAll(".content-section").forEach((section) => {
      if (section.id !== "q-and-a") {
        section.style.display = "none";
      }
    });

    // Scroll to the "More Questions" section smoothly.
    const target = document.getElementById("more-questions");
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth" });
      }, 200); // Slight delay for better scroll experience.
    }
  });

////////////////////////////////////////////
// External Link Handling for Tabs
////////////////////////////////////////////
/**
 * Handles external links that point to specific tabs in the tutorials.
 * When clicked, it activates the corresponding tab and displays its content.
 *
 * @event click - Triggered when an external link pointing to a tab is clicked.
 * @param {Event} event - The click event, which is used to prevent default behavior.
 */
document.querySelectorAll('a[href^="tutorials.html#"]').forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default link behavior.

    const hash = this.href.split("#")[1]; // Extract the ID from the link.
    const targetTab = document.getElementById(hash); // Get the corresponding tab element.

    if (targetTab) {
      // Remove "active" class from all tabs and sections.
      document.querySelectorAll(".tutorial-nav-link").forEach((tab) => {
        tab.classList.remove("active");
      });

      document.querySelectorAll(".content-section").forEach((section) => {
        section.style.display = "none";
      });

      // Set the clicked tab and its corresponding section to "active".
      targetTab.classList.add("active");
      const targetSection = document.getElementById(hash.replace("tab-", ""));
      if (targetSection) {
        targetSection.style.display = "block";
      }
    }
  });
});

////////////////////////////////////////////
// Responsive Tutorial Navigation (collapsible)
////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".product-navbar nav ul li a");
  const tabContents = document.querySelectorAll(".content-section");

  /**
   * Hides all tab contents by setting their display to "none".
   */
  function hideAllTabs() {
    tabContents.forEach((content) => {
      content.style.display = "none";
    });
  }

  /**
   * Displays the specified tab content by ID.
   *
   * @param {string} tabId - The ID of the tab content to display.
   */
  function showTab(tabId) {
    const tabContent = document.querySelector(`#${tabId}`);
    if (tabContent) tabContent.style.display = "block";
  }

  /**
   * Handles navigation link clicks to switch between tabs.
   */
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default link behavior.

      const tabId = link.getAttribute("href").replace("#", ""); // Extract the tab ID.

      // Remove "active" class from all links.
      navLinks.forEach((nav) => nav.classList.remove("active"));

      // Set the clicked link as active.
      link.classList.add("active");

      // Hide all tab contents and show the selected one.
      hideAllTabs();
      showTab(tabId);
    });
  });

  /**
   * Activates the first tab by default on page load.
   */
  if (navLinks.length > 0) {
    navLinks[0].classList.add("active");
    showTab(navLinks[0].getAttribute("href").replace("#", ""));
  }
});
