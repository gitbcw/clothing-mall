package org.linlinjava.litemall.core.ocr;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 百度OCR配置
 */
@ConfigurationProperties(prefix = "litemall.ocr")
public class OcrProperties {

    /**
     * 是否启用OCR功能
     */
    private boolean enabled = false;

    /**
     * 百度API Key
     */
    private String apiKey;

    /**
     * 百度Secret Key
     */
    private String secretKey;

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

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }
}
