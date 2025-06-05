package ch.bbw.pr.tresorbackend.service;

import ch.bbw.pr.tresorbackend.model.TurnstileVerificationRequest;
import ch.bbw.pr.tresorbackend.model.TurnstileVerificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service for verifying Cloudflare Turnstile tokens
 */
@Service
public class TurnstileService {

    private static final Logger logger = LoggerFactory.getLogger(TurnstileService.class);
    private static final String VERIFICATION_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    @Value("${turnstile.secret.key}")
    private String secretKey;

    private final RestTemplate restTemplate;

    public TurnstileService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Verify a Turnstile token
     * 
     * @param token The token to verify
     * @param remoteIp The IP address of the user (optional)
     * @return true if verification succeeded, false otherwise
     */
    public boolean verifyToken(String token, String remoteIp) {
        try {
            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create request body
            TurnstileVerificationRequest request = new TurnstileVerificationRequest(
                secretKey,
                token,
                remoteIp
            );

            // Create the request entity
            HttpEntity<TurnstileVerificationRequest> requestEntity = new HttpEntity<>(request, headers);

            // Make the request
            ResponseEntity<TurnstileVerificationResponse> responseEntity = restTemplate.postForEntity(
                VERIFICATION_URL,
                requestEntity,
                TurnstileVerificationResponse.class
            );

            // Check if the response is successful
            TurnstileVerificationResponse response = responseEntity.getBody();
            if (response != null && response.isSuccess()) {
                logger.info("Turnstile verification successful");
                return true;
            } else {
                if (response != null) {
                    logger.warn("Turnstile verification failed: {}", response.getErrorCodes());
                } else {
                    logger.warn("Turnstile verification failed: null response");
                }
                return false;
            }
        } catch (Exception e) {
            logger.error("Error verifying Turnstile token", e);
            return false;
        }
    }
}
