package org.linlinjava.litemall.core.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * AI 识别配置（MiniMax M2.7）
 */
@ConfigurationProperties(prefix = "litemall.ai")
public class AiRecognitionProperties {

    /**
     * 是否启用 AI 识别功能
     */
    private boolean enabled = false;

    /**
     * MiniMax API Key
     */
    private String apiKey;

    /**
     * API 端点（默认 MiniMax OpenAI 兼容端点）
     */
    private String endpoint = "https://api.minimax.io/v1/chat/completions";

    /**
     * 模型名称（默认 MiniMax-Text-01）
     */
    private String model = "MiniMax-Text-01";

    /**
     * 请求超时时间（毫秒）
     */
    private int timeout = 30000;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
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
