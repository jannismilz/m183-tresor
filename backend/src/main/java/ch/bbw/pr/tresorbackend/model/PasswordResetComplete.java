package ch.bbw.pr.tresorbackend.model;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request model for completing a password reset
 */
@Data
public class PasswordResetComplete {
    
    @NotEmpty(message = "Token is required")
    private String token;
    
    @NotEmpty(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$",
        message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    )
    private String password;
    
    @NotEmpty(message = "Password confirmation is required")
    private String passwordConfirmation;
    
    @NotEmpty(message = "Security verification is required")
    private String turnstileToken;
}
