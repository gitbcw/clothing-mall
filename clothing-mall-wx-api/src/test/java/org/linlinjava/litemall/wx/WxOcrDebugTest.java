package org.linlinjava.litemall.wx;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.linlinjava.litemall.core.ocr.OcrProperties;
import org.linlinjava.litemall.core.ocr.OcrService;
import org.linlinjava.litemall.core.util.HttpUtil;

import java.io.File;
import java.lang.reflect.Field;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.util.Base64;

import static org.junit.Assert.*;

/**
 * 调试OCR识别问题
 */
public class WxOcrDebugTest {

    private static final String OCR_API_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic";
    private static final String TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token";

    @Test
    public void debugOcrResult() throws Exception {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setApiKey("d6adXCnmEoURuO0Lx9keO9LL");
        properties.setSecretKey("TplRPeZIlxaDehEXvEcEPeagMvpbfWyM");

        // 1. 获取token
        String params = "grant_type=client_credentials" +
                "&client_id=" + properties.getApiKey() +
                "&client_secret=" + properties.getSecretKey();
        String tokenResponse = HttpUtil.post(TOKEN_URL, params);
        System.out.println("Token响应: " + tokenResponse);

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode tokenJson = objectMapper.readTree(tokenResponse);
        String accessToken = tokenJson.get("access_token").asText();
        System.out.println("Access Token: " + accessToken);

        // 2. 读取图片
        File testImage = new File("C:/Users/cbw/Desktop/pic.png");
        byte[] imageBytes = Files.readAllBytes(testImage.toPath());
        String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);

        // 3. 调用OCR
        String url = OCR_API_URL + "?access_token=" + accessToken;
        String ocrParams = "image=" + URLEncoder.encode(imageBase64);
        String ocrResponse = HttpUtil.post(url, ocrParams);

        // 4. 打印原始响应，看有没有坐标信息
        System.out.println("\n=== OCR原始响应 ===");
        JsonNode ocrJson = objectMapper.readTree(ocrResponse);
        JsonNode wordsResult = ocrJson.get("words_result");

        if (wordsResult != null && wordsResult.isArray()) {
            System.out.println("识别到的文字(" + wordsResult.size() + "条):");
            for (int i = 0; i < wordsResult.size(); i++) {
                JsonNode word = wordsResult.get(i);
                String text = word.get("words").asText();
                // 打印位置信息
                JsonNode location = word.get("location");
                if (location != null) {
                    int top = location.get("top").asInt();
                    int left = location.get("left").asInt();
                    System.out.println("  " + i + ": [" + text + "] 位置(top=" + top + ", left=" + left + ")");
                } else {
                    System.out.println("  " + i + ": [" + text + "]");
                }
            }
        }

        // 5. 用现有解析逻辑测试
        System.out.println("\n=== 解析结果 ===");

        // 手动构建text来测试
        StringBuilder fullText = new StringBuilder();
        for (int i = 0; i < wordsResult.size(); i++) {
            JsonNode word = wordsResult.get(i);
            String text = word.get("words").asText();
            if (text != null && !text.trim().isEmpty()) {
                fullText.append(text).append("\n");
            }
        }
        System.out.println("=== 完整文本 ===");
        System.out.println(fullText.toString());

        OcrService ocrService = new OcrService();
        Field field = OcrService.class.getDeclaredField("ocrProperties");
        field.setAccessible(true);
        field.set(ocrService, properties);

        java.util.List<OcrService.InventoryItem> items = ocrService.parseInventoryImage(imageBytes);
        System.out.println("解析出 " + items.size() + " 条记录:");
        for (OcrService.InventoryItem item : items) {
            System.out.println("  - 商品编号: " + item.getGoodsSn() +
                    ", 颜色: " + item.getColor() +
                    ", 尺码: " + item.getSize() +
                    ", 数量: " + item.getQuantity());
        }
    }
}
