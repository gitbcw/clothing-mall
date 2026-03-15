package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.admin.vo.StatVo;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.service.StatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/stat")
@Validated
public class AdminStatController {
    private final Log logger = LogFactory.getLog(AdminStatController.class);

    @Autowired
    private StatService statService;

    @RequiresPermissions("admin:stat:user")
    @RequiresPermissionsDesc(menu = {"统计管理", "用户统计"}, button = "查询")
    @GetMapping("/user")
    public Object statUser() {
        List<Map> rows = statService.statUser();
        String[] columns = new String[]{"day", "users"};
        StatVo statVo = new StatVo();
        statVo.setColumns(columns);
        statVo.setRows(rows);
        return ResponseUtil.ok(statVo);
    }

    @RequiresPermissions("admin:stat:order")
    @RequiresPermissionsDesc(menu = {"统计管理", "订单统计"}, button = "查询")
    @GetMapping("/order")
    public Object statOrder() {
        List<Map> rows = statService.statOrder();
        String[] columns = new String[]{"day", "orders", "customers", "amount", "pcr"};
        StatVo statVo = new StatVo();
        statVo.setColumns(columns);
        statVo.setRows(rows);

        return ResponseUtil.ok(statVo);
    }

    @RequiresPermissions("admin:stat:goods")
    @RequiresPermissionsDesc(menu = {"统计管理", "商品统计"}, button = "查询")
    @GetMapping("/goods")
    public Object statGoods() {
        List<Map> rows = statService.statGoods();
        String[] columns = new String[]{"day", "orders", "products", "amount"};
        StatVo statVo = new StatVo();
        statVo.setColumns(columns);
        statVo.setRows(rows);
        return ResponseUtil.ok(statVo);
    }

    // ==================== 增长统计 API ====================

    @RequiresPermissions("admin:stat:growth")
    @RequiresPermissionsDesc(menu = {"统计管理", "增长统计"}, button = "查询")
    @GetMapping("/growth")
    public Object statGrowth(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        // 新增用户
        List<Map> newUsers = statService.statNewUsers(startDate, endDate);
        // 日活用户
        List<Map> dau = statService.statDailyActiveUsers(startDate, endDate);
        // 累计用户
        Map totalUsers = statService.statTotalUsers();

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("newUsers", newUsers);
        result.put("dau", dau);
        result.put("totalUsers", totalUsers != null ? totalUsers.get("totalUsers") : 0);
        return ResponseUtil.ok(result);
    }

    @RequiresPermissions("admin:stat:growth")
    @RequiresPermissionsDesc(menu = {"统计管理", "增长统计"}, button = "留存查询")
    @GetMapping("/retention")
    public Object statRetention(
            @RequestParam String cohortDate,
            @RequestParam(defaultValue = "1") int dayOffset) {
        List<Map> retention = statService.statRetentionUsers(cohortDate, dayOffset);
        return ResponseUtil.ok(retention);
    }

}
