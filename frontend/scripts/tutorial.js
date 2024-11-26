// Q&A accordion 
document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;

        // Toggle visibility
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
        } else {
            answer.style.display = 'block';
        }
    });
});
