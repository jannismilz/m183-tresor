package ch.bbw.pr.tresorbackend.service.impl;

import ch.bbw.pr.tresorbackend.model.Secret;
import ch.bbw.pr.tresorbackend.model.User;
import ch.bbw.pr.tresorbackend.repository.SecretRepository;
import ch.bbw.pr.tresorbackend.service.SecretEncryptionService;
import ch.bbw.pr.tresorbackend.service.SecretService;
import ch.bbw.pr.tresorbackend.service.UserService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * SecretServiceImpl
 * Handles CRUD operations for secrets with encryption
 */
@Service
@AllArgsConstructor
public class SecretServiceImpl implements SecretService {

    private static final Logger logger = LoggerFactory.getLogger(SecretServiceImpl.class);
    
    private final SecretRepository secretRepository;
    private final SecretEncryptionService encryptionService;
    private final UserService userService;

    @Override
    public Secret createSecret(Secret secret) {
        try {
            // Get user's password for encryption
            User user = userService.getUserById(secret.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Encrypt the content
            String encryptedContent = encryptionService.encrypt(secret.getContent(), user.getPassword());
            secret.setContent(encryptedContent);

            return secretRepository.save(secret);
        } catch (Exception e) {
            logger.error("Error creating secret: " + e.getMessage());
            throw new RuntimeException("Error creating secret", e);
        }
    }

    @Override
    public Secret getSecretById(Long secretId) {
        try {
            Optional<Secret> optionalSecret = secretRepository.findById(secretId);
            if (optionalSecret.isEmpty()) {
                throw new RuntimeException("Secret not found");
            }

            Secret secret = optionalSecret.get();
            
            // Get user's password for decryption
            User user = userService.getUserById(secret.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Decrypt the content
            String decryptedContent = encryptionService.decrypt(secret.getContent(), user.getPassword());
            secret.setContent(decryptedContent);

            return secret;
        } catch (Exception e) {
            logger.error("Error getting secret: " + e.getMessage());
            throw new RuntimeException("Error getting secret", e);
        }
    }

    @Override
    public List<Secret> getAllSecrets() {
        throw new RuntimeException("Operation not supported - secrets should only be accessed by their owners");
    }

    @Override
    public Secret updateSecret(Secret secret) {
        try {
            Secret existingSecret = secretRepository.findById(secret.getId())
                    .orElseThrow(() -> new RuntimeException("Secret not found"));

            // Verify the user owns this secret
            if (!existingSecret.getUserId().equals(secret.getUserId())) {
                throw new RuntimeException("Unauthorized access to secret");
            }

            // Get user's password for encryption
            User user = userService.getUserById(secret.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Encrypt the new content
            String encryptedContent = encryptionService.encrypt(secret.getContent(), user.getPassword());
            existingSecret.setContent(encryptedContent);

            return secretRepository.save(existingSecret);
        } catch (Exception e) {
            logger.error("Error updating secret: " + e.getMessage());
            throw new RuntimeException("Error updating secret", e);
        }
    }

    @Override
    public void deleteSecret(Long secretId) {
        secretRepository.deleteById(secretId);
    }

    @Override
    public List<Secret> getSecretsByUserId(Long userId) {
        try {
            // Get user's password for decryption
            User user = userService.getUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            List<Secret> encryptedSecrets = secretRepository.findByUserId(userId);
            List<Secret> decryptedSecrets = new ArrayList<>();

            // Decrypt all secrets
            for (Secret secret : encryptedSecrets) {
                String decryptedContent = encryptionService.decrypt(secret.getContent(), user.getPassword());
                Secret decryptedSecret = new Secret(
                        secret.getId(),
                        secret.getUserId(),
                        decryptedContent
                );
                decryptedSecrets.add(decryptedSecret);
            }

            return decryptedSecrets;
        } catch (Exception e) {
            logger.error("Error getting secrets for user: " + e.getMessage());
            throw new RuntimeException("Error getting secrets", e);
        }
    }

}
