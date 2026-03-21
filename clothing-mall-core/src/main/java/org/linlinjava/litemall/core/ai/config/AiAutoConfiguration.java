package org.linlinjava.litemall.core.ai.config;

import org.linlinjava.litemall.core.ai.AiRecognitionProperties;
import org.linlinjava.litemall.core.ai.AiRecognitionService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AI 识别自动配置
 */
@Configuration
@EnableConfigurationProperties(AiRecognitionProperties.class)
public class AiAutoConfiguration {

    private final AiRecognitionProperties properties;

    public AiAutoConfiguration(AiRecognitionProperties properties) {
        this.properties = properties;
    }

    @Bean
    public AiRecognitionService aiRecognitionService() {
        return new AiRecognitionService();
    }
}
