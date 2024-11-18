// Funktion für den Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Verhindert das Neuladen der Seite

    // Werte aus dem Formular auslesen
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Anfrage an den Backend-Login-Endpunkt senden
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Erfolgreicher Login
            alert('Login erfolgreich!');
            localStorage.setItem('token', result.token); // Speichere den Token
            window.location.href = 'account.html'; // Weiterleitung zur Account-Seite
        } else {
            // Fehlerbehandlung
            alert(result.message || 'Login fehlgeschlagen. Bitte erneut versuchen.');
        }
    } catch (error) {
        console.error('Fehler beim Login:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
});
