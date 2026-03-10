package org.linlinjava.litemall.db.service;

import org.junit.Before;
import org.junit.Test;
import org.linlinjava.litemall.db.domain.LitemallCart;
import org.linlinjava.litemall.db.domain.LitemallCoupon;
import org.linlinjava.litemall.db.domain.LitemallCouponUser;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.util.CouponConstant;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 优惠券验证服务测试
 */
@RunWith(MockitoJUnitRunner.class)
public class CouponVerifyServiceTest {

    @Mock
    private LitemallCouponUserService couponUserService;

    @Mock
    private LitemallCouponService couponService;

    @Mock
    private LitemallGoodsService goodsService;

    @InjectMocks
    private CouponVerifyService couponVerifyService;

    private LitemallCoupon createCoupon() {
        LitemallCoupon coupon = new LitemallCoupon();
        coupon.setId(1);
        coupon.setName("满100减10优惠券");
        coupon.setType(CouponConstant.TYPE_COMMON);
        coupon.setStatus(CouponConstant.STATUS_NORMAL);
        coupon.setDiscount(BigDecimal.valueOf(10.00));
        coupon.setMin(BigDecimal.valueOf(100.00));
        coupon.setTimeType(CouponConstant.TIME_TYPE_TIME);
        coupon.setStartTime(LocalDateTime.now().minusDays(1));
        coupon.setEndTime(LocalDateTime.now().plusDays(30));
        coupon.setGoodsType(CouponConstant.GOODS_TYPE_ALL);
        coupon.setGoodsValue(new Integer[]{});
        coupon.setDeleted(false);
        return coupon;
    }

    private LitemallCouponUser createCouponUser(Integer userId, Integer couponId) {
        LitemallCouponUser couponUser = new LitemallCouponUser();
        couponUser.setId(1);
        couponUser.setUserId(userId);
        couponUser.setCouponId(couponId);
        couponUser.setStatus(CouponConstant.STATUS_USE);
        couponUser.setAddTime(LocalDateTime.now());
        return couponUser;
    }

    private List<LitemallCart> createCartList() {
        List<LitemallCart> cartList = new ArrayList<>();
        LitemallCart cart = new LitemallCart();
        cart.setGoodsId(1);
        cart.setPrice(BigDecimal.valueOf(50.00));
        cart.setNumber(2); // 总价 100
        cartList.add(cart);
        return cartList;
    }

    // ==================== 正常情况测试 ====================

    @Test
    public void testCheckCoupon_Valid() {
        LitemallCoupon coupon = createCoupon();
        LitemallCouponUser couponUser = createCouponUser(1, 1);
        List<LitemallCart> cartList = createCartList();

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        // 订单金额 120， 满足满 100 的条件
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNotNull();
    }

    @Test
    public void testCheckCoupon_NotEnoughAmount() {
        LitemallCoupon coupon = createCoupon();
        LitemallCouponUser couponUser = createCouponUser(1, 1);
        List<LitemallCart> cartList = createCartList();

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        // 订单金额 80， 不满足满 100 的条件
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(80.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    // ==================== 优惠券不存在测试 ====================

    @Test
    public void testCheckCoupon_CouponNotFound() {
        when(couponService.findById(999)).thenReturn(null);

        List<LitemallCart> cartList = createCartList();
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 999, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    @Test
    public void testCheckCoupon_CouponDeleted() {
        LitemallCoupon coupon = createCoupon();
        coupon.setDeleted(true);

        when(couponService.findById(1)).thenReturn(coupon);

        List<LitemallCart> cartList = createCartList();
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    // ==================== 用户优惠券不存在测试 ====================

    @Test
    public void testCheckCoupon_CouponUserNotFound() {
        LitemallCoupon coupon = createCoupon();

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(null);
        when(couponUserService.queryOne(1, 1)).thenReturn(null);

        List<LitemallCart> cartList = createCartList();
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    // ==================== 时间限制测试 ====================

    @Test
    public void testCheckCoupon_Expired() {
        LitemallCoupon coupon = createCoupon();
        coupon.setEndTime(LocalDateTime.now().minusDays(1)); // 已过期

        LitemallCouponUser couponUser = createCouponUser(1, 1);

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        List<LitemallCart> cartList = createCartList();
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    @Test
    public void testCheckCoupon_NotStarted() {
        LitemallCoupon coupon = createCoupon();
        coupon.setStartTime(LocalDateTime.now().plusDays(1)); // 还未开始

        LitemallCouponUser couponUser = createCouponUser(1, 1);

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        List<LitemallCart> cartList = createCartList();
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    // ==================== 优惠券状态测试 ====================

    @Test
    public void testCheckCoupon_CouponStatusExpired() {
        LitemallCoupon coupon = createCoupon();
        coupon.setStatus(CouponConstant.STATUS_EXPIRED);

        LitemallCouponUser couponUser = createCouponUser(1, 1);

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        List<LitemallCart> cartList = createCartList();
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    @Test
    public void testCheckCoupon_CouponStatusOut() {
        LitemallCoupon coupon = createCoupon();
        coupon.setStatus(CouponConstant.STATUS_OUT);

        LitemallCouponUser couponUser = createCouponUser(1, 1);

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        List<LitemallCart> cartList = createCartList();
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(120.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNull();
    }

    // ==================== 商品类型限制测试 ====================

    @Test
    public void testCheckCoupon_GoodsTypeArray() {
        LitemallCoupon coupon = createCoupon();
        coupon.setGoodsType(CouponConstant.GOODS_TYPE_ARRAY);
        coupon.setGoodsValue(new Integer[]{1, 2, 3}); // 只有商品ID 1,2,3 可用

        LitemallCouponUser couponUser = createCouponUser(1, 1);
        List<LitemallCart> cartList = createCartList(); // 商品ID是1

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        // 购物车商品总价 100， 满足满 100 的条件
        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(100.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        assertThat(result).isNotNull();
    }

    @Test
    public void testCheckCoupon_GoodsTypeArray_NotInList() {
        LitemallCoupon coupon = createCoupon();
        coupon.setGoodsType(CouponConstant.GOODS_TYPE_ARRAY);
        coupon.setGoodsValue(new Integer[]{10, 20, 30}); // 只有商品ID 10,20,30 可用

        LitemallCouponUser couponUser = createCouponUser(1, 1);
        List<LitemallCart> cartList = createCartList(); // 商品ID是1

        when(couponService.findById(1)).thenReturn(coupon);
        when(couponUserService.findById(1)).thenReturn(couponUser);

        BigDecimal checkedGoodsPrice = BigDecimal.valueOf(100.00);
        LitemallCoupon result = couponVerifyService.checkCoupon(1, 1, 1, checkedGoodsPrice, cartList);

        // 商品不在可用列表中，但订单金额满足条件
        // 由于商品不在列表中，总金额为0，不满足满减条件
        assertThat(result).isNull();
    }
}
