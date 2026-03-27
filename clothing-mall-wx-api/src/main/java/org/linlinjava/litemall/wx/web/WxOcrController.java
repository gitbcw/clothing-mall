package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 小程序端OCR库存识别接口
 * 用于小程序上传库存截图，识别后自动更新SKU库存
 */
@RestController
@RequestMapping("/wx/ocr")
@Validated
public class WxOcrController {

    private final Log logger = LogFactory.getLog(WxOcrController.class);

    @Autowired
    private OcrService ocrService;

    @Autowired
    private ClothingGoodsSkuService skuService;

    @Autowired
    private LitemallGoodsService goodsService;

    /**
     * 识别图片并更新库存
     * 小程序上传库存截图，自动识别并更新SKU库存
     *
     * 请求方式：POST /wx/ocr/recognize
     * 参数：file - 图片文件
     *
     * 返回：识别结果列表，包含匹配状态和更新结果
     */
    @PostMapping("/recognize")
    public Object recognize(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseUtil.fail(400, "请选择要识别的图片");
        }

        try {
            // 1. 调用OCR识别图片
            byte[] imageBytes = file.getBytes();
            List<OcrService.InventoryItem> items = ocrService.parseInventoryImage(imageBytes);

            if (items == null || items.isEmpty()) {
                return ResponseUtil.fail(400, "未识别到库存信息，请确保图片包含商品编号和数量");
            }

            // 2. 遍历识别结果，匹配商品并更新库存
            List<Map<String, Object>> result = new ArrayList<>();
            int successCount = 0;
            int failCount = 0;

            for (OcrService.InventoryItem item : items) {
                Map<String, Object> map = new HashMap<>();
                map.put("goodsSn", item.getGoodsSn());
                map.put("color", item.getColor());
                map.put("size", item.getSize());
                map.put("quantity", item.getQuantity());

                // 通过款号匹配商品
                List<LitemallGoods> goodsList = goodsService.querySelective(null, item.getGoodsSn(), null, null, 1, 10, null, null);

                if (goodsList.isEmpty()) {
                    map.put("matched", false);
                    map.put("message", "未找到款号为 " + item.getGoodsSn() + " 的商品");
                    map.put("updated", false);
                    failCount++;
                    result.add(map);
                    continue;
                }

                LitemallGoods goods = goodsList.get(0);
                map.put("goodsId", goods.getId());
                map.put("goodsName", goods.getName());

                // 匹配SKU
                ClothingGoodsSku sku = null;
                if (!StringUtils.isEmpty(item.getColor()) && !StringUtils.isEmpty(item.getSize())) {
                    sku = skuService.queryByGoodsIdColorSize(goods.getId(), item.getColor(), item.getSize());
                } else if (!StringUtils.isEmpty(item.getColor())) {
                    // 如果没有尺码，尝试只按颜色匹配
                    List<ClothingGoodsSku> skuList = skuService.queryByGoodsIdAndColor(goods.getId(), item.getColor());
                    if (!skuList.isEmpty()) {
                        sku = skuList.get(0);
                    }
                } else {
                    // 如果没有颜色信息，取第一个SKU
                    List<ClothingGoodsSku> skuList = skuService.queryByGoodsId(goods.getId());
                    if (!skuList.isEmpty()) {
                        sku = skuList.get(0);
                    }
                }

                if (sku == null) {
                    map.put("matched", false);
                    map.put("message", "未找到对应的SKU（颜色:" + item.getColor() + ", 尺码:" + item.getSize() + "）");
                    map.put("updated", false);
                    failCount++;
                    result.add(map);
                    continue;
                }

                map.put("skuId", sku.getId());
                map.put("color", sku.getColor());
                map.put("size", sku.getSize());
                map.put("oldStock", sku.getStock());

                // 更新库存
                sku.setStock(item.getQuantity());
                skuService.update(sku);

                map.put("newStock", item.getQuantity());
                map.put("matched", true);
                map.put("updated", true);
                map.put("message", "库存更新成功");
                successCount++;

                result.add(map);
            }

            // 3. 返回结果
            Map<String, Object> response = new HashMap<>();
            response.put("items", result);
            response.put("total", items.size());
            response.put("successCount", successCount);
            response.put("failCount", failCount);

            return ResponseUtil.ok(response);

        } catch (Exception e) {
            logger.error("OCR识别失败", e);
            return ResponseUtil.fail(500, "OCR识别失败: " + e.getMessage());
        }
    }
}
