package ch.bbw.pr.tresorbackend.service;

import ch.bbw.pr.tresorbackend.model.TwoFactorAuth;
import ch.bbw.pr.tresorbackend.repository.TwoFactorAuthRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class TwoFactorAuthService {

    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final GoogleAuthenticator googleAuthenticator;
    
    @Value("${app.2fa.code-expiry-minutes:10}")
    private int codeExpiryMinutes;

    @Autowired
    public TwoFactorAuthService(TwoFactorAuthRepository twoFactorAuthRepository) {
        this.twoFactorAuthRepository = twoFactorAuthRepository;
        
        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
                .setTimeStepSizeInMillis(TimeUnit.SECONDS.toMillis(30))
                .setWindowSize(3)
                .setCodeDigits(6)
                .build();
        
        this.googleAuthenticator = new GoogleAuthenticator(config);
    }

    public String generateSecretKey(Long userId, String username) {
        // Check if user already has 2FA enabled
        Optional<TwoFactorAuth> existingAuth = twoFactorAuthRepository.findByUserId(userId);
        
        if (existingAuth.isPresent()) {
            return existingAuth.get().getSecretKey();
        }
        
        // Generate a new secret key
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        String secretKey = key.getKey();
        
        // Save the secret key to the database
        TwoFactorAuth twoFactorAuth = new TwoFactorAuth();
        twoFactorAuth.setUserId(userId);
        twoFactorAuth.setSecretKey(secretKey);
        twoFactorAuth.setEnabled(false);
        
        twoFactorAuthRepository.save(twoFactorAuth);
        
        return secretKey;
    }
    
    public String generateQrCodeUrl(String secretKey, String username, String issuer) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthURL(issuer, username, new GoogleAuthenticatorKey.Builder(secretKey).build());
    }
    
    public boolean verifyCode(Long userId, String code) {
        Optional<TwoFactorAuth> twoFactorAuth = twoFactorAuthRepository.findByUserId(userId);
        
        if (twoFactorAuth.isPresent()) {
            String secretKey = twoFactorAuth.get().getSecretKey();
            return googleAuthenticator.authorize(secretKey, Integer.parseInt(code));
        }
        
        return false;
    }
    
    public void enableTwoFactorAuth(Long userId) {
        Optional<TwoFactorAuth> twoFactorAuth = twoFactorAuthRepository.findByUserId(userId);
        
        twoFactorAuth.ifPresent(auth -> {
            auth.setEnabled(true);
            twoFactorAuthRepository.save(auth);
        });
    }
    
    public void disableTwoFactorAuth(Long userId) {
        Optional<TwoFactorAuth> twoFactorAuth = twoFactorAuthRepository.findByUserId(userId);
        
        twoFactorAuth.ifPresent(auth -> {
            auth.setEnabled(false);
            twoFactorAuthRepository.save(auth);
        });
    }
    
    public boolean isTwoFactorEnabled(Long userId) {
        Optional<TwoFactorAuth> twoFactorAuth = twoFactorAuthRepository.findByUserId(userId);
        return twoFactorAuth.isPresent() && twoFactorAuth.get().isEnabled();
    }
}
