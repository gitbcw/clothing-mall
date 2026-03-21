package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.ClothingGoodsSku;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.service.ClothingGoodsSkuService;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 商品 SKU 管理接口
 */
@RestController
@RequestMapping("/admin/clothing/sku")
@Validated
public class AdminClothingSkuController {
    private final Log logger = LogFactory.getLog(AdminClothingSkuController.class);

    @Autowired
    private ClothingGoodsSkuService skuService;

    @Autowired
    private LitemallGoodsService goodsService;

    @RequiresPermissions("admin:clothing:sku:list")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "查询")
    @GetMapping("/list")
    public Object list(Integer goodsId, String goodsSn, String color, String size,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit) {
        List<ClothingGoodsSku> skuList;
        if (goodsId != null) {
            skuList = skuService.queryByGoodsId(goodsId);
        } else if (goodsSn != null && !goodsSn.trim().isEmpty()) {
            skuList = skuService.queryByGoodsSn(goodsSn);
        } else {
            return ResponseUtil.badArgument();
        }
        return ResponseUtil.okList(skuList);
    }

    @RequiresPermissions("admin:clothing:sku:read")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "详情")
    @GetMapping("/read")
    public Object read(@NotNull Integer id) {
        ClothingGoodsSku sku = skuService.findById(id);
        if (sku == null) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(sku);
    }

    private Object validate(ClothingGoodsSku sku) {
        if (sku.getGoodsId() == null) {
            return ResponseUtil.badArgument();
        }
        if (StringUtils.isEmpty(sku.getColor())) {
            return ResponseUtil.fail(401, "颜色不能为空");
        }
        if (StringUtils.isEmpty(sku.getSize())) {
            return ResponseUtil.fail(401, "尺码不能为空");
        }
        if (sku.getPrice() == null || sku.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseUtil.fail(401, "价格无效");
        }

        // 检查商品是否存在
        LitemallGoods goods = goodsService.findById(sku.getGoodsId());
        if (goods == null) {
            return ResponseUtil.fail(401, "商品不存在");
        }

        // 检查是否已存在相同颜色尺码的 SKU
        ClothingGoodsSku existingSku = skuService.queryByGoodsIdColorSize(
                sku.getGoodsId(), sku.getColor(), sku.getSize());
        if (existingSku != null && !existingSku.getId().equals(sku.getId())) {
            return ResponseUtil.fail(401, "该颜色尺码组合已存在");
        }

        return null;
    }

    @RequiresPermissions("admin:clothing:sku:create")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody ClothingGoodsSku sku) {
        Object error = validate(sku);
        if (error != null) {
            return error;
        }

        if (sku.getStock() == null) {
            sku.setStock(0);
        }
        if (sku.getIsDefault() == null) {
            sku.setIsDefault(false);
        }

        skuService.add(sku);
        return ResponseUtil.ok(sku);
    }

    @RequiresPermissions("admin:clothing:sku:update")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody ClothingGoodsSku sku) {
        if (sku.getId() == null) {
            return ResponseUtil.badArgument();
        }

        ClothingGoodsSku existingSku = skuService.findById(sku.getId());
        if (existingSku == null) {
            return ResponseUtil.badArgumentValue();
        }

        Object error = validate(sku);
        if (error != null) {
            return error;
        }

        if (skuService.update(sku) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok(sku);
    }

    @RequiresPermissions("admin:clothing:sku:delete")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody ClothingGoodsSku sku) {
        Integer id = sku.getId();
        if (id == null) {
            return ResponseUtil.badArgument();
        }
        skuService.delete(id);
        return ResponseUtil.ok();
    }

    @RequiresPermissions("admin:clothing:sku:stock")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "库存调整")
    @PostMapping("/stock")
    public Object updateStock(@NotNull Integer id, @NotNull Integer stock) {
        ClothingGoodsSku sku = skuService.findById(id);
        if (sku == null) {
            return ResponseUtil.badArgumentValue();
        }
        if (stock < 0) {
            return ResponseUtil.fail(401, "库存不能为负数");
        }

        sku.setStock(stock);
        skuService.update(sku);
        return ResponseUtil.ok(sku);
    }
}
