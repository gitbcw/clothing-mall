package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallFullReduction;
import org.linlinjava.litemall.db.service.LitemallFullReductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 满减活动管理
 */
@RestController
@RequestMapping("/admin/fullReduction")
@Validated
public class AdminFullReductionController {
    private final Log logger = LogFactory.getLog(AdminFullReductionController.class);

    @Autowired
    private LitemallFullReductionService fullReductionService;

    @RequiresPermissions("admin:fullReduction:list")
    @RequiresPermissionsDesc(menu = {"推广管理", "满减活动"}, button = "查询")
    @GetMapping("/list")
    public Object list(String name, Short status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @Order @RequestParam(defaultValue = "desc") String order) {
        List<LitemallFullReduction> reductionList = fullReductionService.querySelective(name, status, page, limit, sort, order);
        return ResponseUtil.okList(reductionList);
    }

    @RequiresPermissions("admin:fullReduction:create")
    @RequiresPermissionsDesc(menu = {"推广管理", "满减活动"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody LitemallFullReduction fullReduction) {
        Object error = validate(fullReduction);
        if (error != null) {
            return error;
        }

        fullReductionService.add(fullReduction);
        return ResponseUtil.ok(fullReduction);
    }

    @RequiresPermissions("admin:fullReduction:read")
    @RequiresPermissionsDesc(menu = {"推广管理", "满减活动"}, button = "详情")
    @GetMapping("/read")
    public Object read(@NotNull Integer id) {
        LitemallFullReduction fullReduction = fullReductionService.findById(id);
        if (fullReduction == null) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(fullReduction);
    }

    @RequiresPermissions("admin:fullReduction:update")
    @RequiresPermissionsDesc(menu = {"推广管理", "满减活动"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallFullReduction fullReduction) {
        Object error = validate(fullReduction);
        if (error != null) {
            return error;
        }

        if (fullReductionService.updateById(fullReduction) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok(fullReduction);
    }

    @RequiresPermissions("admin:fullReduction:delete")
    @RequiresPermissionsDesc(menu = {"推广管理", "满减活动"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody LitemallFullReduction fullReduction) {
        fullReductionService.deleteById(fullReduction.getId());
        return ResponseUtil.ok();
    }

    private Object validate(LitemallFullReduction fullReduction) {
        String name = fullReduction.getName();
        if (StringUtils.isEmpty(name)) {
            return ResponseUtil.badArgument();
        }
        BigDecimal threshold = fullReduction.getThreshold();
        if (threshold == null || threshold.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseUtil.badArgument();
        }
        BigDecimal discount = fullReduction.getDiscount();
        if (discount == null || discount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseUtil.badArgument();
        }
        // 校验减免金额不能超过门槛
        if (discount.compareTo(threshold) >= 0) {
            return ResponseUtil.fail(403, "减免金额不能大于等于门槛金额");
        }
        return null;
    }
}
