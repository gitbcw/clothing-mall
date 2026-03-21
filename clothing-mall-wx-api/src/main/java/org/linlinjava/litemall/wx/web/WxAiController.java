package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.system.AiConfig;
import org.linlinjava.litemall.core.util.JacksonUtil;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallStorage;
import org.linlinjava.litemall.db.service.LitemallStorageService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * AI 服装识别控制器
 *
 * 目前为 Mock 实现，返回模拟数据。
 * 需要配置多模态 LLM API Key（如 OpenAI、百度、阿里等）才能使用真实识别功能。
 */
@RestController
@RequestMapping("/wx/ai")
@Validated
public class WxAiController {
    private final Log logger = LogFactory.getLog(WxAiController.class);

    @Autowired
    private LitemallStorageService storageService;

    @Autowired
    private AiConfig aiConfig;

    /**
     * AI 服务状态检查
     */
    @GetMapping("status")
    public Object status() {
        Map<String, Object> result = new HashMap<>();
        result.put("enabled", aiConfig.isEnabled());
        result.put("provider", aiConfig.getProvider());
        result.put("message", aiConfig.isEnabled() ? "AI 服务可用" : "AI 服务未配置，使用 Mock 数据");
        return ResponseUtil.ok(result);
    }

    /**
     * 通过图片 URL 识别服装
     *
     * @param userId 用户ID
     * @param body   请求体，{ imageUrl: "xxx" }
     * @return 识别结果
     */
    @PostMapping("recognizeByUrl")
    public Object recognizeByUrl(@LoginUser Integer userId, @RequestBody String body) {
        String imageUrl = JacksonUtil.parseString(body, "imageUrl");
        if (imageUrl == null || imageUrl.isEmpty()) {
            return ResponseUtil.badArgument();
        }

        // 检查是否配置了真实 AI 服务
        if (!aiConfig.isEnabled()) {
            return ResponseUtil.ok(getMockRecognitionResult(imageUrl));
        }

        // TODO: 调用真实 AI 服务
        // 这里需要配置多模态 LLM API（如 OpenAI GPT-4 Vision、百度文心、阿里通义等）
        // 示例代码结构：
        // if ("openai".equals(aiConfig.getProvider())) {
        //     return callOpenAI(imageUrl);
        // } else if ("baidu".equals(aiConfig.getProvider())) {
        //     return callBaiduAI(imageUrl);
        // }

        return ResponseUtil.ok(getMockRecognitionResult(imageUrl));
    }

    /**
     * 通过上传图片识别服装
     *
     * @param userId 用户ID
     * @param body   请求体，{ storageId: xxx } 或 { fileKey: xxx }
     * @return 识别结果
     */
    @PostMapping("recognize")
    public Object recognize(@LoginUser Integer userId, @RequestBody String body) {
        Integer storageId = JacksonUtil.parseInteger(body, "storageId");
        String fileKey = JacksonUtil.parseString(body, "fileKey");

        String imageUrl = null;

        // 通过 storageId 获取图片 URL
        if (storageId != null) {
            LitemallStorage storage = storageService.findById(storageId);
            if (storage != null) {
                imageUrl = storage.getUrl();
            }
        }

        // 或直接使用 fileKey
        if (imageUrl == null && fileKey != null) {
            // 假设 fileKey 是相对于存储服务的路径
            imageUrl = fileKey; // 实际应拼接完整 URL
        }

        if (imageUrl == null) {
            return ResponseUtil.badArgument();
        }

        if (!aiConfig.isEnabled()) {
            return ResponseUtil.ok(getMockRecognitionResult(imageUrl));
        }

        return ResponseUtil.ok(getMockRecognitionResult(imageUrl));
    }

    /**
     * 生成 Mock 识别结果
     * 用于前端开发测试，真实环境需配置 AI API
     */
    private Map<String, Object> getMockRecognitionResult(String imageUrl) {
        Map<String, Object> result = new HashMap<>();

        // 随机生成一些测试数据
        String[] categories = {"上衣", "裤装", "裙装", "外套", "连衣裙", "配饰"};
        String[] colors = {"黑色", "白色", "灰色", "蓝色", "红色", "绿色"};
        String[] sizes = {"S", "M", "L", "XL", "均码"};
        String[] materials = {"棉", "涤纶", "丝绸", "羊毛", "混纺", "麻"};
        String[] styles = {"休闲", "正式", "运动", "复古", "潮流", "简约"};
        String[] seasons = {"春季", "夏季", "秋季", "冬季", "四季"};
        String[] patterns = {"纯色", "条纹", "格子", "印花", "拼接"};

        Random random = new Random();

        result.put("name", "AI识别商品-" + System.currentTimeMillis() % 10000);
        result.put("category", categories[random.nextInt(categories.length)]);
        result.put("color", colors[random.nextInt(colors.length)]);
        result.put("size", sizes[random.nextInt(sizes.length)]);
        result.put("material", materials[random.nextInt(materials.length)]);
        result.put("style", styles[random.nextInt(styles.length)]);
        result.put("season", seasons[random.nextInt(seasons.length)]);
        result.put("pattern", patterns[random.nextInt(patterns.length)]);
        result.put("brief", "这是一件" + result.get("color") + "的" + result.get("style") + "风格" + result.get("category"));
        result.put("confidence", 75 + random.nextInt(20)); // 75-95
        result.put("imageUrl", imageUrl);
        result.put("isMock", true);

        return result;
    }
}
