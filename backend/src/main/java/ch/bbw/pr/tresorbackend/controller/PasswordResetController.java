package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.ConfigProperties;
import ch.bbw.pr.tresorbackend.model.PasswordResetComplete;
import ch.bbw.pr.tresorbackend.model.PasswordResetRequest;
import ch.bbw.pr.tresorbackend.model.User;
import ch.bbw.pr.tresorbackend.service.PasswordResetService;
import ch.bbw.pr.tresorbackend.service.TurnstileService;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for handling password reset requests
 */
@RestController
@RequestMapping("api/password-reset")
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    @Autowired
    private TurnstileService turnstileService;
    
    @Autowired
    private ConfigProperties configProperties;

    /**
     * Initiate password reset process
     * 
     * @param resetRequest contains user email
     * @param bindingResult validation result
     * @param request HTTP request
     * @return response entity
     */
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/request")
    public ResponseEntity<String> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest resetRequest,
            BindingResult bindingResult,
            HttpServletRequest request) {
        
        // Verify Turnstile token
        String remoteIp = request.getRemoteAddr();
        boolean turnstileVerified = turnstileService.verifyToken(resetRequest.getTurnstileToken(), remoteIp);
        
        if (!turnstileVerified) {
            logger.warn("Password reset request failed: Invalid Turnstile verification");
            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Security verification failed. Please try again.");
            String json = new Gson().toJson(obj);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(json);
        }
        
        // Validate input
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getFieldErrors().stream()
                    .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                    .collect(Collectors.toList());
            
            JsonObject obj = new JsonObject();
            obj.addProperty("message", String.join(", ", errors));
            String json = new Gson().toJson(obj);
            
            logger.warn("Password reset validation failed: {}", json);
            return ResponseEntity.badRequest().body(json);
        }
        
        // Process password reset request
        boolean emailSent = passwordResetService.createPasswordResetTokenForUser(resetRequest.getEmail());
        
        // Always return success to prevent email enumeration attacks
        JsonObject obj = new JsonObject();
        obj.addProperty("message", "If your email is registered with us, you will receive a password reset link shortly.");
        String json = new Gson().toJson(obj);
        
        return ResponseEntity.ok(json);
    }
    
    /**
     * Validate password reset token
     * 
     * @param token reset token
     * @return response entity
     */
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestParam("token") String token) {
        User user = passwordResetService.validatePasswordResetToken(token);
        
        JsonObject obj = new JsonObject();
        if (user != null) {
            obj.addProperty("valid", true);
            obj.addProperty("email", user.getEmail());
        } else {
            obj.addProperty("valid", false);
            obj.addProperty("message", "Invalid or expired token");
        }
        
        String json = new Gson().toJson(obj);
        return ResponseEntity.ok(json);
    }
    
    /**
     * Complete password reset process
     * 
     * @param resetComplete contains token and new password
     * @param bindingResult validation result
     * @param request HTTP request
     * @return response entity
     */
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/complete")
    public ResponseEntity<String> completePasswordReset(
            @Valid @RequestBody PasswordResetComplete resetComplete,
            BindingResult bindingResult,
            HttpServletRequest request) {
        
        // Verify Turnstile token
        String remoteIp = request.getRemoteAddr();
        boolean turnstileVerified = turnstileService.verifyToken(resetComplete.getTurnstileToken(), remoteIp);
        
        if (!turnstileVerified) {
            logger.warn("Password reset completion failed: Invalid Turnstile verification");
            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Security verification failed. Please try again.");
            String json = new Gson().toJson(obj);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(json);
        }
        
        // Validate input
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getFieldErrors().stream()
                    .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                    .collect(Collectors.toList());
            
            JsonObject obj = new JsonObject();
            obj.addProperty("message", String.join(", ", errors));
            String json = new Gson().toJson(obj);
            
            logger.warn("Password reset completion validation failed: {}", json);
            return ResponseEntity.badRequest().body(json);
        }
        
        // Verify password match
        if (!resetComplete.getPassword().equals(resetComplete.getPasswordConfirmation())) {
            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Password and confirmation do not match");
            String json = new Gson().toJson(obj);
            
            logger.warn("Password reset completion failed: passwords do not match");
            return ResponseEntity.badRequest().body(json);
        }
        
        // Additional password strength validation
        String password = resetComplete.getPassword();
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$";
        
        if (password.length() < 8 || !password.matches(passwordRegex)) {
            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            String json = new Gson().toJson(obj);
            
            logger.warn("Password reset completion failed: password does not meet strength requirements");
            return ResponseEntity.badRequest().body(json);
        }
        
        // Complete password reset
        boolean resetSuccessful = passwordResetService.resetPassword(
                resetComplete.getToken(),
                resetComplete.getPassword()
        );
        
        JsonObject obj = new JsonObject();
        if (resetSuccessful) {
            obj.addProperty("message", "Password has been reset successfully");
            String json = new Gson().toJson(obj);
            return ResponseEntity.ok(json);
        } else {
            obj.addProperty("message", "Invalid or expired token");
            String json = new Gson().toJson(obj);
            return ResponseEntity.badRequest().body(json);
        }
    }
}
