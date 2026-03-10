package org.linlinjava.litemall.db.service;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.linlinjava.litemall.db.dao.LitemallCouponMapper;
import org.linlinjava.litemall.db.dao.LitemallCouponUserMapper;
import org.linlinjava.litemall.db.domain.LitemallCoupon;
import org.linlinjava.litemall.db.domain.LitemallCouponExample;
import org.linlinjava.litemall.db.util.CouponConstant;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 优惠券服务测试
 */
@RunWith(MockitoJUnitRunner.class)
public class CouponServiceMockTest {

    @Mock
    private LitemallCouponMapper couponMapper;

    @Mock
    private LitemallCouponUserMapper couponUserMapper;

    @InjectMocks
    private LitemallCouponService couponService;

    private LitemallCoupon createCoupon(Integer id, Short type, String code) {
        LitemallCoupon coupon = new LitemallCoupon();
        coupon.setId(id);
        coupon.setName("测试优惠券");
        coupon.setType(type);
        coupon.setCode(code);
        coupon.setStatus(CouponConstant.STATUS_NORMAL);
        coupon.setDiscount(BigDecimal.valueOf(10.00));
        coupon.setMin(BigDecimal.valueOf(100.00));
        coupon.setDeleted(false);
        return coupon;
    }

    // ==================== findById 测试 ====================

    @Test
    public void testFindById_Found() {
        // Given
        LitemallCoupon coupon = createCoupon(1, CouponConstant.TYPE_COMMON, null);
        when(couponMapper.selectByPrimaryKey(1)).thenReturn(coupon);

        // When
        LitemallCoupon result = couponService.findById(1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    public void testFindById_NotFound() {
        // Given
        when(couponMapper.selectByPrimaryKey(999)).thenReturn(null);

        // When
        LitemallCoupon result = couponService.findById(999);

        // Then
        assertThat(result).isNull();
    }

    // ==================== findByCode 测试 ====================

    @Test
    public void testFindByCode_Found() {
        // Given
        LitemallCoupon coupon = createCoupon(1, CouponConstant.TYPE_CODE, "TEST1234");
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Arrays.asList(coupon));

        // When
        LitemallCoupon result = couponService.findByCode("TEST1234");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("TEST1234");
    }

    @Test
    public void testFindByCode_NotFound() {
        // Given
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Collections.emptyList());

        // When
        LitemallCoupon result = couponService.findByCode("NOTEXIST");

        // Then
        assertThat(result).isNull();
    }

    @Test(expected = RuntimeException.class)
    public void testFindByCode_DuplicateCodes_ThrowsException() {
        // Given: 存在重复的优惠码（数据异常）
        LitemallCoupon coupon1 = createCoupon(1, CouponConstant.TYPE_CODE, "TEST1234");
        LitemallCoupon coupon2 = createCoupon(2, CouponConstant.TYPE_CODE, "TEST1234");
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Arrays.asList(coupon1, coupon2));

        // When: 应该抛出异常
        couponService.findByCode("TEST1234");
    }

    // ==================== queryRegister 测试 ====================

    @Test
    public void testQueryRegister() {
        // Given
        LitemallCoupon coupon = createCoupon(1, CouponConstant.TYPE_REGISTER, null);
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Arrays.asList(coupon));

        // When
        java.util.List<LitemallCoupon> result = couponService.queryRegister();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(CouponConstant.TYPE_REGISTER);
    }

    // ==================== queryNewUser 测试 ====================

    @Test
    public void testQueryNewUser() {
        // Given
        LitemallCoupon coupon = createCoupon(1, CouponConstant.TYPE_NEWUSER, null);
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Arrays.asList(coupon));

        // When
        java.util.List<LitemallCoupon> result = couponService.queryNewUser();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(CouponConstant.TYPE_NEWUSER);
    }

    // ==================== queryBirthday 测试 ====================

    @Test
    public void testQueryBirthday() {
        // Given
        LitemallCoupon coupon = createCoupon(1, CouponConstant.TYPE_BIRTHDAY, null);
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Arrays.asList(coupon));

        // When
        java.util.List<LitemallCoupon> result = couponService.queryBirthday();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(CouponConstant.TYPE_BIRTHDAY);
    }

    // ==================== generateCode 测试 ====================

    @Test
    public void testGenerateCode() {
        // Given: 没有重复的优惠码
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Collections.emptyList());

        // When
        String code = couponService.generateCode();

        // Then
        assertThat(code).isNotNull();
        assertThat(code.length()).isEqualTo(8);
        assertThat(code).matches("[A-Z0-9]+");
    }

    @Test
    public void testGenerateCode_RetriesOnDuplicate() {
        // Given: 第一次生成重复，第二次不重复
        LitemallCoupon existingCoupon = createCoupon(1, CouponConstant.TYPE_CODE, "EXISTING");
        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Arrays.asList(existingCoupon))  // 第一次返回已存在
                .thenReturn(Collections.emptyList());       // 第二次返回空

        // When
        String code = couponService.generateCode();

        // Then
        assertThat(code).isNotNull();
        assertThat(code.length()).isEqualTo(8);
        verify(couponMapper, times(2)).selectByExample(any());
    }

    // ==================== queryExpired 测试 ====================

    @Test
    public void testQueryExpired() {
        // Given
        LitemallCoupon expiredCoupon = createCoupon(1, CouponConstant.TYPE_COMMON, null);
        expiredCoupon.setTimeType(CouponConstant.TIME_TYPE_TIME);
        expiredCoupon.setEndTime(LocalDateTime.now().minusDays(1));

        when(couponMapper.selectByExample(any(LitemallCouponExample.class)))
                .thenReturn(Arrays.asList(expiredCoupon));

        // When
        java.util.List<LitemallCoupon> result = couponService.queryExpired();

        // Then
        assertThat(result).hasSize(1);
    }

    // ==================== add 测试 ====================

    @Test
    public void testAddCoupon() {
        // Given
        LitemallCoupon coupon = createCoupon(null, CouponConstant.TYPE_COMMON, null);
        when(couponMapper.insertSelective(any())).thenReturn(1);

        // When
        couponService.add(coupon);

        // Then
        assertThat(coupon.getAddTime()).isNotNull();
        assertThat(coupon.getUpdateTime()).isNotNull();
        verify(couponMapper).insertSelective(coupon);
    }

    // ==================== 常量测试 ====================

    @Test
    public void testCouponConstants() {
        assertThat(CouponConstant.TYPE_COMMON).isEqualTo((short) 0);
        assertThat(CouponConstant.TYPE_REGISTER).isEqualTo((short) 1);
        assertThat(CouponConstant.TYPE_CODE).isEqualTo((short) 2);
        assertThat(CouponConstant.TYPE_NEWUSER).isEqualTo((short) 3);
        assertThat(CouponConstant.TYPE_BIRTHDAY).isEqualTo((short) 4);

        assertThat(CouponConstant.STATUS_NORMAL).isEqualTo((short) 0);
        assertThat(CouponConstant.STATUS_EXPIRED).isEqualTo((short) 1);
        assertThat(CouponConstant.STATUS_OUT).isEqualTo((short) 2);
    }
}
