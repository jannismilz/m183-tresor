package ch.bbw.pr.tresorbackend.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting and decrypting secrets
 * Uses AES/GCM/NoPadding with a persistent key derivation approach
 */
@Service
public class SecretEncryptionService {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;
    private static final String SEPARATOR = "###";

    private final SecureRandom secureRandom;
    private final SecretKeyService secretKeyService;

    public SecretEncryptionService() {
        this.secureRandom = new SecureRandom();
        this.secretKeyService = new SecretKeyService();
    }

    /**
     * Encrypts a secret and stores key information with the encrypted content
     * Format: encryptedContent###keyData
     */
    public String encrypt(String content, String password) throws Exception {
        // Generate a new key for this secret
        SecretKeyService.KeyData keyData = secretKeyService.generateKey(password);
        SecretKey key = keyData.getKey();

        // Generate a random IV (Initialization Vector)
        byte[] iv = new byte[IV_LENGTH_BYTE];
        secureRandom.nextBytes(iv);

        // Initialize cipher for encryption
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

        // Encrypt the content
        byte[] cipherText = cipher.doFinal(content.getBytes());

        // Combine IV and ciphertext into a single message
        byte[] cipherMessage = ByteBuffer.allocate(iv.length + cipherText.length)
                .put(iv)
                .put(cipherText)
                .array();

        // Encode to Base64 for storage
        String encryptedContent = Base64.getEncoder().encodeToString(cipherMessage);
        
        // Combine encrypted content with key data for storage
        return encryptedContent + SEPARATOR + keyData.formatForStorage();
    }

    /**
     * Decrypts a secret using the key information stored with the encrypted content
     * Format: encryptedContent###keyData
     */
    public String decrypt(String combinedContent, String password) throws Exception {
        // Split the combined content into encrypted content and key data
        String[] parts = combinedContent.split(SEPARATOR);
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid encrypted content format");
        }
        
        String encryptedContent = parts[0];
        String keyDataStr = parts[1];
        
        // Parse key data
        String[] keyDataParts = SecretKeyService.KeyData.parseFromStorage(keyDataStr);
        if (keyDataParts.length != 2) {
            throw new IllegalArgumentException("Invalid key data format");
        }
        
        String encodedSalt = keyDataParts[0];
        int iterations = Integer.parseInt(keyDataParts[1]);
        
        // Recreate the key using the stored salt and iterations
        SecretKey key = secretKeyService.recreateKey(password, encodedSalt, iterations);

        // Decode the Base64 content
        byte[] decoded = Base64.getDecoder().decode(encryptedContent);

        // Extract IV and ciphertext
        ByteBuffer bb = ByteBuffer.wrap(decoded);
        
        byte[] iv = new byte[IV_LENGTH_BYTE];
        bb.get(iv);
        
        byte[] cipherText = new byte[bb.remaining()];
        bb.get(cipherText);

        // Initialize cipher for decryption
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

        // Decrypt the content
        byte[] plainText = cipher.doFinal(cipherText);

        return new String(plainText);
    }


}
