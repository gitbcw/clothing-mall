package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.ai.TagRecognitionProperties;
import org.linlinjava.litemall.core.ai.TagRecognitionService;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * AI 吊牌识别控制器
 *
 * 使用火山引擎豆包视觉 API 识别吊牌信息。
 * 未启用时返回 Mock 数据。
 */
@RestController
@RequestMapping("/wx/ai")
@Validated
public class WxAiController {
    private final Log logger = LogFactory.getLog(WxAiController.class);

    @Autowired
    private TagRecognitionProperties tagProperties;

    @Autowired
    private TagRecognitionService tagRecognitionService;

    /**
     * AI 服务状态检查
     */
    @GetMapping("status")
    public Object status() {
        Map<String, Object> result = new HashMap<>();
        result.put("enabled", tagProperties.isEnabled());
        result.put("provider", "doubao");
        result.put("message", tagProperties.isEnabled() ? "吊牌识别服务可用" : "吊牌识别未启用，使用 Mock 数据");
        return ResponseUtil.ok(result);
    }

    /**
     * 吊牌图片识别
     * 上传吊牌图片，识别商品名称和一口价
     */
    @PostMapping("recognizeTag")
    public Object recognizeTag(@LoginUser Integer userId, @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseUtil.badArgument();
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseUtil.fail(400, "请上传图片文件");
        }

        try {
            byte[] imageBytes = file.getBytes();
            TagRecognitionService.TagRecognitionResult result = tagRecognitionService.recognizeTag(imageBytes);
            return ResponseUtil.ok(result.toMap());
        } catch (RuntimeException e) {
            logger.error("吊牌识别失败", e);
            return ResponseUtil.fail(500, "吊牌识别失败: " + e.getMessage());
        } catch (Exception e) {
            logger.error("吊牌识别失败", e);
            return ResponseUtil.fail(500, "吊牌识别失败");
        }
    }
}
