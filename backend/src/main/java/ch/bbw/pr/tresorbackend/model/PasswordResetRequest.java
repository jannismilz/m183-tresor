package ch.bbw.pr.tresorbackend.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * Request model for initiating a password reset
 */
@Data
public class PasswordResetRequest {
    
    @NotEmpty(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;
    
    @NotEmpty(message = "Security verification is required")
    private String turnstileToken;
}
