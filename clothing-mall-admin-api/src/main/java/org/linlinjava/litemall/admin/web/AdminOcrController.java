package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.ocr.OcrService;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.ClothingGoodsSku;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.service.ClothingGoodsSkuService;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * OCR库存识别管理接口
 */
@RestController
@RequestMapping("/admin/ocr")
@Validated
public class AdminOcrController {

    private final Log logger = LogFactory.getLog(AdminOcrController.class);

    @Autowired
    private OcrService ocrService;

    @Autowired
    private ClothingGoodsSkuService skuService;

    @Autowired
    private LitemallGoodsService goodsService;

    /**
     * 识别图片中的库存信息
     */
    @RequiresPermissions("admin:ocr:recognize")
    @RequiresPermissionsDesc(menu = {"服装管理", "OCR识别"}, button = "识别图片")
    @PostMapping("/recognize")
    public Object recognize(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseUtil.fail(400, "请选择要识别的图片");
        }

        try {
            byte[] imageBytes = file.getBytes();
            List<OcrService.InventoryItem> items = ocrService.parseInventoryImage(imageBytes);

            // 为每个识别结果匹配SKU信息
            List<Map<String, Object>> result = new ArrayList<>();
            for (OcrService.InventoryItem item : items) {
                Map<String, Object> map = new HashMap<>();
                map.put("goodsSn", item.getGoodsSn());
                map.put("color", item.getColor());
                map.put("size", item.getSize());
                map.put("quantity", item.getQuantity());

                // 尝试匹配SKU
                List<LitemallGoods> goodsList = goodsService.querySelective(null, item.getGoodsSn(), null, 1, 10, null, null);
                if (!goodsList.isEmpty()) {
                    LitemallGoods goods = goodsList.get(0);
                    map.put("goodsId", goods.getId());
                    map.put("goodsName", goods.getName());

                    // 查询对应的SKU
                    ClothingGoodsSku sku = null;
                    if (!StringUtils.isEmpty(item.getColor()) && !StringUtils.isEmpty(item.getSize())) {
                        sku = skuService.queryByGoodsIdColorSize(goods.getId(), item.getColor(), item.getSize());
                    } else if (!StringUtils.isEmpty(item.getColor())) {
                        List<ClothingGoodsSku> skuList = skuService.queryByGoodsIdAndColor(goods.getId(), item.getColor());
                        if (!skuList.isEmpty()) {
                            sku = skuList.get(0);
                        }
                    }

                    if (sku != null) {
                        map.put("skuId", sku.getId());
                        map.put("currentStock", sku.getStock());
                        map.put("matched", true);
                    } else {
                        map.put("matched", false);
                        map.put("matchMsg", "未找到对应的SKU（颜色:" + item.getColor() + ", 尺码:" + item.getSize() + "）");
                    }
                } else {
                    map.put("matched", false);
                    map.put("matchMsg", "未找到商品编号为 " + item.getGoodsSn() + " 的商品");
                }

                result.add(map);
            }

            return ResponseUtil.ok(result);
        } catch (Exception e) {
            logger.error("OCR识别失败", e);
            return ResponseUtil.fail(500, "OCR识别失败: " + e.getMessage());
        }
    }

    /**
     * 批量更新库存
     */
    @RequiresPermissions("admin:ocr:updateStock")
    @RequiresPermissionsDesc(menu = {"服装管理", "OCR识别"}, button = "批量更新库存")
    @PostMapping("/updateStock")
    public Object updateStock(@RequestBody List<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) {
            return ResponseUtil.fail(400, "没有要更新的数据");
        }

        int successCount = 0;
        int failCount = 0;
        List<Map<String, Object>> failedItems = new ArrayList<>();

        for (Map<String, Object> item : items) {
            try {
                Integer skuId = (Integer) item.get("skuId");
                Integer quantity = (Integer) item.get("quantity");

                if (skuId == null || quantity == null) {
                    failCount++;
                    item.put("errorMsg", "缺少必要参数");
                    failedItems.add(item);
                    continue;
                }

                ClothingGoodsSku sku = skuService.findById(skuId);
                if (sku == null) {
                    failCount++;
                    item.put("errorMsg", "SKU不存在");
                    failedItems.add(item);
                    continue;
                }

                sku.setStock(quantity);
                skuService.update(sku);
                successCount++;

            } catch (Exception e) {
                failCount++;
                item.put("errorMsg", e.getMessage());
                failedItems.add(item);
                logger.error("更新库存失败", e);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("failedItems", failedItems);

        return ResponseUtil.ok(result);
    }
}
