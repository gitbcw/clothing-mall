package org.linlinjava.litemall.core.ocr;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.net.URLEncoder;

/**
 * 简单的OCR测试主程序
 */
public class OcrTestMain {

    private static final String OCR_API_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic";
    private static final String TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token";

    private static final String API_KEY = "d6adXCnmEoURuO0Lx9keO9LL";
    private static final String SECRET_KEY = "TplRPeZIlxaDehEXvEcEPeagMvpbfWyM";

    public static void main(String[] args) {
        System.out.println("=== 百度OCR测试 ===\n");

        try {
            // 1. 获取Token
            System.out.println("1. 获取Access Token...");
            String accessToken = getAccessToken();
            if (accessToken != null) {
                System.out.println("   Token获取成功: " + accessToken.substring(0, 20) + "...");
            } else {
                System.out.println("   Token获取失败！");
                return;
            }

            // 2. 读取图片
            System.out.println("\n2. 读取测试图片...");
            File testImage = new File("C:/Users/cbw/Desktop/yjx.jpg");
            if (!testImage.exists()) {
                System.out.println("   图片不存在: " + testImage.getAbsolutePath());
                return;
            }
            byte[] imageBytes = Files.readAllBytes(testImage.toPath());
            String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
            System.out.println("   图片大小: " + imageBytes.length + " bytes");

            // 3. 调用OCR
            System.out.println("\n3. 调用百度OCR识别...");
            String url = OCR_API_URL + "?access_token=" + accessToken;
            String params = "image=" + URLEncoder.encode(imageBase64);

            String response = org.linlinjava.litemall.core.util.HttpUtil.post(url, params);

            // 4. 解析结果
            System.out.println("\n4. 解析识别结果...");
            parseResponse(response);

            System.out.println("\n=== 测试完成 ===");

        } catch (Exception e) {
            System.err.println("测试失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static String getAccessToken() {
        String params = "grant_type=client_credentials" +
                "&client_id=" + API_KEY +
                "&client_secret=" + SECRET_KEY;

        String response = org.linlinjava.litemall.core.util.HttpUtil.post(TOKEN_URL, params);
        System.out.println("   Token响应: " + response);

        try {
            com.fasterxml.jackson.databind.JsonNode json = new com.fasterxml.jackson.databind.ObjectMapper().readTree(response);
            if (json.has("access_token")) {
                return json.get("access_token").asText();
            } else if (json.has("error")) {
                System.err.println("   Token错误: " + json.get("error_description").asText());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private static void parseResponse(String response) throws IOException {
        com.fasterxml.jackson.databind.JsonNode json = new com.fasterxml.jackson.databind.ObjectMapper().readTree(response);

        // 检查错误
        if (json.has("error_code")) {
            System.err.println("   OCR错误: " + json.get("error_msg").asText());
            return;
        }

        com.fasterxml.jackson.databind.JsonNode wordsResult = json.get("words_result");
        if (wordsResult == null || !wordsResult.isArray()) {
            System.out.println("   未识别到内容");
            return;
        }

        System.out.println("   识别到 " + wordsResult.size() + " 个文本块:");
        for (int i = 0; i < Math.min(wordsResult.size(), 20); i++) {
            com.fasterxml.jackson.databind.JsonNode word = wordsResult.get(i);
            String text = word.get("words").asText();
            System.out.println("   [" + i + "] " + text);
        }
        if (wordsResult.size() > 20) {
            System.out.println("   ... 还有 " + (wordsResult.size() - 20) + " 个");
        }
    }
}
