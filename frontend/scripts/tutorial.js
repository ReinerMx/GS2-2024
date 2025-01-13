////////////////////////////////////////////
// Q&A Toggle Animation
////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Toggles the FAQ answers when clicking on questions.
   */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all open FAQ items.
      faqItems.forEach((i) => {
        i.classList.remove("open");
        i.querySelector(".faq-answer").style.maxHeight = null;
      });

      // Open the clicked item if it was not already open.
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px"; // Set max height to the scrollable height.
      }
    });
  });
});

////////////////////////////////////////////
// EmailJS Initialization
////////////////////////////////////////////

/**
 * Initializes EmailJS with the public key.
 */
emailjs.init("IVnkcCqedyLZPnBOn"); // Replace "IVnkcCqedyLZPnBOn" with your actual public key.

/**
 * Handles form submission for sending messages via EmailJS.
 */
document.getElementById("contact-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevents the default form submission behavior.

  const status = document.getElementById("form-status"); // Status message element.
  const form = this; // Reference to the form element.

  // Set the from_name field with the email address from the form.
  document.getElementById("from_name").value = document.getElementById("from_email").value;

  // Send the form data using EmailJS.
  emailjs
    .sendForm("service_v29cusi", "template_yyg0558", form) // Replace "service_v29cusi" and "template_yyg0558" with your actual service and template IDs.
    .then(
      function () {
        status.textContent = "Message sent successfully!";
        status.style.color = "green";
        form.reset(); // Reset the form fields.
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
////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  /**
   * Handles tab switching in the tutorial navigation.
   */
  const navLinks = document.querySelectorAll(".product-navbar nav ul li a");
  const tabContents = document.querySelectorAll(".content-section");

  /**
   * Hides all tab content sections.
   */
  function hideAllTabs() {
    tabContents.forEach((content) => {
      content.style.display = "none"; // Hide all tab contents.
    });
  }

  /**
   * Shows the content of the specified tab.
   * @param {string} tabId - The ID of the tab to show.
   */
  function showTabContent(tabId) {
    const contentToShow = document.querySelector(`#${tabId}`);
    if (contentToShow) {
      contentToShow.style.display = "block"; // Display the requested tab content.
    }
  }

  // Activate the first tab and show its content by default.
  const defaultTab = document.querySelector(".product-navbar nav ul li a");
  if (defaultTab) {
    defaultTab.classList.add("active");
    const defaultTabId = defaultTab.getAttribute("id").replace("tab-", "");
    showTabContent(defaultTabId);
  }

  // Add click event listeners to the navigation links.
  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default anchor behavior.

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
 * @param {string} elementId - The ID of the element containing the JSON content.
 */
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).innerText.trim();
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  }).catch(err => {
    alert("Failed to copy: " + err);
  });
}

/**
 * Downloads JSON content as a file.
 * @param {string} filename - The name of the file to be downloaded.
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
// Smooth Scroll for "Contact Us" Link
////////////////////////////////////////////

document.getElementById("contact-link").addEventListener("click", function (event) {
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

document.querySelectorAll('a[href^="tutorials.html#"]').forEach((link) => {
  link.addEventListener("click", function (event) {
    const hash = this.href.split("#")[1]; // Extract the ID from the link.
    const targetTab = document.getElementById(hash);

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
// Scroll to JSON Example Section
////////////////////////////////////////////

document.getElementById("scroll-to-json").addEventListener("click", function (e) {
  e.preventDefault(); // Prevent default anchor behavior.
  const target = document.getElementById("json-template");
  if (target) {
    target.scrollIntoView({ behavior: "smooth" }); // Smooth scroll to the element.
  }
});
