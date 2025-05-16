# Dokumentation zur Passwortverschlüsselung

## Details zur Implementierung

### Technologie-Stack

Das Passwortverschlüsselungssystem verwendet die folgenden Technologien:

- **BCrypt** - Branchenüblicher Passwort-Hashing-Algorithmus
- **Salt** - Einzigartiger Zufallswert, der vor dem Hashing zu jedem Passwort hinzugefügt wird
- **Pepper** - Server-seitiges Geheimnis, das vor dem Hashing zu den Passwörtern hinzugefügt wird

### Wie funktioniert es?

#### 1. Passwort-Hashing-Prozess

Wenn sich ein Benutzer registriert oder sein Passwort ändert, läuft folgender Prozess ab:

1. Das Klartext-Passwort wird vom Benutzer empfangen
2. Ein serverseitiges Geheimnis ("pepper") wird an das Passwort angehängt
 ```java
 String pepperedPassword = password + pepper;
 ```
3. BCrypt erzeugt ein zufälliges Salz mit einem Arbeitsfaktor von 12
 ```java
 String salt = BCrypt.gensalt(12);
 ```
4. Das Passwort wird mit dem Salt mittels BCrypt
 ```java
 return BCrypt.hashpw(pepperedPassword, salt);
 ```
5. Der resultierende Hash wird in der Datenbank gespeichert

#### 2. Prozess der Passwortüberprüfung

Wenn ein Benutzer versucht, sich anzumelden:

1. Der Benutzer gibt sein Passwort ein
2. Das gleiche Pepper wird an das angegebene Passwort angehängt
 ```java
 String pepperedPassword = password + pepper;
 ```
3. BCrypt vergleicht das Passwort mit dem gespeicherten Hash
 ```java
 return BCrypt.checkpw(pepperedPassword, hashedPassword);
 ```
4. Wenn der Vergleich erfolgreich ist, wird das Passwort verifiziert

## Sicherheitsüberlegungen

### Warum BCrypt?

BCrypt wurde aus mehreren wichtigen Sicherheitsgründen gewählt:

1. **Slow by Design**: BCrypt ist bewusst rechenintensiv, so dass Brute-Force-Angriffe unpraktisch sind.
2. **Anpassungsfähiger Arbeitsfaktor**: Der Arbeitsfaktor (12) kann mit steigender Rechenleistung erhöht werden.
3. **Eingebautes Salz**: BCrypt übernimmt automatisch die Erzeugung und Speicherung von Salts im Hash.
4. **Industriestandard**: BCrypt ist weithin anerkannt und vertrauenswürdig für Passwort-Hashing

### Warum Salt?

Salt bietet diese Sicherheitsvorteile:

1. **Verhindert Rainbow Table Angriffe**: Jeder Passwort-Hash ist eindeutig, selbst bei identischen Passwörtern
2. **Einzigartig pro Benutzer**: Jeder Benutzer hat ein anderes Salt, so dass identische Passwörter unterschiedliche Hashes haben
3. **Gespeichert mit Hash**: Das Salz wird als Teil des BCrypt-Hash-Formats gespeichert.

### Warum Pepper?

Das Hinzufügen eines Peppers bietet zusätzliche Sicherheit:

1. **Server-seitiges Geheimnis**: Wird nicht zusammen mit dem Passwort-Hash in der Datenbank gespeichert
2. **Zusätzliche Schicht**: Selbst wenn die Datenbank kompromittiert ist, benötigen Angreifer den Pfeffer
3. **Schutz auf Anwendungsebene**: Schützt vor Verletzungen, die nur die Datenbank betreffen.

## Implementierte bewährte Praktiken

1. **Keine Passwortspeicherung**: Passwörter im Klartext werden niemals gespeichert.
2. **Einfaches Hashing**: Passwörter können nicht entschlüsselt, sondern nur verifiziert werden
3. **Rechenaufwendig**: Der Arbeitsfaktor von 12 macht Brute-Force-Angriffe unpraktisch
4. **Mehrere Sicherheitsschichten**: Die Kombination von Salt und Pepper bietet eine Verteidigung in der Tiefe
5. **Keine eigene Kryptographie**: Verlässt sich auf bewährte, von Experten geprüfte Algorithmen
