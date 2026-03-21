package org.linlinjava.litemall.core.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.HttpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * AI 服装识别服务
 * 基于 MiniMax M2.7 多模态大模型实现图像识别
 */
@Service
public class AiRecognitionService {

    private static final Log logger = LogFactory.getLog(AiRecognitionService.class);

    /**
     * 服装识别系统提示词
     */
    private static final String CLOTHING_SYSTEM_PROMPT = "你是一个专业的服装识别助手。你的任务是分析用户上传的服装图片，提取以下信息并以JSON格式返回：\n" +
            "\n" +
            "{\n" +
            "  \"name\": \"服装名称（简洁描述，如：黑色圆领T恤）\",\n" +
            "  \"category\": \"分类（从以下选择：上衣、裤装、裙装、外套、连衣裙、配饰、鞋履、内衣、其他）\",\n" +
            "  \"color\": \"主色调（如：黑色、白色、红色、蓝色等）\",\n" +
            "  \"size\": \"尺码（如果图片中有尺码标签则识别，否则返回空字符串）\",\n" +
            "  \"material\": \"材质（如：棉、涤纶、丝绸、羊毛等，如果无法确定返回空字符串）\",\n" +
            "  \"style\": \"风格标签（从以下选择：休闲、正式、运动、复古、潮流、简约、其他，可多选用逗号分隔）\",\n" +
            "  \"season\": \"适用季节（从以下选择：春、夏、秋、冬、四季通用）\",\n" +
            "  \"pattern\": \"图案（如：纯色、条纹、格子、印花等）\",\n" +
            "  \"brief\": \"简短描述（50字以内）\",\n" +
            "  \"confidence\": 识别置信度（0.0-1.0之间的数值）\n" +
            "}\n" +
            "\n" +
            "注意事项：\n" +
            "1. 必须返回合法的JSON格式\n" +
            "2. 如果某些信息无法从图片中识别，对应字段返回空字符串\n" +
            "3. confidence表示整体识别的置信度\n" +
            "4. 只返回JSON，不要包含其他解释文字";

    @Autowired
    private AiRecognitionProperties aiProperties;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 识别服装图片
     *
     * @param imageBytes 图片字节数组
     * @return 识别结果
     */
    public ClothingRecognitionResult recognizeClothing(byte[] imageBytes) {
        if (!aiProperties.isEnabled()) {
            throw new RuntimeException("AI 识别功能未启用，请在配置文件中设置 litemall.ai.enabled=true");
        }

        if (aiProperties.getApiKey() == null || aiProperties.getApiKey().isEmpty()) {
            throw new RuntimeException("AI 识别功能缺少 API Key，请配置 litemall.ai.api-key");
        }

        String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
        return callMiniMaxApi(imageBase64);
    }

    /**
     * 通过图片 URL 识别服装
     *
     * @param imageUrl 图片 URL
     * @return 识别结果
     */
    public ClothingRecognitionResult recognizeClothing(String imageUrl) {
        if (!aiProperties.isEnabled()) {
            throw new RuntimeException("AI 识别功能未启用，请在配置文件中设置 litemall.ai.enabled=true");
        }

        if (aiProperties.getApiKey() == null || aiProperties.getApiKey().isEmpty()) {
            throw new RuntimeException("AI 识别功能缺少 API Key，请配置 litemall.ai.api-key");
        }

        // 先下载图片，再转 base64
        byte[] imageBytes = downloadImage(imageUrl);
        String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
        return callMiniMaxApi(imageBase64);
    }

    /**
     * 调用 MiniMax API
     */
    private ClothingRecognitionResult callMiniMaxApi(String imageBase64) {
        try {
            // 构建请求体
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", aiProperties.getModel());

            ArrayNode messages = requestBody.putArray("messages");

            // 系统消息
            ObjectNode systemMessage = messages.addObject();
            systemMessage.put("role", "system");
            systemMessage.put("content", CLOTHING_SYSTEM_PROMPT);

            // 用户消息（包含图片）
            ObjectNode userMessage = messages.addObject();
            userMessage.put("role", "user");
            userMessage.put("content", "请识别这张服装图片: [Image base64:" + imageBase64 + "]");

            String jsonBody = objectMapper.writeValueAsString(requestBody);

            logger.info("调用 MiniMax API: " + aiProperties.getEndpoint());

            // 发送请求
            String response = sendPostRequest(aiProperties.getEndpoint(), jsonBody, aiProperties.getApiKey());

            logger.info("MiniMax API 响应: " + (response.length() > 500 ? response.substring(0, 500) + "..." : response));

            // 解析响应
            return parseResponse(response);

        } catch (Exception e) {
            logger.error("调用 MiniMax API 失败", e);
            throw new RuntimeException("AI 识别失败: " + e.getMessage());
        }
    }

    /**
     * 发送 POST 请求（带 Authorization 头）
     */
    private String sendPostRequest(String urlStr, String body, String apiKey) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setDoOutput(true);
        conn.setDoInput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setConnectTimeout(aiProperties.getTimeout());
        conn.setReadTimeout(aiProperties.getTimeout());

        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
            os.flush();
        }

        int responseCode = conn.getResponseCode();
        InputStream inputStream;

        if (responseCode >= 200 && responseCode < 300) {
            inputStream = conn.getInputStream();
        } else {
            inputStream = conn.getErrorStream();
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        }

        if (responseCode >= 200 && responseCode < 300) {
            return response.toString();
        } else {
            logger.error("MiniMax API 错误响应: " + response);
            throw new RuntimeException("API 请求失败，状态码: " + responseCode + ", 响应: " + response);
        }
    }

    /**
     * 解析 MiniMax API 响应
     */
    private ClothingRecognitionResult parseResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            // 检查是否有错误
            if (root.has("base_resp")) {
                JsonNode baseResp = root.get("base_resp");
                int statusCode = baseResp.get("status_code").asInt();
                if (statusCode != 0) {
                    String statusMsg = baseResp.has("status_msg") ? baseResp.get("status_msg").asText() : "未知错误";
                    throw new RuntimeException("API 返回错误: " + statusMsg);
                }
            }

            // 提取 AI 返回的内容
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // 清理可能的 markdown 代码块标记
            content = content.trim();
            if (content.startsWith("```json")) {
                content = content.substring(7);
            } else if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }
            content = content.trim();

            // 解析 JSON 内容
            JsonNode resultJson = objectMapper.readTree(content);

            ClothingRecognitionResult result = new ClothingRecognitionResult();
            result.setName(getTextValue(resultJson, "name"));
            result.setCategory(getTextValue(resultJson, "category"));
            result.setColor(getTextValue(resultJson, "color"));
            result.setSize(getTextValue(resultJson, "size"));
            result.setMaterial(getTextValue(resultJson, "material"));
            result.setStyle(getTextValue(resultJson, "style"));
            result.setSeason(getTextValue(resultJson, "season"));
            result.setPattern(getTextValue(resultJson, "pattern"));
            result.setBrief(getTextValue(resultJson, "brief"));
            result.setConfidence(getDoubleValue(resultJson, "confidence", 0.8));
            result.setRawResponse(content);

            logger.info("AI 识别结果: " + result);

            return result;

        } catch (Exception e) {
            logger.error("解析 MiniMax API 响应失败: " + response, e);
            throw new RuntimeException("解析 AI 响应失败: " + e.getMessage());
        }
    }

    private String getTextValue(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return "";
    }

    private double getDoubleValue(JsonNode node, String field, double defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asDouble(defaultValue);
        }
        return defaultValue;
    }

    /**
     * 下载图片
     */
    private byte[] downloadImage(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(30000);

            InputStream is = conn.getInputStream();
            try {
                // Java 8 compatible way to read all bytes
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, bytesRead);
                }
                return baos.toByteArray();
            } finally {
                is.close();
            }
        } catch (Exception e) {
            logger.error("下载图片失败: " + imageUrl, e);
            throw new RuntimeException("下载图片失败: " + e.getMessage());
        }
    }

    /**
     * 服装识别结果
     */
    public static class ClothingRecognitionResult {
        private String name;
        private String category;
        private String color;
        private String size;
        private String material;
        private String style;
        private String season;
        private String pattern;
        private String brief;
        private double confidence;
        private String rawResponse;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }

        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }

        public String getMaterial() { return material; }
        public void setMaterial(String material) { this.material = material; }

        public String getStyle() { return style; }
        public void setStyle(String style) { this.style = style; }

        public String getSeason() { return season; }
        public void setSeason(String season) { this.season = season; }

        public String getPattern() { return pattern; }
        public void setPattern(String pattern) { this.pattern = pattern; }

        public String getBrief() { return brief; }
        public void setBrief(String brief) { this.brief = brief; }

        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }

        public String getRawResponse() { return rawResponse; }
        public void setRawResponse(String rawResponse) { this.rawResponse = rawResponse; }

        @Override
        public String toString() {
            return "ClothingRecognitionResult{" +
                    "name='" + name + '\'' +
                    ", category='" + category + '\'' +
                    ", color='" + color + '\'' +
                    ", size='" + size + '\'' +
                    ", material='" + material + '\'' +
                    ", style='" + style + '\'' +
                    ", season='" + season + '\'' +
                    ", pattern='" + pattern + '\'' +
                    ", brief='" + brief + '\'' +
                    ", confidence=" + confidence +
                    '}';
        }

        /**
         * 转换为 Map（方便前端使用）
         */
        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("name", name);
            map.put("category", category);
            map.put("color", color);
            map.put("size", size);
            map.put("material", material);
            map.put("style", style);
            map.put("season", season);
            map.put("pattern", pattern);
            map.put("brief", brief);
            map.put("confidence", confidence);
            return map;
        }
    }
}
