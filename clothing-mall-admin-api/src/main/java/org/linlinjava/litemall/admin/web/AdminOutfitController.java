package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallOutfit;
import org.linlinjava.litemall.db.service.LitemallOutfitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 穿搭推荐管理
 */
@RestController
@RequestMapping("/admin/outfit")
@Validated
public class AdminOutfitController {
    private final Log logger = LogFactory.getLog(AdminOutfitController.class);

    @Autowired
    private LitemallOutfitService outfitService;

    @RequiresPermissions("admin:outfit:list")
    @RequiresPermissionsDesc(menu = {"推广管理", "穿搭推荐"}, button = "查询")
    @GetMapping("/list")
    public Object list(String title, Short status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "sort_order") String sort,
                       @Order @RequestParam(defaultValue = "asc") String order) {
        List<LitemallOutfit> outfitList = outfitService.querySelective(title, status, page, limit, sort, order);
        return ResponseUtil.okList(outfitList);
    }

    @RequiresPermissions("admin:outfit:create")
    @RequiresPermissionsDesc(menu = {"推广管理", "穿搭推荐"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody LitemallOutfit outfit) {
        Object error = validate(outfit);
        if (error != null) {
            return error;
        }

        outfitService.add(outfit);
        return ResponseUtil.ok(outfit);
    }

    @RequiresPermissions("admin:outfit:read")
    @RequiresPermissionsDesc(menu = {"推广管理", "穿搭推荐"}, button = "详情")
    @GetMapping("/read")
    public Object read(@NotNull Integer id) {
        LitemallOutfit outfit = outfitService.findById(id);
        if (outfit == null) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(outfit);
    }

    @RequiresPermissions("admin:outfit:update")
    @RequiresPermissionsDesc(menu = {"推广管理", "穿搭推荐"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallOutfit outfit) {
        Object error = validate(outfit);
        if (error != null) {
            return error;
        }

        if (outfitService.updateById(outfit) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok(outfit);
    }

    @RequiresPermissions("admin:outfit:delete")
    @RequiresPermissionsDesc(menu = {"推广管理", "穿搭推荐"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody LitemallOutfit outfit) {
        outfitService.deleteById(outfit.getId());
        return ResponseUtil.ok();
    }

    private Object validate(LitemallOutfit outfit) {
        String title = outfit.getTitle();
        if (StringUtils.isEmpty(title)) {
            return ResponseUtil.badArgument();
        }
        String coverPic = outfit.getCoverPic();
        if (StringUtils.isEmpty(coverPic)) {
            return ResponseUtil.badArgument();
        }
        return null;
    }
}
