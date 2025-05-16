# Secrets Encryption Dokumentation

## Details zur Implementierung

### Technologie-Stack

Das System zur Verschlüsselung von Geheimnissen verwendet die folgenden Technologien:

- **AES/GCM/NoPadding** - Advanced Encryption Standard mit Galois/Counter Mode
- **PBKDF2WithHmacSHA256** - Passwortbasierte Schlüsselableitungsfunktion
- **SecureRandom** - Kryptografisch starke Zufallszahlengenerierung
- **Base64** - Kodierung für Speicherung und Übertragung

### Wie funktioniert es?

#### 1. Prozess der Schlüsselgenerierung

Wenn ein Geheimnis verschlüsselt werden muss:

1. Ein eindeutiger Verschlüsselungsschlüssel wird aus dem Passwort des Benutzers mit PBKDF2
 ```java
 SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
 KeySpec spec = new PBEKeySpec(pepperedPassword. toCharArray(), salt, ITERATION_COUNT, KEY_LENGTH);
 SecretKey tmp = factory.generateSecret(spec);
 SecretKey key = new SecretKeySpec(tmp.getEncoded(), "AES");
 ```
2. Die Schlüsselableitung verwendet:
   - Ein zufälliges Salt (16 Bytes)
   - Ein festes Pepper, das dem Passwort hinzugefügt wird
   - 65'536 Iterationen (rechenintensiv)
   - 256-Bit-Schlüssellänge

#### 2. Verschlüsselungsprozess

Wenn ein Benutzer ein Secret erstellt oder aktualisiert:

1. Ein neuer Verschlüsselungscode wird wie oben beschrieben erzeugt
2. Ein zufälliger Initialisierungsvektor (IV) wird erzeugt (12 Bytes)
 ```java
 byte[] iv = new byte[IV_LENGTH_BYTE];
 secureRandom.nextBytes(iv);
 ```
3. Der Inhalt wird mit AES/GCM/NoPadding mit dem Schlüssel und IV
 verschlüsselt
 ```java
 Cipher cipher = Cipher.getInstance(ALGORITHM);
 cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));
 byte[] cipherText = cipher.doFinal(content.getBytes());
 ```
4. Die IV und der Ciphertext werden kombiniert und als Base64 kodiert
5. Der verschlüsselte Inhalt wird mit den Schlüsseldaten (Salt und Iterationen) gespeichert
 ```java
 return encryptedContent + SEPARATOR + keyData.formatForStorage();
 ```

#### 3. Entschlüsselungsprozess

Wenn ein Benutzer ein Secret abruft:

1. Die kombinierten Daten werden in verschlüsselten Inhalt und Schlüsseldaten aufgeteilt
2. Die Schlüsseldaten werden geparst, um das Salt und die Iterationen zu extrahieren
3. Der Verschlüsselungsschlüssel wird unter Verwendung des Benutzerkennworts und des gespeicherten Salzes/der gespeicherten Iterationen neu erstellt
 ```java
 SecretKey key = secretKeyService.recreateKey(password, encodedSalt, iterations);
 ```
4. Der Base64-Inhalt wird dekodiert und der IV wird extrahiert
5. Der Inhalt wird unter Verwendung von AES/GCM/NoPadding mit dem neu erstellten Schlüssel und IV entschlüsselt
 ```java
 Cipher cipher = Cipher.getInstance(ALGORITHM);
 cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));
 byte[] plainText = cipher.doFinal(cipherText);
 ```

## Sicherheitsüberlegungen

### Warum AES/GCM/NoPadding?

AES mit GCM-Modus wurde aus mehreren wichtigen Sicherheitsgründen gewählt:

1. **Authentifizierte Verschlüsselung**: GCM bietet sowohl Vertraulichkeit als auch Integrität/Authentizität
2. **Manipulationserkennung**: Jede Veränderung des Chiffriertextes wird bei der Entschlüsselung erkannt
3. **Industriestandard**: AES ist der am weitesten verbreitete und vertrauenswürdigste symmetrische Verschlüsselungsalgorithmus
4. **Leistung**: Der GCM-Modus ist effizient und ermöglicht eine parallele Verarbeitung
5. **No Padding Oracle**: NoPadding eliminiert Schwachstellen im Zusammenhang mit Padding

### Warum PBKDF2?

PBKDF2 bietet die folgenden Sicherheitsvorteile:

1. **Key Stretching**: Macht Brute-Force-Angriffe rechenaufwendig
2. **Konfigurierbare Iterationen**: 65'536 Iterationen machen Brute-Force-Angriffe unpraktisch
3. **Salz-Unterstützung**: Verhindert Vorberechnungsangriffe wie Rainbow Tables
4. **Standardalgorithmus**: Gut geprüft und weithin vertrauenswürdig

### Warum sollte man Schlüsseldaten mit verschlüsseltem Inhalt speichern?

Dieser Ansatz bietet:

1. **Per-Secret-Schlüssel**: Jedes Secret hat seinen eigenen, einzigartigen Verschlüsselungsschlüssel
2. **Schlüsselwiederherstellung**: Die zur Wiederherstellung des Schlüssels erforderlichen Daten werden aufbewahrt
3. **Keine Speicherung des Schlüssels**: Der eigentliche Verschlüsselungsschlüssel wird nie gespeichert, sondern nur die Daten zu seiner Ableitung
4. **Abhängigkeit vom Passwort**: Die Entschlüsselung ist ohne das Passwort des Benutzers unmöglich.

## Implementierte bewährte Praktiken

1. **Einzigartige IVs**: Jeder Verschlüsselungsvorgang verwendet einen neuen Zufalls-IV
2. **Authentifizierte Verschlüsselung**: GCM bietet Integritätsprüfung
3. **Starke Schlüsselableitung**: PBKDF2 mit hoher Iterationszahl
4. **Defense in Depth**: Mehrere Sicherheitsebenen (Passwort-Hash, Schlüsselableitung, Verschlüsselung)
5. **Keine eigene Kryptographie**: Verwendet standardmäßige, gut überprüfte Algorithmen
6. **Sichere Zufallszahlengenerierung**: Verwendet SecureRandom für kryptografische Operationen
