document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Verhindert das Standard-Formularverhalten

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('/api/users/login', { // Verwende die relative Route
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON-Header für POST-Daten
      },
      body: JSON.stringify({ email, password }), // Sende die Formulardaten als JSON
    });

    const result = await response.json(); // Verarbeite die Antwort
    if (response.ok) {
      localStorage.setItem("token", result.token); // Speichere das JWT-Token im Local Storage
      alert(result.message || "Login erfolgreich!");
      window.location.href = "account.html"; // Weiterleitung zur Account-Seite
    } else {
      alert(result.message || "Fehler beim Login. Bitte versuchen Sie es erneut.");
    }
  } catch (error) {
    console.error(error); // Zeige Fehler in der Konsole
    alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
  }
});
