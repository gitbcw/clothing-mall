package org.linlinjava.litemall.db.test;

import org.linlinjava.litemall.db.domain.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

/**
 * 测试数据工厂
 * <p>
 * 用于快速创建测试用的领域对象
 */
public class TestDataFactory {

    private static final Random random = new Random();

    // ==================== 用户 ====================

    public static LitemallUser createUser() {
        LitemallUser user = new LitemallUser();
        user.setUsername("test_user_" + System.currentTimeMillis());
        user.setPassword("password123");
        user.setMobile("13800138000");
        user.setNickname("测试用户");
        user.setGender((byte) 1);
        user.setAvatar("https://example.com/avatar.png");
        user.setStatus((byte) 0);
        user.setDeleted(false);
        return user;
    }

    // ==================== 商品 ====================

    public static LitemallGoods createGoods() {
        LitemallGoods goods = new LitemallGoods();
        goods.setGoodsSn("TEST" + System.currentTimeMillis());
        goods.setName("测试商品-" + random.nextInt(1000));
        goods.setCategoryId(TestConstants.TEST_CATEGORY_ID);
        goods.setBrandId(0);
        goods.setGallery(new String[0]);
        goods.setKeywords("");
        goods.setBrief("测试商品简介");
        goods.setIsOnSale(true);
        goods.setSortOrder((short) 100);
        goods.setPicUrl("https://example.com/goods.png");
        goods.setShareUrl("");
        goods.setIsNew(true);
        goods.setIsHot(false);
        goods.setUnit("件");
        goods.setCounterPrice(new BigDecimal("199.00"));
        goods.setRetailPrice(new BigDecimal("99.00"));
        goods.setDetail("测试商品详情");
        goods.setDeleted(false);
        return goods;
    }

    public static LitemallGoodsProduct createProduct(Integer goodsId) {
        LitemallGoodsProduct product = new LitemallGoodsProduct();
        product.setGoodsId(goodsId);
        product.setSpecifications("[{\"specification\":\"规格\",\"value\":\"标准\"}]");
        product.setPrice(new BigDecimal("99.00"));
        product.setNumber(100);
        product.setUrl("https://example.com/product.png");
        product.setDeleted(false);
        return product;
    }

    // ==================== 订单 ====================

    public static LitemallOrder createOrder(Integer userId) {
        LitemallOrder order = new LitemallOrder();
        order.setOrderSn(String.valueOf(System.currentTimeMillis()));
        order.setUserId(userId);
        order.setOrderStatus(TestConstants.ORDER_STATUS_CREATE);
        order.setConsignee("测试收货人");
        order.setMobile("13800138000");
        order.setAddress("测试地址");
        order.setMessage("");
        order.setGoodsPrice(new BigDecimal("100.00"));
        order.setFreightPrice(new BigDecimal("10.00"));
        order.setCouponPrice(new BigDecimal("0.00"));
        order.setActualPrice(new BigDecimal("110.00"));
        order.setPayId("");
        order.setShipSn("");
        order.setShipChannel("");
        order.setRefundAmount(new BigDecimal("0.00"));
        order.setDeleted(false);
        return order;
    }

    public static LitemallOrderGoods createOrderGoods(Integer orderId, Integer goodsId) {
        LitemallOrderGoods orderGoods = new LitemallOrderGoods();
        orderGoods.setOrderId(orderId);
        orderGoods.setGoodsId(goodsId);
        orderGoods.setGoodsSn("TEST001");
        orderGoods.setGoodsName("测试商品");
        orderGoods.setProductId(1);
        orderGoods.setNumber((short) 1);
        orderGoods.setPrice(new BigDecimal("100.00"));
        orderGoods.setSpecifications("[{\"规格\":\"标准\"}]");
        orderGoods.setPicUrl("https://example.com/goods.png");
        orderGoods.setDeleted(false);
        return orderGoods;
    }

    // ==================== 购物车 ====================

    public static LitemallCart createCart(Integer userId, Integer goodsId, Integer productId) {
        LitemallCart cart = new LitemallCart();
        cart.setUserId(userId);
        cart.setGoodsId(goodsId);
        cart.setProductId(productId);
        cart.setGoodsSn("TEST001");
        cart.setGoodsName("测试商品");
        cart.setPrice(new BigDecimal("100.00"));
        cart.setNumber((short) 1);
        cart.setSpecifications("[{\"规格\":\"标准\"}]");
        cart.setChecked(true);
        cart.setPicUrl("https://example.com/goods.png");
        cart.setDeleted(false);
        return cart;
    }

    // ==================== 优惠券 ====================

    public static LitemallCoupon createCoupon() {
        LitemallCoupon coupon = new LitemallCoupon();
        coupon.setName("测试优惠券");
        coupon.setDesc("测试优惠券描述");
        coupon.setTag("测试");
        coupon.setTotal(100);
        coupon.setDiscount(new BigDecimal("10.00"));
        coupon.setMin(new BigDecimal("100.00"));
        coupon.setLimit((short) 1);
        coupon.setType(TestConstants.COUPON_TYPE_COMMON);
        coupon.setStatus((short) 0);
        coupon.setGoodsType((short) 0);
        coupon.setGoodsValue(new String[0]);
        coupon.setCode("TEST" + random.nextInt(10000));
        coupon.setStartTime(LocalDateTime.now());
        coupon.setEndTime(LocalDateTime.now().plusDays(30));
        coupon.setDeleted(false);
        return coupon;
    }

    public static LitemallCouponUser createCouponUser(Integer userId, Integer couponId) {
        LitemallCouponUser couponUser = new LitemallCouponUser();
        couponUser.setUserId(userId);
        couponUser.setCouponId(couponId);
        couponUser.setStatus((short) 0); // 未使用
        couponUser.setStartTime(LocalDateTime.now());
        couponUser.setEndTime(LocalDateTime.now().plusDays(30));
        couponUser.setOrderId(null);
        couponUser.setDeleted(false);
        return couponUser;
    }

    // ==================== 限时特卖 ====================

    public static LitemallFlashSale createFlashSale(Integer goodsId) {
        LitemallFlashSale flashSale = new LitemallFlashSale();
        flashSale.setGoodsId(goodsId);
        flashSale.setFlashPrice(new BigDecimal("79.00"));
        flashSale.setFlashStock(100);
        flashSale.setFlashBuyLimit(1);
        flashSale.setStartTime(LocalDateTime.now());
        flashSale.setEndTime(LocalDateTime.now().plusHours(2));
        flashSale.setStatus((byte) 1);
        flashSale.setDeleted(false);
        return flashSale;
    }

    // ==================== 满减规则 ====================

    public static LitemallFullReduction createFullReduction() {
        LitemallFullReduction reduction = new LitemallFullReduction();
        reduction.setName("满减活动");
        reduction.setDesc("满200减20");
        reduction.setThresholdAmount(new BigDecimal("200.00"));
        reduction.setReductionAmount(new BigDecimal("20.00"));
        reduction.setStatus((byte) 1);
        reduction.setStartTime(LocalDateTime.now());
        reduction.setEndTime(LocalDateTime.now().plusDays(30));
        reduction.setGoodsType((byte) 0);
        reduction.setGoodsValue(new String[0]);
        reduction.setDeleted(false);
        return reduction;
    }
}
