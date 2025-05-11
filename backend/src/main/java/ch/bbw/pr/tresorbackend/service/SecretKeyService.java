package ch.bbw.pr.tresorbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;

/**
 * Service to generate encryption keys for secrets
 */
@Service
public class SecretKeyService {
    
    private static final String PEPPER = "tresor-app-pepper";
    private static final int ITERATION_COUNT = 65536;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;
    
    private final SecureRandom secureRandom;
    
    public SecretKeyService() {
        this.secureRandom = new SecureRandom();
    }
    
    /**
     * Generate a new encryption key and its encoded form
     * @param password The user's password
     * @return A KeyData object containing the key and its encoded form
     */
    public KeyData generateKey(String password) throws NoSuchAlgorithmException, InvalidKeySpecException {
        // Generate a random salt
        byte[] salt = new byte[SALT_LENGTH];
        secureRandom.nextBytes(salt);
        
        // Add pepper to password for additional security
        String pepperedPassword = password + PEPPER;
        
        // Generate a key using PBKDF2
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        KeySpec spec = new PBEKeySpec(pepperedPassword.toCharArray(), salt, ITERATION_COUNT, KEY_LENGTH);
        SecretKey tmp = factory.generateSecret(spec);
        SecretKey key = new SecretKeySpec(tmp.getEncoded(), "AES");
        
        // Encode salt for storage
        String encodedSalt = Base64.getEncoder().encodeToString(salt);
        
        // Create and return key data
        return new KeyData(key, encodedSalt, ITERATION_COUNT);
    }
    
    /**
     * Recreate a key from its encoded form
     * @param password The user's password
     * @param encodedSalt Base64 encoded salt
     * @param iterations Number of iterations used
     * @return The recreated SecretKey
     */
    public SecretKey recreateKey(String password, String encodedSalt, int iterations) throws NoSuchAlgorithmException, InvalidKeySpecException {
        // Decode the salt
        byte[] salt = Base64.getDecoder().decode(encodedSalt);
        
        // Add pepper to password
        String pepperedPassword = password + PEPPER;
        
        // Recreate the key
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        KeySpec spec = new PBEKeySpec(pepperedPassword.toCharArray(), salt, iterations, KEY_LENGTH);
        SecretKey tmp = factory.generateSecret(spec);
        
        return new SecretKeySpec(tmp.getEncoded(), "AES");
    }
    
    /**
     * Class to hold key and its encoded form
     */
    public static class KeyData {
        private final SecretKey key;
        private final String encodedSalt;
        private final int iterations;
        
        public KeyData(SecretKey key, String encodedSalt, int iterations) {
            this.key = key;
            this.encodedSalt = encodedSalt;
            this.iterations = iterations;
        }
        
        public SecretKey getKey() {
            return key;
        }
        
        public String getEncodedSalt() {
            return encodedSalt;
        }
        
        public int getIterations() {
            return iterations;
        }
        
        /**
         * Format key data for storage
         * @return Formatted string with salt and iterations
         */
        public String formatForStorage() {
            return encodedSalt + "::" + iterations;
        }
        
        /**
         * Parse key data from storage format
         * @param keyData Formatted string with salt and iterations
         * @return Array with salt and iterations
         */
        public static String[] parseFromStorage(String keyData) {
            return keyData.split("::");
        }
    }
}
