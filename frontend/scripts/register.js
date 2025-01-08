document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Verhindert das Standard-Formularverhalten

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5555/api/users/register", { // API-Endpunkt für Registrierung
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON-Header für POST-Daten
      },
      body: JSON.stringify({ username, email, password }), // Daten im JSON-Format
    });

    const result = await response.json(); // Antwort verarbeiten
    if (response.ok) {
      alert(result.message || "Registrierung erfolgreich!");
      window.location.href = "login.html"; // Weiterleitung zur Login-Seite
    } else {
      alert(result.message || "Fehler bei der Registrierung. Bitte versuchen Sie es erneut.");
    }
  } catch (error) {
    console.error(error); // Fehler in der Konsole anzeigen
    alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
  }
});
