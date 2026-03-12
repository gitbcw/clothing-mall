package org.linlinjava.litemall.core.ocr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.HttpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URLEncoder;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

/**
 * 百度OCR文字识别服务
 */
@Service
public class OcrService {

    private static final Log logger = LogFactory.getLog(OcrService.class);

    /**
     * 百度OCR API 地址
     */
    private static final String OCR_API_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic";

    /**
     * 获取Access Token的URL
     */
    private static final String TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token";

    @Autowired
    private OcrProperties ocrProperties;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 解析库存表格图片
     * 识别图片中的商品编号、颜色、尺码、数量信息
     *
     * @param imageBytes 图片字节数组
     * @return 解析后的库存列表
     */
    public List<InventoryItem> parseInventoryImage(byte[] imageBytes) {
        if (!ocrProperties.isEnabled()) {
            throw new RuntimeException("OCR功能未启用，请在配置文件中设置 litemall.ocr.enabled=true");
        }

        String accessToken = getAccessToken();
        if (accessToken == null) {
            throw new RuntimeException("获取百度OCR access_token失败，请检查API Key和Secret Key配置");
        }

        String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);

        String url = OCR_API_URL + "?access_token=" + accessToken;
        String params = "image=" + URLEncoder.encode(imageBase64);

        String response = HttpUtil.post(url, params);

        return parseOcrResponse(response);
    }

    /**
     * 解析库存表格图片（通过URL）
     *
     * @param imageUrl 图片URL
     * @return 解析后的库存列表
     */
    public List<InventoryItem> parseInventoryImage(String imageUrl) {
        if (!ocrProperties.isEnabled()) {
            throw new RuntimeException("OCR功能未启用，请在配置文件中设置 litemall.ocr.enabled=true");
        }

        String accessToken = getAccessToken();
        if (accessToken == null) {
            throw new RuntimeException("获取百度OCR access_token失败，请检查API Key和Secret Key配置");
        }

        String url = OCR_API_URL + "?access_token=" + accessToken;
        String params = "url=" + URLEncoder.encode(imageUrl);

        String response = HttpUtil.post(url, params);

        return parseOcrResponse(response);
    }

    /**
     * 获取百度Access Token
     */
    private String getAccessToken() {
        String params = "grant_type=client_credentials" +
                "&client_id=" + ocrProperties.getApiKey() +
                "&client_secret=" + ocrProperties.getSecretKey();

        String response = HttpUtil.post(TOKEN_URL, params);

        try {
            JsonNode json = objectMapper.readTree(response);
            return json.get("access_token").asText();
        } catch (Exception e) {
            logger.error("解析Access Token失败: " + response, e);
            return null;
        }
    }

    /**
     * 解析OCR响应结果，提取库存信息
     */
    private List<InventoryItem> parseOcrResponse(String response) {
        try {
            JsonNode json = objectMapper.readTree(response);

            // 检查是否有错误
            if (json.has("error_code")) {
                String errorMsg = json.get("error_msg").asText();
                throw new RuntimeException("OCR识别失败: " + errorMsg);
            }

            JsonNode wordsResult = json.get("words_result");
            if (wordsResult == null || wordsResult.isNull() || wordsResult.isArray() == false) {
                return Collections.emptyList();
            }

            // 提取所有识别的文字
            StringBuilder fullText = new StringBuilder();
            for (int i = 0; i < wordsResult.size(); i++) {
                JsonNode word = wordsResult.get(i);
                String text = word.get("words").asText();
                if (text != null) {
                    fullText.append(text).append("\n");
                }
            }

            return parseInventoryText(fullText.toString());

        } catch (Exception e) {
            logger.error("解析OCR响应失败: " + response, e);
            throw new RuntimeException("解析OCR响应失败: " + e.getMessage());
        }
    }

    /**
     * 解析库存文本，提取商品编号、颜色、尺码、数量
     * 核心是识别6位数字的款号
     */
    private List<InventoryItem> parseInventoryText(String text) {
        List<InventoryItem> items = new java.util.ArrayList<>();

        // 按行分割
        String[] lines = text.split("\n");

        // 收集所有非空片段
        java.util.ArrayList<String> allParts = new java.util.ArrayList<>();
        for (String line : lines) {
            if (line == null) continue;
            String[] parts = line.split("[\\s,，|]+");
            for (String part : parts) {
                part = part.trim();
                if (!part.isEmpty()) {
                    allParts.add(part);
                }
            }
        }

        // 找6位数字作为款号
        for (int i = 0; i < allParts.size(); i++) {
            String part = allParts.get(i);
            if (part.matches("^\\d{6}$")) {
                String goodsSn = part;
                String color = null;
                String size = null;
                Integer quantity = null;

                // 在款号附近找颜色、尺码、数量
                int start = Math.max(0, i - 3);
                int end = Math.min(allParts.size(), i + 6);

                for (int j = start; j < end; j++) {
                    if (j == i) continue;
                    String nearby = allParts.get(j);

                    // 颜色：包含"色"字
                    if (color == null && nearby.contains("色")) {
                        color = nearby;
                    }
                    // 尺码：包含"/"的格式
                    else if (size == null && nearby.contains("/")) {
                        size = nearby;
                    }
                    // 数量：纯数字，排除年份等
                    else if (quantity == null && nearby.matches("^\\d+$") && !nearby.matches("^\\d{6}$")) {
                        if (!nearby.equals("1990") && !nearby.equals("2026")) {
                            quantity = Integer.parseInt(nearby);
                        }
                    }
                }

                InventoryItem item = new InventoryItem();
                item.setGoodsSn(goodsSn);
                item.setColor(color);
                item.setSize(size);
                item.setQuantity(quantity != null ? quantity : 0);
                items.add(item);

                logger.info("解析到商品: goodsSn=" + goodsSn + ", color=" + color + ", size=" + size + ", quantity=" + quantity);
                break;
            }
        }

        return items;
    }

    /**
     * 判断是否为颜色词
     */
    private boolean isColor(String text) {
        String[] colors = {"黑色", "白色", "红色", "蓝色", "绿色", "黄色", "灰色", "粉色",
                "紫色", "橙色", "棕色", "米色", "卡其", "藏青", "酒红", "墨绿",
                "black", "white", "red", "blue", "green", "yellow", "gray", "pink"};
        for (String color : colors) {
            if (text.contains(color)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断是否为尺码
     */
    private boolean isSize(String text) {
        String[] sizes = {"XS", "S", "M", "L", "XL", "XXL", "XXXL",
                "165", "170", "175", "180", "185", "190"};
        for (String size : sizes) {
            if (text.contains(size)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 库存条目
     */
    public static class InventoryItem {
        private String goodsSn;
        private String color;
        private String size;
        private Integer quantity;

        public String getGoodsSn() {
            return goodsSn;
        }

        public void setGoodsSn(String goodsSn) {
            this.goodsSn = goodsSn;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public String getSize() {
            return size;
        }

        public void setSize(String size) {
            this.size = size;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        @Override
        public String toString() {
            return "InventoryItem{" +
                    "goodsSn='" + goodsSn + '\'' +
                    ", color='" + color + '\'' +
                    ", size='" + size + '\'' +
                    ", quantity=" + quantity +
                    '}';
        }
    }
}
