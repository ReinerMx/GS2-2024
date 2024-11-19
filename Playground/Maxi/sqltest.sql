-- Erstellt eine Datenbank für die Anwendung (falls die Datenbank noch nicht existiert)
CREATE DATABASE webapp_db;

-- Nutzt die eben erstellte Datenbank
USE webapp_db;

-- 1. Erstellt eine Tabelle "users" für Benutzerinformationen
CREATE TABLE
    users (
        user_id INT AUTO_INCREMENT PRIMARY KEY, -- Primärschlüssel: Eindeutige Benutzer-ID, die automatisch hochgezählt wird
        username VARCHAR(50) NOT NULL UNIQUE, -- Benutzername, max. 50 Zeichen, muss einzigartig sein
        email VARCHAR(100) NOT NULL UNIQUE, -- E-Mail, max. 100 Zeichen, muss einzigartig sein
        password_hash VARCHAR(255) NOT NULL, -- Passwort-Hash, max. 255 Zeichen
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Erstellungsdatum, Standardwert ist die aktuelle Zeit
    );

-- 2. Erstellt eine Tabelle "posts" für Beiträge, die Benutzer erstellen
CREATE TABLE
    posts (
        post_id INT AUTO_INCREMENT PRIMARY KEY, -- Primärschlüssel: Eindeutige Beitrags-ID
        user_id INT NOT NULL, -- Fremdschlüssel: ID des Benutzers, der den Beitrag erstellt hat
        title VARCHAR(100) NOT NULL, -- Titel des Beitrags, max. 100 Zeichen
        content TEXT NOT NULL, -- Inhalt des Beitrags
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Erstellungsdatum des Beitrags
        -- Fremdschlüssel-Einschränkung, die "user_id" in "posts" mit "user_id" in "users" verknüpft
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

-- 3. Erstellt eine Tabelle "comments" für Kommentare zu Beiträgen
CREATE TABLE
    comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY, -- Primärschlüssel: Eindeutige Kommentar-ID
        post_id INT NOT NULL, -- Fremdschlüssel: ID des zugehörigen Beitrags
        user_id INT NOT NULL, -- Fremdschlüssel: ID des Benutzers, der den Kommentar verfasst hat
        comment_text TEXT NOT NULL, -- Inhalt des Kommentars
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Erstellungsdatum des Kommentars
        -- Fremdschlüssel, der "post_id" in "comments" mit "post_id" in "posts" verknüpft
        FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
        -- Fremdschlüssel, der "user_id" in "comments" mit "user_id" in "users" verknüpft
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
    );

-- 4. Erstellt eine Tabelle "likes" für das Speichern von "Gefällt mir"-Angaben für Beiträge
CREATE TABLE
    likes (
        like_id INT AUTO_INCREMENT PRIMARY KEY, -- Primärschlüssel: Eindeutige "Gefällt mir"-ID
        post_id INT NOT NULL, -- Fremdschlüssel: ID des Beitrags, der geliked wurde
        user_id INT NOT NULL, -- Fremdschlüssel: ID des Benutzers, der den Beitrag geliked hat
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Datum des "Gefällt mir"-Klicks
        -- Fremdschlüssel, der "post_id" in "likes" mit "post_id" in "posts" verknüpft
        FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
        -- Fremdschlüssel, der "user_id" in "likes" mit "user_id" in "users" verknüpft
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        -- Setzt eine Kombination aus "post_id" und "user_id" als einzigartig, damit ein Benutzer einen Beitrag nur einmal liken kann
        UNIQUE (post_id, user_id)
    );

-- 5. Fügt Indexe für schnelleren Datenbankzugriff hinzu
CREATE INDEX idx_post_user ON posts (user_id);

-- Index für die "user_id" in der "posts"-Tabelle
CREATE INDEX idx_comment_post ON comments (post_id);

-- Index für die "post_id" in der "comments"-Tabelle
-- 6. Test-Daten für "users" einfügen
INSERT INTO
    users (username, email, password_hash)
VALUES
    (
        'MaxMuster',
        'max@example.com',
        'hashedpassword123'
    ),
    (
        'AnnaBeispiel',
        'anna@example.com',
        'hashedpassword456'
    );

-- 7. Test-Daten für "posts" einfügen
INSERT INTO
    posts (user_id, title, content)
VALUES
    (
        1,
        'Erster Beitrag',
        'Dies ist der Inhalt des ersten Beitrags.'
    ),
    (
        2,
        'Zweiter Beitrag',
        'Dies ist der Inhalt des zweiten Beitrags.'
    );

-- 8. Test-Daten für "comments" einfügen
INSERT INTO
    comments (post_id, user_id, comment_text)
VALUES
    (1, 2, 'Interessanter Beitrag!'),
    (2, 1, 'Danke für die Informationen!');

-- 9. Test-Daten für "likes" einfügen
INSERT INTO
    likes (post_id, user_id)
VALUES
    (1, 2),
    (2, 1);

-- Fertig! Alle Tabellen, Einschränkungen und Testdaten wurden erstellt.