document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Verhindert das Standard-Formularverhalten

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('/api/users/register', { // Verwende die relative Route
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON-Header für POST-Daten
      },
      body: JSON.stringify({ username, email, password }), // Sende die Formulardaten als JSON
    });

    const result = await response.json(); // Verarbeite die Antwort
    if (response.ok) {
      alert(result.message || "Registrierung erfolgreich!");
      window.location.href = "login.html"; // Weiterleitung zur Login-Seite
    } else {
      alert(result.message || "Fehler bei der Registrierung. Bitte versuchen Sie es erneut.");
    }
  } catch (error) {
    console.error(error); // Zeige Fehler in der Konsole
    alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
  }
});
