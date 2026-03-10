package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallFlashSale;
import org.linlinjava.litemall.db.service.LitemallFlashSaleService;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 限时特卖管理
 */
@RestController
@RequestMapping("/admin/flashSale")
@Validated
public class AdminFlashSaleController {
    private final Log logger = LogFactory.getLog(AdminFlashSaleController.class);

    @Autowired
    private LitemallFlashSaleService flashSaleService;
    @Autowired
    private LitemallGoodsService goodsService;

    @RequiresPermissions("admin:flashSale:list")
    @RequiresPermissionsDesc(menu = {"推广管理", "限时特卖"}, button = "查询")
    @GetMapping("/list")
    public Object list(Integer goodsId, String goodsName, Short status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @Order @RequestParam(defaultValue = "desc") String order) {
        List<LitemallFlashSale> flashSaleList = flashSaleService.querySelective(goodsId, goodsName, status, page, limit, sort, order);
        return ResponseUtil.okList(flashSaleList);
    }

    @RequiresPermissions("admin:flashSale:create")
    @RequiresPermissionsDesc(menu = {"推广管理", "限时特卖"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody LitemallFlashSale flashSale) {
        Object error = validate(flashSale);
        if (error != null) {
            return error;
        }

        // 校验商品是否存在
        if (goodsService.findById(flashSale.getGoodsId()) == null) {
            return ResponseUtil.badArgumentValue();
        }

        flashSaleService.add(flashSale);
        return ResponseUtil.ok(flashSale);
    }

    @RequiresPermissions("admin:flashSale:read")
    @RequiresPermissionsDesc(menu = {"推广管理", "限时特卖"}, button = "详情")
    @GetMapping("/read")
    public Object read(@NotNull Integer id) {
        LitemallFlashSale flashSale = flashSaleService.findById(id);
        if (flashSale == null) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(flashSale);
    }

    @RequiresPermissions("admin:flashSale:update")
    @RequiresPermissionsDesc(menu = {"推广管理", "限时特卖"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallFlashSale flashSale) {
        Object error = validate(flashSale);
        if (error != null) {
            return error;
        }

        if (flashSaleService.updateById(flashSale) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok(flashSale);
    }

    @RequiresPermissions("admin:flashSale:delete")
    @RequiresPermissionsDesc(menu = {"推广管理", "限时特卖"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody LitemallFlashSale flashSale) {
        flashSaleService.deleteById(flashSale.getId());
        return ResponseUtil.ok();
    }

    private Object validate(LitemallFlashSale flashSale) {
        Integer goodsId = flashSale.getGoodsId();
        if (goodsId == null) {
            return ResponseUtil.badArgument();
        }
        String goodsName = flashSale.getGoodsName();
        if (StringUtils.isEmpty(goodsName)) {
            return ResponseUtil.badArgument();
        }
        BigDecimal flashPrice = flashSale.getFlashPrice();
        if (flashPrice == null || flashPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseUtil.badArgument();
        }
        BigDecimal originalPrice = flashSale.getOriginalPrice();
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseUtil.badArgument();
        }
        Integer flashStock = flashSale.getFlashStock();
        if (flashStock == null || flashStock < 0) {
            return ResponseUtil.badArgument();
        }
        if (flashSale.getStartTime() == null || flashSale.getEndTime() == null) {
            return ResponseUtil.badArgument();
        }
        return null;
    }
}
