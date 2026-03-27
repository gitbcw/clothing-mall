package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
}
