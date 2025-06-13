# Cloudflare Turnstile Implementierung

## Übersicht

Cloudflare Turnstile ist ein CAPTCHA-Ersatz zur Abwehr von Bot-Angriffen. Es bietet eine bessere Benutzererfahrung ohne Bilderrätsel oder Texteingaben.

## Funktionsweise

Turnstile unterscheidet automatisch zwischen echten Benutzern und Bots durch Analyse des Benutzerverhaltens, ohne dass der Nutzer aktiv Aufgaben lösen muss.

## Implementierung im Projekt

### Backend-Implementierung

Die Backend-Implementierung besteht aus folgenden Komponenten:

#### TurnstileService

Der `TurnstileService` ist verantwortlich für die Überprüfung der Turnstile-Tokens, die vom Frontend gesendet werden:

```java
@Service
public class TurnstileService {
    private static final String VERIFICATION_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    
    @Value("${turnstile.secret.key}")
    private String secretKey;
    
    public boolean verifyToken(String token, String remoteIp) {
        // Überprüft das Token durch Anfrage an die Cloudflare API
    }
}
```

Der Service sendet eine Anfrage an die Cloudflare-API mit dem Secret Key, Token und optional der IP-Adresse.

#### Datenmodelle

Zwei Hauptklassen:

1. `TurnstileVerificationRequest` mit Secret Key, Token und IP-Adresse
2. `TurnstileVerificationResponse` mit Erfolgsindikator und eventuellen Fehlercodes

#### Integration in Controller

Turnstile-Überprüfungen in `UserController` und `PasswordResetController`

Beispiel aus dem `UserController`:

```java
// Überprüfe Turnstile-Token
boolean turnstileVerified = turnstileService.verifyToken(loginRequest.getTurnstileToken(), remoteIp);

if (!turnstileVerified) {
    logger.warn("Login fehlgeschlagen: Ungültige Turnstile-Überprüfung");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
        new ErrorResponse("Sicherheitsüberprüfung fehlgeschlagen. Bitte versuchen Sie es erneut.")
    );
}
```

### Frontend-Implementierung

#### TurnstileWidget-Komponente

Die `TurnstileWidget`-Komponente ist eine React-Komponente, die das Turnstile-Widget rendert und die Token-Generierung verwaltet:

```javascript
function TurnstileWidget({ onVerify }) {
    // Rendert das Turnstile-Widget und ruft onVerify mit dem generierten Token auf
}
```

Die Komponente lädt das Turnstile-Skript, rendert das Widget und verwaltet die Token-Generierung.

#### Integration in Formularen

Implementiert in Login, Registrierung und Passwort-Reset-Formularen.

Beispiel aus dem Login-Formular:

```jsx
// Turnstile-Token-Status
const [turnstileToken, setTurnstileToken] = useState('');

// Formularvalidierung
if (!turnstileToken) {
    setError("Bitte schließen Sie die Sicherheitsüberprüfung ab.");
    return;
}

// Rendering des Widgets
<TurnstileWidget onVerify={setTurnstileToken} />

// Button deaktivieren, wenn kein Token vorhanden ist
<button type="submit" disabled={isLoading || !turnstileToken}>
    Anmelden
</button>
```

## Konfiguration

### Backend-Konfiguration

Die Konfiguration des Turnstile-Secret-Keys erfolgt in der `application.properties`-Datei:

```properties
# Cloudflare Turnstile Konfiguration
turnstile.secret.key=0x4AAAAAABdh8ynOZL789nuISMP2jV7dKPg
```

### Frontend-Konfiguration

Die Konfiguration des Turnstile-Site-Keys erfolgt in der `turnstile.js`-Datei:

```javascript
// Cloudflare Turnstile Konfiguration
export const TURNSTILE_SITE_KEY = "0x4AAAAAABdh85RugLadfqr1";
```

## Sicherheitsaspekte

- Secret-Key nur serverseitig verwenden
- Überprüfung immer auf dem Server durchführen
- Alle sicherheitsrelevanten Aktionen durch Turnstile schützen

## Vorteile

- Bessere Benutzererfahrung ohne Rätsel
- Verbesserte Barrierefreiheit
- Datenschutzfreundlicher als herkömmliche CAPTCHAs
- Effektiver Schutz gegen Bots
