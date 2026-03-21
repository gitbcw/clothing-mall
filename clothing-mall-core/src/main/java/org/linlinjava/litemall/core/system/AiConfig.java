package org.linlinjava.litemall.core.system;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * AI 服务配置
 * 对应 application-core.yml 中的 litemall.ai 配置项
 */
@Component
@ConfigurationProperties(prefix = "litemall.ai")
public class AiConfig {

    /**
     * 是否启用 AI 服务
     * 如果为 false，则返回 Mock 数据
     */
    private boolean enabled = false;

    /**
     * AI 服务提供商
     * 目前支持：minimax, openai, baidu, aliyun
     */
    private String provider = "mock";

    /**
     * API Key
     */
    private String apiKey;

    /**
     * API 端点
     */
    private String endpoint;

    /**
     * 模型名称
     */
    private String model;

    /**
     * 超时时间（毫秒）
     */
    private int timeout = 30000;

    // Getters and Setters

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }
}
