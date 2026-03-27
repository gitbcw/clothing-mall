package org.linlinjava.litemall.wx.web;

import com.github.binarywang.wxpay.bean.request.WxPayRefundRequest;
import com.github.binarywang.wxpay.bean.result.WxPayRefundResult;
import com.github.binarywang.wxpay.service.WxPayService;
import com.github.pagehelper.PageInfo;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.JacksonUtil;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallOrder;
import org.linlinjava.litemall.db.domain.LitemallOrderGoods;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.service.LitemallGoodsProductService;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.linlinjava.litemall.db.service.LitemallOrderGoodsService;
import org.linlinjava.litemall.db.service.LitemallOrderService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.db.util.OrderUtil;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 小程序管理端订单控制器
 * 提供给店主使用的订单管理接口
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
    private LitemallGoodsService goodsService;

    @Autowired
    private LitemallGoodsProductService goodsProductService;

    @Autowired
    private LitemallUserService userService;

    @Autowired
    private WxPayService wxPayService;

    // ========== Tab 状态映射 ==========

    private static final List<Short> PENDING_STATUSES = Arrays.asList(
            OrderUtil.STATUS_PAY, OrderUtil.STATUS_ADMIN_CONFIRM, OrderUtil.STATUS_VERIFY_PENDING);

    private static final List<Short> AFTERSALE_STATUSES = Arrays.asList(
            OrderUtil.STATUS_REFUND);

    private static final List<Short> COMPLETED_STATUSES = Arrays.asList(
            OrderUtil.STATUS_SHIP, OrderUtil.STATUS_CONFIRM, OrderUtil.STATUS_AUTO_CONFIRM,
            OrderUtil.STATUS_VERIFIED, OrderUtil.STATUS_CANCEL, OrderUtil.STATUS_AUTO_CANCEL,
            OrderUtil.STATUS_ADMIN_CANCEL);

    // ========== 权限校验 ==========

    /**
     * 检查用户是否有管理权限（仅店主）
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
        if (!"owner".equals(role)) {
            return ResponseUtil.fail(403, "无管理权限");
        }
        return null;
    }

    // ========== API 接口 ==========

    /**
     * 订单列表（管理端）
     *
     * @param userId 用户ID
     * @param status pending/aftersale/completed
     * @param page   页码
     * @param limit  每页数量
     * @return 分页订单列表 + 各 tab 数量统计
     */
    @GetMapping("list")
    public Object list(@LoginUser Integer userId,
                       @RequestParam(defaultValue = "pending") String status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "20") Integer limit) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }

        List<Short> statusCodes = mapStatus(status);
        if (statusCodes == null) {
            return ResponseUtil.badArgumentValue();
        }

        // 查询订单列表（null userId = 所有用户）
        List<LitemallOrder> orderList = orderService.querySelective(
                null, null, null, null, statusCodes, page, limit, "add_time", "desc");
        long total = PageInfo.of(orderList).getTotal();

        // 组装返回数据：订单 + 商品列表
        List<Map<String, Object>> resultList = new ArrayList<>();
        for (LitemallOrder order : orderList) {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", order.getId());
            orderMap.put("orderSn", order.getOrderSn());
            orderMap.put("orderStatus", order.getOrderStatus());
            orderMap.put("orderStatusText", OrderUtil.orderStatusText(order));
            orderMap.put("actualPrice", order.getActualPrice());
            orderMap.put("consignee", order.getConsignee());
            orderMap.put("mobile", order.getMobile());
            orderMap.put("addTime", order.getAddTime());
            orderMap.put("deliveryType", order.getDeliveryType());
            List<LitemallOrderGoods> goodsList = orderGoodsService.queryByOid(order.getId());
            orderMap.put("goodsList", goodsList);
            orderMap.put("goodsCount", goodsList.size());
            resultList.add(orderMap);
        }

        // 各 tab 数量统计
        Map<String, Object> data = new HashMap<>();
        data.put("list", resultList);
        data.put("total", total);
        data.put("pages", (total + limit - 1) / limit);
        data.put("pendingCount", orderService.countByOrderStatus(PENDING_STATUSES));
        data.put("aftersaleCount", orderService.countByOrderStatus(AFTERSALE_STATUSES));
        data.put("completedCount", orderService.countByOrderStatus(COMPLETED_STATUSES));

        return ResponseUtil.ok(data);
    }

    /**
     * 订单详情（管理端）
     *
     * @param userId  用户ID
     * @param orderId 订单ID
     * @return 订单详情 + 商品列表
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

        Map<String, Object> data = new HashMap<>();
        data.put("order", order);
        data.put("goodsList", orderGoodsService.queryByOid(orderId));
        return ResponseUtil.ok(data);
    }

    /**
     * 发货
     * 201(已付款) → 301(已发货)
     *
     * @param userId 用户ID
     * @param body   { orderId, shipSn, shipChannel }
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
     * 确认付款（管理员确认线下付款）
     * 150(待确认) → 201(已付款)
     *
     * @param userId 用户ID
     * @param body   { orderId }
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

        if (!order.getOrderStatus().equals(OrderUtil.STATUS_ADMIN_CONFIRM)) {
            return ResponseUtil.fail(403, "订单状态不允许确认");
        }

        order.setOrderStatus(OrderUtil.STATUS_PAY);

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }

    /**
     * 取消订单
     * - 101(待付款): 直接取消 + 回滚库存
     * - 150(待确认): 直接取消 + 回滚库存
     * - 201(已付款): 取消 + 微信退款 + 回滚库存
     *
     * @param userId 用户ID
     * @param body   { orderId }
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

        Short orderStatus = order.getOrderStatus();
        // 仅允许取消 待付款/待确认/已付款 状态的订单
        if (!orderStatus.equals(OrderUtil.STATUS_CREATE) &&
                !orderStatus.equals(OrderUtil.STATUS_ADMIN_CONFIRM) &&
                !orderStatus.equals(OrderUtil.STATUS_PAY)) {
            return ResponseUtil.fail(403, "订单状态不允许取消");
        }

        // 已付款订单需微信退款
        if (orderStatus.equals(OrderUtil.STATUS_PAY)) {
            try {
                wxRefund(order);
            } catch (Exception e) {
                logger.error("微信退款失败", e);
                return ResponseUtil.fail(500, "退款失败：" + e.getMessage());
            }
        }

        // 回滚库存
        rollbackStock(orderId);

        order.setOrderStatus(OrderUtil.STATUS_ADMIN_CANCEL);
        order.setEndTime(LocalDateTime.now());

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }

    /**
     * 同意退款
     * 202(退款中) → 203(已退款) + 微信退款 + 释放库存
     *
     * @param userId 用户ID
     * @param body   { orderId }
     */
    @PostMapping("refundAgree")
    public Object refundAgree(@LoginUser Integer userId, @RequestBody String body) {
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

        if (!order.getOrderStatus().equals(OrderUtil.STATUS_REFUND)) {
            return ResponseUtil.fail(403, "订单状态不允许退款");
        }

        // 微信退款
        try {
            wxRefund(order);
        } catch (Exception e) {
            logger.error("微信退款失败", e);
            return ResponseUtil.fail(500, "退款失败：" + e.getMessage());
        }

        // 释放库存
        rollbackStock(orderId);

        order.setOrderStatus(OrderUtil.STATUS_REFUND_CONFIRM);
        order.setEndTime(LocalDateTime.now());

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }

    /**
     * 拒绝退款
     * 202(退款中) → 恢复原状态（根据是否已发货判断）
     *
     * @param userId 用户ID
     * @param body   { orderId, reason }
     */
    @PostMapping("refundReject")
    public Object refundReject(@LoginUser Integer userId, @RequestBody String body) {
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

        if (!order.getOrderStatus().equals(OrderUtil.STATUS_REFUND)) {
            return ResponseUtil.fail(403, "订单状态不正确");
        }

        // 恢复原状态：已发货→301，未发货→201
        if (order.getShipTime() != null) {
            order.setOrderStatus(OrderUtil.STATUS_SHIP);
        } else {
            order.setOrderStatus(OrderUtil.STATUS_PAY);
        }

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }

    /**
     * 核销自提订单
     * 501(待核销) → 502(已核销)
     *
     * @param userId 用户ID
     * @param body   { orderId, pickupCode }
     */
    @PostMapping("verify")
    public Object verify(@LoginUser Integer userId, @RequestBody String body) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }

        Integer orderId = JacksonUtil.parseInteger(body, "orderId");
        String pickupCode = JacksonUtil.parseString(body, "pickupCode");

        if (orderId == null || pickupCode == null) {
            return ResponseUtil.badArgument();
        }

        LitemallOrder order = orderService.findById(orderId);
        if (order == null) {
            return ResponseUtil.badArgument();
        }

        if (!order.getOrderStatus().equals(OrderUtil.STATUS_VERIFY_PENDING)) {
            return ResponseUtil.fail(403, "订单状态不允许核销");
        }

        // 验证取货码
        if (!pickupCode.equals(order.getPickupCode())) {
            return ResponseUtil.fail(400, "取货码错误");
        }

        order.setOrderStatus(OrderUtil.STATUS_VERIFIED);
        order.setConfirmTime(LocalDateTime.now());

        if (orderService.updateWithOptimisticLocker(order) == 0) {
            return ResponseUtil.updatedDateExpired();
        }

        return ResponseUtil.ok();
    }

    // ========== 私有方法 ==========

    /**
     * 微信退款
     */
    private void wxRefund(LitemallOrder order) throws Exception {
        WxPayRefundRequest request = new WxPayRefundRequest();
        request.setOutTradeNo(order.getOrderSn());
        request.setOutRefundNo("refund_" + order.getOrderSn());
        Integer totalFee = order.getActualPrice().multiply(new BigDecimal(100)).intValue();
        request.setTotalFee(totalFee);
        request.setRefundFee(totalFee);
        wxPayService.refund(request);
    }

    /**
     * 回滚库存
     */
    private void rollbackStock(Integer orderId) {
        List<LitemallOrderGoods> orderGoodsList = orderGoodsService.queryByOid(orderId);
        for (LitemallOrderGoods orderGoods : orderGoodsList) {
            Integer productId = orderGoods.getProductId();
            Short number = orderGoods.getNumber();
            if (productId != null && number != null && number > 0) {
                goodsProductService.addStock(productId, number);
            }
        }
    }

    /**
     * Tab status 参数 → 订单状态码列表
     */
    private List<Short> mapStatus(String status) {
        switch (status) {
            case "pending":
                return PENDING_STATUSES;
            case "aftersale":
                return AFTERSALE_STATUSES;
            case "completed":
                return COMPLETED_STATUSES;
            default:
                return null;
        }
    }

    /**
     * 管理后台首页统计数据
     */
    @GetMapping("stats")
    public Object stats(@LoginUser Integer userId) {
        Object error = checkManager(userId);
        if (error != null) {
            return error;
        }

        // 订单统计
        long pendingOrderCount = orderService.countByOrderStatus(PENDING_STATUSES);
        long aftersaleCount = orderService.countByOrderStatus(AFTERSALE_STATUSES);

        // 最近 5 条待处理订单
        List<LitemallOrder> recentOrders = orderService.querySelective(
                null, null, null, null, PENDING_STATUSES, 1, 5, "add_time", "desc");

        // 组装返回
        List<Map<String, Object>> recentList = new ArrayList<>();
        for (LitemallOrder order : recentOrders) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("orderSn", order.getOrderSn());
            map.put("orderStatus", order.getOrderStatus());
            map.put("orderStatusText", OrderUtil.orderStatusText(order));
            map.put("actualPrice", order.getActualPrice());
            map.put("consignee", order.getConsignee());
            map.put("addTime", order.getAddTime());
            recentList.add(map);
        }

        // 待上架商品数
        long pendingGoodsCount = goodsService.countByCondition(LitemallGoods.STATUS_DRAFT, null)
                + goodsService.countByCondition(LitemallGoods.STATUS_PENDING, null);

        Map<String, Object> data = new HashMap<>();
        data.put("pendingOrderCount", pendingOrderCount);
        data.put("aftersaleCount", aftersaleCount);
        data.put("pendingGoodsCount", pendingGoodsCount);
        data.put("recentOrders", recentList);
        return ResponseUtil.ok(data);
    }
}
