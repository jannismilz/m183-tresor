package ch.bbw.pr.tresorbackend.service;

import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class SecretEncryptionService {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;
    private static final int SALT_LENGTH_BYTE = 16;
    private static final int KEY_LENGTH = 256;
    private static final int ITERATION_COUNT = 65536;

    private final SecureRandom secureRandom;

    public SecretEncryptionService() {
        this.secureRandom = new SecureRandom();
    }

    /**
     * Encrypts a secret using a password-based key
     */
    public String encrypt(String content, String password) throws Exception {
        byte[] salt = new byte[SALT_LENGTH_BYTE];
        secureRandom.nextBytes(salt);

        byte[] iv = new byte[IV_LENGTH_BYTE];
        secureRandom.nextBytes(iv);

        SecretKey key = getAESKeyFromPassword(password, salt);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

        byte[] cipherText = cipher.doFinal(content.getBytes());

        byte[] cipherMessage = ByteBuffer.allocate(salt.length + iv.length + cipherText.length)
                .put(salt)
                .put(iv)
                .put(cipherText)
                .array();

        return Base64.getEncoder().encodeToString(cipherMessage);
    }

    /**
     * Decrypts a secret using a password-based key
     */
    public String decrypt(String encryptedContent, String password) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(encryptedContent);

        ByteBuffer bb = ByteBuffer.wrap(decoded);
        
        byte[] salt = new byte[SALT_LENGTH_BYTE];
        bb.get(salt);
        
        byte[] iv = new byte[IV_LENGTH_BYTE];
        bb.get(iv);
        
        byte[] cipherText = new byte[bb.remaining()];
        bb.get(cipherText);

        SecretKey key = getAESKeyFromPassword(password, salt);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

        byte[] plainText = cipher.doFinal(cipherText);

        return new String(plainText);
    }

    /**
     * Derives an AES key from a password and salt using PBKDF2
     */
    private SecretKey getAESKeyFromPassword(String password, byte[] salt) throws Exception {
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATION_COUNT, KEY_LENGTH);
        SecretKey secretKey = factory.generateSecret(spec);
        return new SecretKeySpec(secretKey.getEncoded(), "AES");
    }
}
