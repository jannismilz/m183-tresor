package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.ConfigProperties;
import ch.bbw.pr.tresorbackend.model.EmailVerificationRequest;
import ch.bbw.pr.tresorbackend.service.EmailTwoFactorService;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
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

@RestController
@RequestMapping("api/2fa")
public class TwoFactorController {

    private static final Logger logger = LoggerFactory.getLogger(TwoFactorController.class);
    
    private final EmailTwoFactorService emailTwoFactorService;
    private final ConfigProperties configProperties;

    @Autowired
    public TwoFactorController(EmailTwoFactorService emailTwoFactorService, ConfigProperties configProperties) {
        this.emailTwoFactorService = emailTwoFactorService;
        this.configProperties = configProperties;
    }

    /**
     * Generate and send a verification code to the user's email
     */
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/send-code")
    public ResponseEntity<String> sendVerificationCode(@RequestParam Long userId) {
        logger.info("Sending verification code for user ID: {}", userId);
        
        boolean sent = emailTwoFactorService.generateAndSendVerificationCode(userId);
        
        if (!sent) {
            logger.error("Failed to send verification code for user ID: {}", userId);
            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Failed to send verification code");
            String json = new Gson().toJson(obj);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(json);
        }
        
        JsonObject obj = new JsonObject();
        obj.addProperty("message", "Verification code sent");
        String json = new Gson().toJson(obj);
        return ResponseEntity.ok(json);
    }

    /**
     * Verify a code submitted by the user
     */
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@Valid @RequestBody EmailVerificationRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getFieldErrors().stream()
                    .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                    .collect(Collectors.toList());

            JsonArray arr = new JsonArray();
            errors.forEach(arr::add);
            JsonObject obj = new JsonObject();
            obj.add("message", arr);
            String json = new Gson().toJson(obj);

            logger.warn("Verification code validation failed: {}", json);
            return ResponseEntity.badRequest().body(json);
        }
        
        boolean verified = emailTwoFactorService.verifyCode(request.getUserId(), request.getCode());
        
        if (!verified) {
            logger.warn("Invalid verification code for user ID: {}", request.getUserId());
            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Invalid or expired verification code");
            String json = new Gson().toJson(obj);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(json);
        }
        
        JsonObject obj = new JsonObject();
        obj.addProperty("message", "Verification successful");
        obj.addProperty("verified", true);
        String json = new Gson().toJson(obj);
        return ResponseEntity.ok(json);
    }
}
