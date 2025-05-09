package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.Secret;
import ch.bbw.pr.tresorbackend.model.User;
import ch.bbw.pr.tresorbackend.service.SecretService;
import ch.bbw.pr.tresorbackend.service.UserService;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SecretController
 * Handles CRUD operations for encrypted secrets
 */
@RestController
@AllArgsConstructor
@RequestMapping("api/secrets")
public class SecretController {
    private static final Logger logger = LoggerFactory.getLogger(SecretController.class);

    private final SecretService secretService;
    private final UserService userService;

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping
    public ResponseEntity<String> createSecret(@Valid @RequestBody Secret secret) {
        try {
            Secret savedSecret = secretService.createSecret(secret);
            JsonObject response = new JsonObject();
            response.addProperty("id", savedSecret.getId());
            response.addProperty("message", "Secret created successfully");
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            logger.error("Error creating secret: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error creating secret\"}");
        }
    }

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Secret>> getSecretsByUserId(@PathVariable Long userId) {
        try {
            List<Secret> secrets = secretService.getSecretsByUserId(userId);
            return ResponseEntity.ok(secrets);
        } catch (Exception e) {
            logger.error("Error getting secrets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @GetMapping("/{id}")
    public ResponseEntity<Secret> getSecretById(@PathVariable Long id) {
        try {
            Secret secret = secretService.getSecretById(id);
            return ResponseEntity.ok(secret);
        } catch (Exception e) {
            logger.error("Error getting secret: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PutMapping("/{id}")
    public ResponseEntity<String> updateSecret(
            @PathVariable Long id,
            @Valid @RequestBody Secret secret) {
        try {
            secret.setId(id);
            Secret updatedSecret = secretService.updateSecret(secret);
            JsonObject response = new JsonObject();
            response.addProperty("message", "Secret updated successfully");
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            logger.error("Error updating secret: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error updating secret\"}");
        }
    }

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSecret(@PathVariable Long id) {
        try {
            secretService.deleteSecret(id);
            JsonObject response = new JsonObject();
            response.addProperty("message", "Secret deleted successfully");
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            logger.error("Error deleting secret: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error deleting secret\"}");
        }
    }
}
