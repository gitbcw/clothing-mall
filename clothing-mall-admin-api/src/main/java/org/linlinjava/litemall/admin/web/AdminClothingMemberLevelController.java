package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.ClothingMemberLevel;
import org.linlinjava.litemall.db.service.ClothingMemberLevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 会员等级管理接口
 */
@RestController
@RequestMapping("/admin/clothing/memberLevel")
@Validated
public class AdminClothingMemberLevelController {
    private final Log logger = LogFactory.getLog(AdminClothingMemberLevelController.class);

    @Autowired
    private ClothingMemberLevelService levelService;

    @RequiresPermissions("admin:clothing:memberLevel:list")
    @RequiresPermissionsDesc(menu = {"服装管理", "会员等级"}, button = "查询")
    @GetMapping("/list")
    public Object list() {
        List<ClothingMemberLevel> levelList = levelService.queryAll();
        return ResponseUtil.okList(levelList);
    }

    @RequiresPermissions("admin:clothing:memberLevel:read")
    @RequiresPermissionsDesc(menu = {"服装管理", "会员等级"}, button = "详情")
    @GetMapping("/read")
    public Object read(@NotNull Integer id) {
        ClothingMemberLevel level = levelService.findById(id);
        if (level == null) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(level);
    }

    private Object validate(ClothingMemberLevel level) {
        if (StringUtils.isEmpty(level.getName())) {
            return ResponseUtil.fail(401, "等级名称不能为空");
        }
        if (level.getMinPoints() == null || level.getMinPoints() < 0) {
            return ResponseUtil.fail(401, "最低积分无效");
        }
        if (level.getDiscountRate() == null ||
            level.getDiscountRate().compareTo(BigDecimal.ZERO) <= 0 ||
            level.getDiscountRate().compareTo(BigDecimal.ONE) > 0) {
            return ResponseUtil.fail(401, "折扣率应在0-1之间");
        }
        if (level.getPointsRate() == null ||
            level.getPointsRate().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseUtil.fail(401, "积分倍率应大于0");
        }
        return null;
    }

    @RequiresPermissions("admin:clothing:memberLevel:create")
    @RequiresPermissionsDesc(menu = {"服装管理", "会员等级"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody ClothingMemberLevel level) {
        Object error = validate(level);
        if (error != null) {
            return error;
        }

        if (level.getSortOrder() == null) {
            level.setSortOrder(0);
        }

        levelService.add(level);
        return ResponseUtil.ok(level);
    }

    @RequiresPermissions("admin:clothing:memberLevel:update")
    @RequiresPermissionsDesc(menu = {"服装管理", "会员等级"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody ClothingMemberLevel level) {
        if (level.getId() == null) {
            return ResponseUtil.badArgument();
        }

        ClothingMemberLevel existingLevel = levelService.findById(level.getId());
        if (existingLevel == null) {
            return ResponseUtil.badArgumentValue();
        }

        Object error = validate(level);
        if (error != null) {
            return error;
        }

        if (levelService.update(level) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok(level);
    }

    @RequiresPermissions("admin:clothing:memberLevel:delete")
    @RequiresPermissionsDesc(menu = {"服装管理", "会员等级"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody ClothingMemberLevel level) {
        Integer id = level.getId();
        if (id == null) {
            return ResponseUtil.badArgument();
        }

        // 检查是否有用户使用该等级（这里简化处理，实际应该检查）
        levelService.delete(id);
        return ResponseUtil.ok();
    }
}
