package ch.bbw.pr.tresorbackend.service;

import ch.bbw.pr.tresorbackend.model.PasswordResetToken;
import ch.bbw.pr.tresorbackend.model.User;
import ch.bbw.pr.tresorbackend.repository.PasswordResetTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for handling password reset functionality
 */
@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncryptionService passwordService;
    
    @Value("${app.password-reset.token-expiration}")
    private long tokenExpirationMs;
    
    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Create a password reset token for the user and send a reset email
     * 
     * @param email user's email address
     * @return true if email was sent, false if user not found
     */
    public boolean createPasswordResetTokenForUser(String email) {
        User user = userService.findByEmail(email);
        if (user == null) {
            logger.warn("Password reset requested for non-existent email: {}", email);
            return false;
        }
        
        // Delete any existing tokens for this user
        PasswordResetToken existingToken = tokenRepository.findByUser(user);
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }
        
        // Create a new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiryDate(LocalDateTime.now().plusSeconds(tokenExpirationMs / 1000));
        tokenRepository.save(resetToken);
        
        // Send email with reset link
        String resetUrl = baseUrl + "/user/reset-password?token=" + token;
        String emailBody = "Heyo" + user.getFirstName() + ",\n\n" +
                "Druck uf de Link zum dis Passwort resette:" +
                resetUrl + "\n\n" +
                "De Link isch 1 Stund gültig." +
                "Dis vertrauenswürdige Tresor Team. (Nei, nöd d'Cornflakes...)";
        
        emailService.sendSimpleEmail(user.getEmail(), "Schlecht gmacht..", emailBody);
        logger.info("Password reset token created for user: {}", email);
        
        return true;
    }
    
    /**
     * Validate the password reset token
     * 
     * @param token reset token
     * @return the user if token is valid, null otherwise
     */
    public User validatePasswordResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken == null) {
            logger.warn("Invalid password reset token: {}", token);
            return null;
        }
        
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            logger.warn("Expired password reset token: {}", token);
            return null;
        }
        
        return resetToken.getUser();
    }
    
    /**
     * Reset the user's password
     * 
     * @param token reset token
     * @param newPassword new password
     * @return true if password was reset, false otherwise
     */
    public boolean resetPassword(String token, String newPassword) {
        User user = validatePasswordResetToken(token);
        if (user == null) {
            return false;
        }
        
        // Update password
        user.setPassword(passwordService.hashPassword(newPassword));
        userService.updateUser(user);
        
        // Delete the used token
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        tokenRepository.delete(resetToken);
        
        logger.info("Password reset successful for user: {}", user.getEmail());
        return true;
    }
}
