package org.linlinjava.litemall.admin.web;

import com.github.pagehelper.PageInfo;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.ClothingGoodsSku;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.service.ClothingGoodsSkuService;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.linlinjava.litemall.db.util.OrderUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品 SKU 管理接口
 * 支持独立 SKU 库、AI 识别、草稿状态
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
    public Object list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer goodsId,
            @RequestParam(required = false) String goodsSn,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "update_time") String sort,
            @RequestParam(defaultValue = "desc") String order) {

        // 兼容旧接口：通过 goodsId 或 goodsSn 查询
        if (goodsId != null || !StringUtils.isEmpty(goodsSn)) {
            List<ClothingGoodsSku> skuList;
            if (goodsId != null) {
                skuList = skuService.queryByGoodsId(goodsId);
            } else {
                skuList = skuService.queryByGoodsSn(goodsSn);
            }
            return ResponseUtil.okList(skuList);
        }

        // 新接口：支持独立 SKU 查询
        List<ClothingGoodsSku> skuList = skuService.querySkuList(
                status, categoryId, color, size, keyword, null, null, page, limit);

        // 兼容 PageHelper 的分页信息
        long total = PageInfo.of(skuList).getTotal();

        Map<String, Object> data = new HashMap<>();
        data.put("total", total);
        data.put("list", skuList);

        return ResponseUtil.ok(data);
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
        // 颜色必填
        if (StringUtils.isEmpty(sku.getColor())) {
            return ResponseUtil.fail(401, "颜色不能为空");
        }
        // 尺码必填
        if (StringUtils.isEmpty(sku.getSize())) {
            return ResponseUtil.fail(401, "尺码不能为空");
        }
        // 价格必填且非负
        if (sku.getPrice() == null || sku.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseUtil.fail(401, "价格无效");
        }

        // 如果关联了商品，检查商品是否存在
        if (sku.getGoodsId() != null) {
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

        // 设置默认值
        if (sku.getStock() == null) {
            sku.setStock(0);
        }
        if (sku.getIsDefault() == null) {
            sku.setIsDefault(false);
        }
        if (sku.getStatus() == null) {
            sku.setStatus(ClothingGoodsSku.STATUS_ACTIVE);
        }
        if (sku.getAiRecognized() == null) {
            sku.setAiRecognized(false);
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
    public Object updateStock(@RequestBody Map<String, Object> params) {
        Integer id = (Integer) params.get("id");
        Integer adjustNum = (Integer) params.get("adjustNum");
        Integer stock = (Integer) params.get("stock");

        if (id == null) {
            return ResponseUtil.badArgument();
        }

        ClothingGoodsSku sku = skuService.findById(id);
        if (sku == null) {
            return ResponseUtil.badArgumentValue();
        }

        // 支持两种方式：直接设置库存 或 增量调整
        if (adjustNum != null) {
            int newStock = sku.getStock() + adjustNum;
            if (newStock < 0) {
                return ResponseUtil.fail(401, "库存不能为负数");
            }
            sku.setStock(newStock);
        } else if (stock != null) {
            if (stock < 0) {
                return ResponseUtil.fail(401, "库存不能为负数");
            }
            sku.setStock(stock);
        } else {
            return ResponseUtil.badArgument();
        }

        skuService.update(sku);
        return ResponseUtil.ok(sku);
    }

    @RequiresPermissions("admin:clothing:sku:bind")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "关联商品")
    @PostMapping("/bindGoods")
    public Object bindGoods(@RequestBody Map<String, Object> params) {
        List<Integer> ids = (List<Integer>) params.get("ids");
        Integer goodsId = (Integer) params.get("goodsId");

        if (ids == null || ids.isEmpty()) {
            return ResponseUtil.badArgument();
        }

        if (goodsId == null) {
            return ResponseUtil.fail(401, "商品ID不能为空");
        }

        LitemallGoods goods = goodsService.findById(goodsId);
        if (goods == null) {
            return ResponseUtil.fail(401, "商品不存在");
        }

        // 批量绑定商品（SKU 状态保持不变，上架/下架由商品控制）
        skuService.bindGoodsBatch(ids, goodsId);

        return ResponseUtil.ok();
    }

    @RequiresPermissions("admin:clothing:sku:status")
    @RequiresPermissionsDesc(menu = {"服装管理", "SKU管理"}, button = "更新状态")
    @PostMapping("/status")
    public Object updateStatus(@RequestBody Map<String, Object> params) {
        List<Integer> ids = (List<Integer>) params.get("ids");
        String status = (String) params.get("status");

        if (ids == null || ids.isEmpty()) {
            return ResponseUtil.badArgument();
        }

        if (StringUtils.isEmpty(status) ||
            (!status.equals(ClothingGoodsSku.STATUS_ACTIVE) && !status.equals(ClothingGoodsSku.STATUS_INACTIVE))) {
            return ResponseUtil.fail(401, "状态参数无效");
        }

        skuService.updateStatusBatch(ids, status);
        return ResponseUtil.ok();
    }
}
