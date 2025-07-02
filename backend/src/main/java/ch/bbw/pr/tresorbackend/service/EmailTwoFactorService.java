package ch.bbw.pr.tresorbackend.service;

import ch.bbw.pr.tresorbackend.model.EmailVerificationCode;
import ch.bbw.pr.tresorbackend.model.User;
import ch.bbw.pr.tresorbackend.repository.EmailVerificationCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailTwoFactorService {

    private static final Logger logger = LoggerFactory.getLogger(EmailTwoFactorService.class);
    private static final String VERIFICATION_CODE_CHARS = "0123456789";
    private static final int VERIFICATION_CODE_LENGTH = 6;

    private final EmailVerificationCodeRepository emailVerificationCodeRepository;
    private final EmailService emailService;
    private final UserService userService;
    
    @Value("${app.2fa.code-expiry-minutes:10}")
    private int codeExpiryMinutes;

    @Autowired
    public EmailTwoFactorService(
            EmailVerificationCodeRepository emailVerificationCodeRepository,
            EmailService emailService,
            UserService userService) {
        this.emailVerificationCodeRepository = emailVerificationCodeRepository;
        this.emailService = emailService;
        this.userService = userService;
    }

    /**
     * Generate a verification code for a user and send it via email
     * 
     * @param userId the user ID
     * @return true if the code was sent successfully
     */
    public boolean generateAndSendVerificationCode(Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            logger.error("User not found with ID: {}", userId);
            return false;
        }

        String verificationCode = generateVerificationCode();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(codeExpiryMinutes);
        
        EmailVerificationCode emailVerificationCode = new EmailVerificationCode();
        emailVerificationCode.setUserId(userId);
        emailVerificationCode.setCode(verificationCode);
        emailVerificationCode.setExpiryTime(expiryTime);
        emailVerificationCode.setUsed(false);
        
        emailVerificationCodeRepository.save(emailVerificationCode);
        
        sendVerificationEmail(user.getEmail(), verificationCode);
        
        logger.info("Verification code generated and sent to user: {}", user.getEmail());
        return true;
    }
    
    /**
     * Verify a code submitted by a user
     * 
     * @param userId the user ID
     * @param code the verification code
     * @return true if the code is valid
     */
    public boolean verifyCode(Long userId, String code) {
        Optional<EmailVerificationCode> optionalCode = 
                emailVerificationCodeRepository.findByUserIdAndCodeAndUsedFalse(userId, code);
        
        if (optionalCode.isEmpty()) {
            logger.warn("Invalid verification code attempt for user ID: {}", userId);
            return false;
        }
        
        EmailVerificationCode verificationCode = optionalCode.get();
        
        if (verificationCode.isExpired()) {
            logger.warn("Expired verification code attempt for user ID: {}", userId);
            return false;
        }
        
        // Mark the code as used
        verificationCode.setUsed(true);
        emailVerificationCodeRepository.save(verificationCode);
        
        logger.info("Verification code successfully validated for user ID: {}", userId);
        return true;
    }
    
    /**
     * Generate a random verification code
     * 
     * @return a random verification code
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(VERIFICATION_CODE_LENGTH);
        
        for (int i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
            int randomIndex = random.nextInt(VERIFICATION_CODE_CHARS.length());
            sb.append(VERIFICATION_CODE_CHARS.charAt(randomIndex));
        }
        
        return sb.toString();
    }
    
    /**
     * Send a verification email to a user
     * 
     * @param email the user's email address
     * @param verificationCode the verification code
     */
    private void sendVerificationEmail(String email, String verificationCode) {
        String subject = "Tresor App - Your Verification Code";
        String message = "Your verification code is: " + verificationCode + "\n\n" +
                "This code will expire in " + codeExpiryMinutes + " minutes.\n\n" +
                "If you did not request this code, please ignore this email.";
        
        emailService.sendSimpleEmail(email, subject, message);
    }
}
