package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.dao.LitemallOrderMapper;
import org.linlinjava.litemall.db.domain.LitemallOrder;
import org.linlinjava.litemall.db.domain.LitemallOrderExample;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallOrderService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.db.util.OrderUtil;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户服务
 */
@RestController
@RequestMapping("/wx/user")
@Validated
public class WxUserController {
    private final Log logger = LogFactory.getLog(WxUserController.class);

    @Autowired
    private LitemallUserService userService;

    @Autowired
    private LitemallOrderService orderService;

    @Autowired
    private LitemallOrderMapper orderMapper;

    /**
     * 用户首页数据（订单统计）
     */
    @GetMapping("index")
    public Object index(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        long unpaid = countByStatus(userId, Collections.singletonList(OrderUtil.STATUS_CREATE));
        long unship = countByStatus(userId, Collections.singletonList(OrderUtil.STATUS_PAY));
        long unrecv = countByStatus(userId, Arrays.asList(OrderUtil.STATUS_SHIP));

        Map<String, Object> order = new HashMap<>();
        order.put("unpaid", unpaid);
        order.put("unship", unship);
        order.put("unrecv", unrecv);

        Map<String, Object> data = new HashMap<>();
        data.put("order", order);
        return ResponseUtil.ok(data);
    }

    private long countByStatus(Integer userId, java.util.List<Short> statusList) {
        LitemallOrderExample example = new LitemallOrderExample();
        example.or().andUserIdEqualTo(userId).andOrderStatusIn(statusList).andDeletedEqualTo(false);
        return orderMapper.countByExample(example);
    }

    /**
     * 获取当前用户信息（包括角色）
     *
     * @param userId 用户ID
     * @return 用户信息
     */
    @GetMapping("info")
    public Object info(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.badArgumentValue();
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("nickname", user.getNickname());
        data.put("avatar", user.getAvatar());
        data.put("mobile", user.getMobile());
        data.put("role", user.getRole() != null ? user.getRole() : "user");
        data.put("storeId", user.getStoreId());
        data.put("guideId", user.getGuideId());

        return ResponseUtil.ok(data);
    }

    /**
     * 获取当前用户角色
     *
     * @param userId 用户ID
     * @return 用户角色
     */
    @GetMapping("role")
    public Object getRole(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.badArgumentValue();
        }

        String role = user.getRole();
        if (role == null || role.isEmpty()) {
            role = "user";
        }

        Map<String, Object> data = new HashMap<>();
        data.put("role", role);
        data.put("isOwner", "owner".equals(role));
        data.put("isGuide", "guide".equals(role));
        data.put("isManager", "owner".equals(role) || "guide".equals(role));

        return ResponseUtil.ok(data);
    }

    /**
     * 检查用户是否有管理权限
     *
     * @param userId 用户ID
     * @return 是否有管理权限
     */
    @GetMapping("isManager")
    public Object isManager(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.badArgumentValue();
        }

        String role = user.getRole();
        boolean isManager = "owner".equals(role) || "guide".equals(role);

        Map<String, Object> data = new HashMap<>();
        data.put("isManager", isManager);
        data.put("role", role != null ? role : "user");

        return ResponseUtil.ok(data);
    }
}
