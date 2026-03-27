package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.ClothingGoodsSku;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.ClothingGoodsSkuService;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 小程序管理端商品控制器
 * 提供给店主/导购使用的商品管理接口
 */
@RestController
@RequestMapping("/wx/manager/goods")
@Validated
public class WxManagerGoodsController {
    private final Log logger = LogFactory.getLog(WxManagerGoodsController.class);

    @Autowired
    private LitemallGoodsService goodsService;

    @Autowired
    private LitemallUserService userService;

    @Autowired
    private ClothingGoodsSkuService clothingGoodsSkuService;

    /**
     * 检查用户是否有管理权限
     */
    private Object checkManager(Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.badArgumentValue();
        }
        String role = user.getRole();
        if (role == null) {
            role = "user";
        }
        if (!"owner".equals(role) && !"guide".equals(role)) {
            return ResponseUtil.fail(403, "无管理权限");
        }
        return null;
    }

    /**
     * 一键下架全部商品（换季下架）
     */
    @PostMapping("/unpublishAll")
    public Object unpublishAll(@LoginUser Integer userId) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }
        goodsService.updateAllStatus(LitemallGoods.STATUS_PENDING);
        return ResponseUtil.ok();
    }

    /**
     * 快速创建商品草稿（手机端拍照录入）
     */
    @Transactional
    @PostMapping("/create")
    public Object create(@LoginUser Integer userId, @RequestBody Map<String, Object> body) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }

        String name = (String) body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseUtil.badArgument();
        }

        // 创建商品
        LitemallGoods goods = new LitemallGoods();
        goods.setName(name.trim());

        Object categoryIdObj = body.get("categoryId");
        if (categoryIdObj != null) {
            goods.setCategoryId((Integer) categoryIdObj);
        }

        goods.setBrief((String) body.get("brief"));

        // 图片：优先用 picUrl，没有则用 sourceImage
        String picUrl = (String) body.get("picUrl");
        String sourceImage = (String) body.get("sourceImage");
        if (picUrl != null && !picUrl.isEmpty()) {
            goods.setPicUrl(picUrl);
        } else if (sourceImage != null && !sourceImage.isEmpty()) {
            goods.setPicUrl(sourceImage);
        }

        Object galleryObj = body.get("gallery");
        if (galleryObj instanceof List) {
            goods.setGallery(((List<String>) galleryObj).toArray(new String[0]));
        }
        goods.setStatus(LitemallGoods.STATUS_DRAFT);
        goods.setIsOnSale(false);
        goods.setDeleted(false);
        goodsService.add(goods);

        // 创建附属 SKU（可选）
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skus = (List<Map<String, Object>>) body.get("skus");
        if (skus != null && !skus.isEmpty()) {
            BigDecimal minPrice = null;
            for (Map<String, Object> skuMap : skus) {
                ClothingGoodsSku sku = new ClothingGoodsSku();
                sku.setGoodsId(goods.getId());
                sku.setColor((String) skuMap.get("color"));
                sku.setSize((String) skuMap.get("size"));

                Object priceObj = skuMap.get("price");
                if (priceObj != null) {
                    BigDecimal price = new BigDecimal(priceObj.toString());
                    sku.setPrice(price);
                    if (minPrice == null || minPrice.compareTo(price) > 0) {
                        minPrice = price;
                    }
                }

                Object stockObj = skuMap.get("stock");
                if (stockObj != null) {
                    sku.setStock(((Number) stockObj).intValue());
                }

                sku.setStatus(ClothingGoodsSku.STATUS_ACTIVE);
                sku.setDeleted(false);
                clothingGoodsSkuService.add(sku);
            }

            // 更新商品最低零售价
            if (minPrice != null) {
                goods.setRetailPrice(minPrice);
                goodsService.updateById(goods);
            }
        }

        return ResponseUtil.ok(goods.getId());
    }
}
