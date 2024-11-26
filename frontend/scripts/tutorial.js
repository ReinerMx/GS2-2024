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
