package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.system.SystemConfig;
import org.linlinjava.litemall.core.system.WeWorkService;
import org.linlinjava.litemall.core.util.JacksonUtil;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

/**
 * 企业微信小程序卡片推送控制器
 */
@RestController
@RequestMapping("/admin/wework")
@Validated
public class AdminWeWorkController {
    private final Log logger = LogFactory.getLog(AdminWeWorkController.class);

    @Autowired
    private WeWorkService weWorkService;

    /**
     * 获取企业微信标签列表
     */
    @RequiresPermissions("admin:wework:list")
    @RequiresPermissionsDesc(menu = {"企业微信", "消息推送"}, button = "查看标签")
    @GetMapping("/tags")
    public Object getTags() {
        List<Map<String, Object>> tags = weWorkService.getCorpTagList();
        if (tags == null) {
            return ResponseUtil.fail(500, "获取企业微信标签列表失败，请检查企业微信配置");
        }
        return ResponseUtil.okList(tags);
    }

    /**
     * 获取可用的小程序跳转页面列表（固定页面 + 配置的活动页面）
     */
    @RequiresPermissions("admin:wework:list")
    @RequiresPermissionsDesc(menu = {"企业微信", "消息推送"}, button = "查看页面")
    @GetMapping("/pages")
    public Object getPages() {
        List<Map<String, String>> pages = new ArrayList<>();

        // 固定页面
        pages.add(createPageItem("首页", "pages/index/index"));
        pages.add(createPageItem("商品分类", "pages/catalog/catalog"));
        pages.add(createPageItem("新品推荐", "pages/newGoods/newGoods"));
        pages.add(createPageItem("热门商品", "pages/hotGoods/hotGoods"));
        pages.add(createPageItem("个人中心", "pages/ucenter/index/index"));
        pages.add(createPageItem("限时特卖", "pages/flashSale/flashSale"));
        pages.add(createPageItem("优惠券中心", "pages/coupon/coupon"));

        // 从配置读取活动页面
        String activityPagesJson = SystemConfig.getWeWorkActivityPages();
        if (activityPagesJson != null && !activityPagesJson.isEmpty()) {
            try {
                List<Map> activityPages = JacksonUtil.fromJson(activityPagesJson, List.class);
                if (activityPages != null) {
                    for (Map item : activityPages) {
                        Map<String, String> pageItem = new HashMap<>();
                        pageItem.put("name", (String) item.get("name"));
                        pageItem.put("path", (String) item.get("path"));
                        pages.add(pageItem);
                    }
                }
            } catch (Exception e) {
                logger.error("解析活动页面配置失败", e);
            }
        }

        return ResponseUtil.okList(pages);
    }

    private Map<String, String> createPageItem(String name, String path) {
        Map<String, String> item = new HashMap<>();
        item.put("name", name);
        item.put("path", path);
        return item;
    }

    /**
     * 上传图片到企业微信素材库
     */
    @RequiresPermissions("admin:wework:upload")
    @RequiresPermissionsDesc(menu = {"企业微信", "消息推送"}, button = "上传素材")
    @PostMapping("/uploadMedia")
    public Object uploadMedia(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseUtil.badArgumentValue();
        }

        String originalFilename = file.getOriginalFilename();
        String mediaId = weWorkService.uploadMedia(
                file.getInputStream(),
                originalFilename,
                file.getSize(),
                "image"
        );

        if (mediaId == null) {
            return ResponseUtil.fail(500, "上传素材到企业微信失败");
        }

        Map<String, String> result = new HashMap<>();
        result.put("mediaId", mediaId);
        result.put("filename", originalFilename);
        return ResponseUtil.ok(result);
    }

    /**
     * 按标签群发小程序卡片
     */
    @RequiresPermissions("admin:wework:send")
    @RequiresPermissionsDesc(menu = {"企业微信", "消息推送"}, button = "发送卡片")
    @PostMapping("/sendCard")
    public Object sendCard(@RequestBody String body) {
        String tagId = JacksonUtil.parseString(body, "tagId");
        String title = JacksonUtil.parseString(body, "title");
        String mediaId = JacksonUtil.parseString(body, "mediaId");
        String page = JacksonUtil.parseString(body, "page");

        if (tagId == null || tagId.isEmpty()) {
            return ResponseUtil.fail(402, "请选择要发送的客户标签");
        }
        if (title == null || title.isEmpty()) {
            return ResponseUtil.fail(402, "请输入卡片标题");
        }
        if (mediaId == null || mediaId.isEmpty()) {
            return ResponseUtil.fail(402, "请上传封面图片");
        }
        if (page == null || page.isEmpty()) {
            return ResponseUtil.fail(402, "请选择跳转页面");
        }

        boolean success = weWorkService.sendMiniProgramCardByTag(tagId, title, mediaId, null, page);
        if (success) {
            return ResponseUtil.ok();
        } else {
            return ResponseUtil.fail(500, "发送小程序卡片失败，请检查企业微信配置");
        }
    }
}
