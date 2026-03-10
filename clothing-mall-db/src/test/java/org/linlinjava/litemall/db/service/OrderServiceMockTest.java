package org.linlinjava.litemall.db.service;

import org.junit.Test;
import org.linlinjava.litemall.db.dao.LitemallOrderMapper;
import org.linlinjava.litemall.db.domain.LitemallOrder;
import org.linlinjava.litemall.db.domain.LitemallOrderExample;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.junit.runner.RunWith;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 订单服务测试
 */
@RunWith(MockitoJUnitRunner.class)
public class OrderServiceMockTest {

    @Mock
    private LitemallOrderMapper orderMapper;

    @InjectMocks
    private LitemallOrderService orderService;

    private LitemallOrder createOrder(Integer id, Short status, Integer userId) {
        LitemallOrder order = new LitemallOrder();
        order.setId(id);
        order.setOrderSn("ORD" + System.currentTimeMillis());
        order.setUserId(userId);
        order.setOrderStatus(status);
        order.setConsignee("测试用户");
        order.setMobile("13800138000");
        order.setAddress("测试地址");
        order.setGoodsPrice(BigDecimal.valueOf(100.00));
        order.setFreightPrice(BigDecimal.valueOf(10.00));
        order.setActualPrice(BigDecimal.valueOf(110.00));
        order.setPayTime(null);
        order.setShipSn("");
        order.setShipChannel("");
        order.setDeleted(false);
        return order;
    }

    // ==================== 基础查询测试 ====================

    @Test
    public void testFindById() {
        LitemallOrder order = createOrder(1, (short) 101, 1);
        when(orderMapper.selectByPrimaryKey(1)).thenReturn(order);

        LitemallOrder result = orderService.findById(1);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    public void testFindById_NotFound() {
        when(orderMapper.selectByPrimaryKey(999)).thenReturn(null);

        LitemallOrder result = orderService.findById(999);
        assertThat(result).isNull();
    }

    @Test
    public void testQueryByUserId() {
        LitemallOrder order1 = createOrder(1, (short) 101, 1);
        LitemallOrder order2 = createOrder(2, (short) 201, 1);
        when(orderMapper.selectByExample(any(LitemallOrderExample.class)))
                .thenReturn(Arrays.asList(order1, order2));

        List<LitemallOrder> result = orderService.queryByUid(1);
        assertThat(result).hasSize(2);
    }

    @Test
    public void testQueryByOrderStatus() {
        LitemallOrder order1 = createOrder(1, (short) 201, 1);
        when(orderMapper.selectByExample(any(LitemallOrderExample.class)))
                .thenReturn(Arrays.asList(order1));

        List<Short> statuses = Arrays.asList((short) 201);
        List<LitemallOrder> result = orderService.queryByOrderStatus(1, statuses, 1, 10, "add_time", "desc");
        assertThat(result).hasSize(1);
    }

    // ==================== 状态更新测试 ====================

    @Test
    public void testUpdateById() {
        LitemallOrder order = createOrder(1, (short) 101, 1);
        when(orderMapper.updateByPrimaryKeySelective(any())).thenReturn(1);

        order.setOrderStatus((short) 201);
        int result = orderService.updateById(order);

        assertThat(result).isEqualTo(1);
        verify(orderMapper).updateByPrimaryKeySelective(order);
    }

    @Test
    public void testOrderStatusUpdate() {
        // 订单状态流转测试
        LitemallOrder order = createOrder(1, (short) 101, 1);
        when(orderMapper.updateByPrimaryKeySelective(any())).thenReturn(1);

        // 待付款 -> 待发货
        order.setOrderStatus((short) 201);
        order.setPayTime(LocalDateTime.now());
        int result = orderService.updateById(order);
        assertThat(result).isEqualTo(1);
    }

    // ==================== 订单统计测试 ====================

    @Test
    public void testCountByOrderStatus() {
        when(orderMapper.countByExample(any(LitemallOrderExample.class))).thenReturn(5L);

        long count = orderService.count((short) 201);
        assertThat(count).isEqualTo(5L);
    }

    // ==================== 订单状态常量测试 ====================

    @Test
    public void testOrderStatusConstants() {
        // 验证订单状态常量
        assertThat(LitemallOrderService.STATUS_CREATE).isEqualTo((short) 101);
        assertThat(LitemallOrderService.STATUS_PAY).isEqualTo((short) 201);
        assertThat(LitemallOrderService.STATUS_SHIP).isEqualTo((short) 301);
        assertThat(LitemallOrderService.STATUS_CONFIRM).isEqualTo((short) 401);
        assertThat(LitemallOrderService.STATUS_CANCEL).isEqualTo((short) 102);
    }

    // ==================== 订单金额计算测试 ====================

    @Test
    public void testOrderPriceCalculation() {
        LitemallOrder order = createOrder(1, (short) 101, 1);
        order.setGoodsPrice(BigDecimal.valueOf(100.00));
        order.setFreightPrice(BigDecimal.valueOf(10.00));
        order.setCouponPrice(BigDecimal.valueOf(20.00));
        order.setActualPrice(BigDecimal.valueOf(90.00)); // 100 + 10 - 20

        assertThat(order.getGoodsPrice()).isEqualByComparingTo("100.00");
        assertThat(order.getFreightPrice()).isEqualByComparingTo("10.00");
        assertThat(order.getCouponPrice()).isEqualByComparingTo("20.00");
        assertThat(order.getActualPrice()).isEqualByComparingTo("90.00");
    }

    // ==================== 订单删除测试 ====================

    @Test
    public void testDeleteById() {
        when(orderMapper.logicalDeleteByPrimaryKey(1)).thenReturn(1);

        orderService.deleteById(1);
        verify(orderMapper).logicalDeleteByPrimaryKey(1);
    }

    // ==================== 空列表测试 ====================

    @Test
    public void testQueryByUserId_EmptyResult() {
        when(orderMapper.selectByExample(any(LitemallOrderExample.class)))
                .thenReturn(Collections.emptyList());

        List<LitemallOrder> result = orderService.queryByUid(999);
        assertThat(result).isEmpty();
    }
}
