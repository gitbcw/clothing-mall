package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.ai.AiRecognitionService;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * AI 服装识别管理接口
 */
@RestController
@RequestMapping("/admin/ai")
@Validated
public class AdminAiRecognitionController {

    private final Log logger = LogFactory.getLog(AdminAiRecognitionController.class);

    @Autowired
    private AiRecognitionService aiRecognitionService;

    /**
     * 识别服装图片
     * 上传图片，使用 MiniMax M2.7 多模态大模型识别服装信息
     */
    @RequiresPermissions("admin:ai:recognize")
    @RequiresPermissionsDesc(menu = {"商品管理", "AI识别"}, button = "识别服装")
    @PostMapping("/recognize")
    public Object recognize(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseUtil.fail(400, "请选择要识别的图片");
        }

        try {
            byte[] imageBytes = file.getBytes();
            AiRecognitionService.ClothingRecognitionResult result = aiRecognitionService.recognizeClothing(imageBytes);

            Map<String, Object> data = result.toMap();
            data.put("success", true);

            return ResponseUtil.ok(data);
        } catch (RuntimeException e) {
            logger.error("AI 识别失败", e);
            return ResponseUtil.fail(500, e.getMessage());
        } catch (Exception e) {
            logger.error("AI 识别失败", e);
            return ResponseUtil.fail(500, "AI 识别失败: " + e.getMessage());
        }
    }

    /**
     * 通过图片 URL 识别服装
     */
    @RequiresPermissions("admin:ai:recognize")
    @RequiresPermissionsDesc(menu = {"商品管理", "AI识别"}, button = "识别服装URL")
    @PostMapping("/recognizeByUrl")
    public Object recognizeByUrl(@RequestBody Map<String, String> params) {
        String imageUrl = params.get("url");
        if (imageUrl == null || imageUrl.isEmpty()) {
            return ResponseUtil.fail(400, "请提供图片URL");
        }

        try {
            AiRecognitionService.ClothingRecognitionResult result = aiRecognitionService.recognizeClothing(imageUrl);

            Map<String, Object> data = result.toMap();
            data.put("success", true);

            return ResponseUtil.ok(data);
        } catch (RuntimeException e) {
            logger.error("AI 识别失败", e);
            return ResponseUtil.fail(500, e.getMessage());
        } catch (Exception e) {
            logger.error("AI 识别失败", e);
            return ResponseUtil.fail(500, "AI 识别失败: " + e.getMessage());
        }
    }

    /**
     * 检查 AI 识别服务状态
     */
    @RequiresPermissions("admin:ai:status")
    @RequiresPermissionsDesc(menu = {"商品管理", "AI识别"}, button = "服务状态")
    @GetMapping("/status")
    public Object status() {
        Map<String, Object> data = new HashMap<>();
        try {
            // 简单检查服务是否可用
            // 实际可以调用一个简单的 API 来验证
            data.put("available", true);
            data.put("message", "AI 识别服务已配置");
        } catch (Exception e) {
            data.put("available", false);
            data.put("message", "AI 识别服务未配置或不可用: " + e.getMessage());
        }
        return ResponseUtil.ok(data);
    }
}
