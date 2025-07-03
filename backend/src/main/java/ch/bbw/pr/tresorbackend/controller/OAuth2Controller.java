package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.ConfigProperties;
import ch.bbw.pr.tresorbackend.model.User;
import ch.bbw.pr.tresorbackend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for handling OAuth2 authentication flows
 */
@RestController
@RequestMapping("/api/oauth2")
@CrossOrigin(origins = "${CROSS_ORIGIN}")
public class OAuth2Controller {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);
    
    private final RestTemplate restTemplate;
    private final UserService userService;
    private final ConfigProperties configProperties;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;
    
    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;
    
    public OAuth2Controller(RestTemplate restTemplate, UserService userService, ConfigProperties configProperties) {
        this.restTemplate = restTemplate;
        this.userService = userService;
        this.configProperties = configProperties;
    }
    
    /**
     * Authenticates a user with Google OAuth2
     * @param payload Contains the authorization code from Google
     * @return User information and authentication status
     */
    @PostMapping("/google")
    public Map<String, Object> authenticateGoogle(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        Map<String, Object> response = new HashMap<>();
        
        if (code == null || code.isEmpty()) {
            response.put("success", false);
            response.put("error", "Authorization code is required");
            return response;
        }
        
        try {
            // Exchange authorization code for access token
            String tokenUrl = "https://oauth2.googleapis.com/token";
            Map<String, String> tokenRequest = new HashMap<>();
            tokenRequest.put("code", code);
            tokenRequest.put("client_id", clientId);
            tokenRequest.put("client_secret", clientSecret);
            tokenRequest.put("redirect_uri", redirectUri);
            tokenRequest.put("grant_type", "authorization_code");
            
            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                tokenUrl, tokenRequest, Map.class);
            
            if (tokenResponse.getBody() == null) {
                throw new RuntimeException("Empty response from Google token endpoint");
            }
            
            String accessToken = (String) tokenResponse.getBody().get("access_token");
            String refreshToken = (String) tokenResponse.getBody().get("refresh_token");
            
            if (accessToken == null || accessToken.isEmpty()) {
                throw new RuntimeException("Failed to obtain access token from Google");
            }
            
            // Get user info using the access token
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo", 
                HttpMethod.GET, 
                entity, 
                Map.class);
            
            if (userInfoResponse.getBody() == null) {
                throw new RuntimeException("Empty response from Google userinfo endpoint");
            }
            
            Map<String, Object> userInfo = userInfoResponse.getBody();
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");
            String givenName = (String) userInfo.get("given_name");
            String familyName = (String) userInfo.get("family_name");
            
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email not provided by Google");
            }
            
            // Find or create user
            User user = userService.findByEmail(email);
            boolean isNewUser = false;
            
            if (user == null) {
                // Create new user with Google account
                user = new User();
                user.setEmail(email);
                // Set a random password since they'll be using OAuth
                user.setPassword(UUID.randomUUID().toString());
                user.setTwoFactorEnabled(false); // No 2FA needed for OAuth users
                user.setOauthProvider("google");
                user.setOauthId((String) userInfo.get("sub")); // Google's unique user ID
                isNewUser = true;
            } else {
                // Update existing user with latest Google info
                user.setOauthProvider("google");
                user.setOauthId((String) userInfo.get("sub"));
            }
            
            // Save the user
            if(isNewUser) {
                userService.createUser(user);
            } else {
                userService.updateUser(user);
            }

            if (isNewUser) {
                logger.info("Created new user from Google OAuth: {}", email);
            } else {
                logger.info("Existing user logged in via Google OAuth: {}", email);
            }
            
            // Return user info for frontend
            response.put("success", true);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("picture", picture);
            response.put("isNewUser", isNewUser);
            response.put("requiresTwoFactor", false); // OAuth users bypass 2FA
            
        } catch (Exception e) {
            logger.error("Google OAuth authentication error", e);
            response.put("success", false);
            response.put("error", "Authentication failed: " + e.getMessage());
        }
        
        return response;
    }
}
