package org.linlinjava.litemall.db.service;

import org.junit.Test;
import org.linlinjava.litemall.db.domain.LitemallCoupon;
import org.linlinjava.litemall.db.domain.LitemallCouponUser;
import org.linlinjava.litemall.db.test.BaseServiceTest;
import org.linlinjava.litemall.db.test.TestConstants;
import org.linlinjava.litemall.db.test.TestDataFactory;
import org.linlinjava.litemall.db.util.CouponConstant;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 优惠券服务测试
 */
public class CouponServiceTest extends BaseServiceTest {

    @Autowired
    private LitemallCouponService couponService;

    @Autowired
    private LitemallCouponUserService couponUserService;

    @Test
    public void testCreateCoupon() {
        // Given
        LitemallCoupon coupon = TestDataFactory.createCoupon();

        // When
        couponService.add(coupon);

        // Then
        assertThat(coupon.getId()).isNotNull();
        assertThat(coupon.getName()).isEqualTo("测试优惠券");
    }

    @Test
    public void testQueryAvailableCoupons() {
        // When
        List<LitemallCoupon> coupons = couponService.queryList(0, 10);

        // Then
        assertThat(coupons).isNotNull();
    }

    @Test
    public void testAssignCouponToUser() {
        // Given
        LitemallCoupon coupon = TestDataFactory.createCoupon();
        couponService.add(coupon);

        // When
        couponUserService.assign(coupon.getId(), TestConstants.TEST_USER_ID);

        // Then
        List<LitemallCouponUser> userCoupons = couponUserService.queryList(TestConstants.TEST_USER_ID);
        assertThat(userCoupons).isNotEmpty();
    }

    @Test
    public void testCouponStatus() {
        // Given
        LitemallCoupon coupon = TestDataFactory.createCoupon();
        couponService.add(coupon);

        // When
        LitemallCoupon found = couponService.findById(coupon.getId());

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getStatus()).isEqualTo(CouponConstant.STATUS_NORMAL);
    }
}
