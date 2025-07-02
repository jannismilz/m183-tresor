package ch.bbw.pr.tresorbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OAuth2Config {

    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
