package ch.bbw.pr.tresorbackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request model for Cloudflare Turnstile verification
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TurnstileVerificationRequest {
    private String secret;
    private String response;
    private String remoteip;
}
