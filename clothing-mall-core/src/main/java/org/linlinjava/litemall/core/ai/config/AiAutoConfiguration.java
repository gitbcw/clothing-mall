package org.linlinjava.litemall.core.ai.config;

import org.linlinjava.litemall.core.ai.AiRecognitionProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI 识别自动配置
 * 注意：AiRecognitionService 已通过 @Service 注解自动注册，无需在此创建 Bean
 */
@Configuration
@EnableConfigurationProperties(AiRecognitionProperties.class)
public class AiAutoConfiguration {
    // AiRecognitionService 通过 @Service 注解自动注册
}
