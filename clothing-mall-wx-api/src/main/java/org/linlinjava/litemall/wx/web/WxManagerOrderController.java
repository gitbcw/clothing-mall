package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.JacksonUtil;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallOrder;
import org.linlinjava.litemall.db.domain.LitemallOrderGoods;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallGoodsProductService;
import org.linlinjava.litemall.db.service.LitemallOrderGoodsService;
import org.linlinjava.litemall.db.service.LitemallOrderService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.db.util.OrderUtil;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 小程序管理端订单控制器
 * 提供给店主/导购使用的订单管理接口
 */
@RestController
@RequestMapping("/wx/manager/order")
@Validated
public class WxManagerOrderController {
    private final Log logger = LogFactory.getLog(WxManagerOrderController.class);

    @Autowired
    private LitemallOrderService orderService;

    @Autowired
    private LitemallOrderGoodsService orderGoodsService;

    @Autowired
    private LitemallGoodsProductService goodsProductService;

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
     * 订单详情（管理端）
     *
     * @param userId  用户ID
     * @param orderId 订单ID
     * @return 订单详情
     */
    @GetMapping("detail")
    public Object detail(@LoginUser Integer userId, @NotNull Integer orderId) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }
        LitemallOrder order = orderService.findById(orderId);
        if (order == null) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(order);
    }

    /**
     * 发货
     *
     * @param userId 用户ID
     * @param body   订单信息，{ orderId: xxx, shipSn: xxx, shipChannel: xxx }
     * @return 订单操作结果
     */
    @PostMapping("ship")
    public Object ship(@LoginUser Integer userId, @RequestBody String body) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }

        Integer orderId = JacksonUtil.parseInteger(body, "orderId");
        String shipSn = JacksonUtil.parseString(body, "shipSn");
        String shipChannel = JacksonUtil.parseString(body, "shipChannel");

        if (orderId == null) {
            return ResponseUtil.badArgument();
        }

        LitemallOrder order = orderService.findById(orderId);
        if (order == null) {
            return ResponseUtil.badArgument();
        }

        // 如果订单不是已付款状态，则不能发货
        if (!order.getOrderStatus().equals(OrderUtil.STATUS_PAY)) {
            return ResponseUtil.fail(403, "订单状态不允许发货");
        }

        order.setOrderStatus(OrderUtil.STATUS_SHIP);
        order.setShipSn(shipSn);
        order.setShipChannel(shipChannel);
        order.setShipTime(LocalDateTime.now());

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }

    /**
     * 确认收货（管理员代替用户确认）
     *
     * @param userId 用户ID
     * @param body   订单信息，{ orderId: xxx }
     * @return 订单操作结果
     */
    @PostMapping("confirm")
    public Object confirm(@LoginUser Integer userId, @RequestBody String body) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }

        Integer orderId = JacksonUtil.parseInteger(body, "orderId");
        if (orderId == null) {
            return ResponseUtil.badArgument();
        }

        LitemallOrder order = orderService.findById(orderId);
        if (order == null) {
            return ResponseUtil.badArgument();
        }

        // 如果订单不是已发货状态，则不能确认收货
        if (!order.getOrderStatus().equals(OrderUtil.STATUS_SHIP)) {
            return ResponseUtil.fail(403, "订单状态不允许确认收货");
        }

        order.setOrderStatus(OrderUtil.STATUS_CONFIRM);
        order.setConfirmTime(LocalDateTime.now());

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }

    /**
     * 取消订单（管理员取消）
     * 回滚库存
     *
     * @param userId 用户ID
     * @param body   订单信息，{ orderId: xxx }
     * @return 订单操作结果
     */
    @PostMapping("cancel")
    public Object cancel(@LoginUser Integer userId, @RequestBody String body) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }

        Integer orderId = JacksonUtil.parseInteger(body, "orderId");
        if (orderId == null) {
            return ResponseUtil.badArgument();
        }

        LitemallOrder order = orderService.findById(orderId);
        if (order == null) {
            return ResponseUtil.badArgument();
        }

        // 如果订单不是待付款状态，则不能取消
        if (!order.getOrderStatus().equals(OrderUtil.STATUS_CREATE)) {
            return ResponseUtil.fail(403, "订单状态不允许取消");
        }

        // 回滚库存：获取订单商品列表
        List<LitemallOrderGoods> orderGoodsList = orderGoodsService.queryByOid(orderId);
        for (LitemallOrderGoods orderGoods : orderGoodsList) {
            // 恢复商品库存
            Integer productId = orderGoods.getProductId();
            Short number = orderGoods.getNumber();
            if (productId != null && number != null && number > 0) {
                goodsProductService.addStock(productId, number);
            }
        }

        order.setOrderStatus(OrderUtil.STATUS_CANCEL);
        order.setEndTime(LocalDateTime.now());

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }
}
