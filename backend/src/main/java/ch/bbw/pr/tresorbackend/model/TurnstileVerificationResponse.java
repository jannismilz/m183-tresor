package ch.bbw.pr.tresorbackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response model for Cloudflare Turnstile verification
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TurnstileVerificationResponse {
    private boolean success;
    private String challenge_ts;
    private String hostname;
    private List<String> errorCodes;
}
