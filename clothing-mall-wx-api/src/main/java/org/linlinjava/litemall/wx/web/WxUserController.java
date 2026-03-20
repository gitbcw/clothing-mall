package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallOrderService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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
    private LitemallOrderService orderService;

    @Autowired
    private LitemallUserService userService;

    /**
     * 用户个人页面数据
     * <p>
     * 目前是用户订单统计信息
     *
     * @param userId 用户ID
     * @return 用户个人页面数据
     */
    @GetMapping("index")
    public Object list(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        Map<Object, Object> data = new HashMap<Object, Object>();
        data.put("order", orderService.orderInfo(userId));
        return ResponseUtil.ok(data);
    }

    /**
     * 获取用户信息
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
        data.put("nickname", user.getNickname());
        data.put("avatar", user.getAvatar());
        data.put("gender", user.getGender());
        data.put("birthday", user.getBirthday());
        data.put("mobile", user.getMobile());

        return ResponseUtil.ok(data);
    }

    /**
     * 更新用户信息
     *
     * @param userId 用户ID
     * @param body   用户信息
     * @return 操作结果
     */
    @PostMapping("update")
    public Object update(@LoginUser Integer userId, @RequestBody Map<String, Object> body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.badArgumentValue();
        }

        // 更新昵称
        String nickname = (String) body.get("nickname");
        if (nickname != null && !nickname.isEmpty()) {
            user.setNickname(nickname);
        }

        // 更新头像
        String avatar = (String) body.get("avatar");
        if (avatar != null && !avatar.isEmpty()) {
            user.setAvatar(avatar);
        }

        // 更新性别
        Integer gender = (Integer) body.get("gender");
        if (gender != null) {
            user.setGender(gender.byteValue());
        }

        // 更新生日
        String birthdayStr = (String) body.get("birthday");
        if (birthdayStr != null && !birthdayStr.isEmpty()) {
            try {
                user.setBirthday(LocalDate.parse(birthdayStr));
            } catch (Exception e) {
                logger.warn("生日格式错误: " + birthdayStr, e);
            }
        }

        // 更新手机号
        String mobile = (String) body.get("mobile");
        if (mobile != null && !mobile.isEmpty()) {
            user.setMobile(mobile);
        }

        userService.updateById(user);

        return ResponseUtil.ok();
    }

}