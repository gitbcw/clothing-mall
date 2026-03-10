package org.linlinjava.litemall.db.service;

import org.junit.Test;
import org.linlinjava.litemall.db.domain.LitemallOrder;
import org.linlinjava.litemall.db.test.BaseServiceTest;
import org.linlinjava.litemall.db.test.TestConstants;
import org.linlinjava.litemall.db.test.TestDataFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 订单服务测试
 */
public class OrderServiceTest extends BaseServiceTest {

    @Autowired
    private LitemallOrderService orderService;

    @Autowired
    private LitemallUserService userService;

    @Test
    public void testCreateOrder() {
        // Given
        LitemallOrder order = TestDataFactory.createOrder(TestConstants.TEST_USER_ID);

        // When
        orderService.add(order);

        // Then
        assertThat(order.getId()).isNotNull();
        assertThat(order.getOrderStatus()).isEqualTo(TestConstants.ORDER_STATUS_CREATE);
    }

    @Test
    public void testOrderStatusUpdate() {
        // Given
        LitemallOrder order = TestDataFactory.createOrder(TestConstants.TEST_USER_ID);
        orderService.add(order);

        // When - 更新为待发货
        order.setOrderStatus(TestConstants.ORDER_STATUS_PAY);
        orderService.updateById(order);

        // Then
        LitemallOrder updated = orderService.findById(order.getId());
        assertThat(updated.getOrderStatus()).isEqualTo(TestConstants.ORDER_STATUS_PAY);
    }

    @Test
    public void testOrderPriceCalculation() {
        // Given
        LitemallOrder order = TestDataFactory.createOrder(TestConstants.TEST_USER_ID);
        BigDecimal goodsPrice = new BigDecimal("100.00");
        BigDecimal freightPrice = new BigDecimal("10.00");
        order.setGoodsPrice(goodsPrice);
        order.setFreightPrice(freightPrice);
        order.setActualPrice(goodsPrice.add(freightPrice));

        // When
        orderService.add(order);

        // Then
        LitemallOrder saved = orderService.findById(order.getId());
        assertThat(saved.getActualPrice()).isEqualByComparingTo("110.00");
    }

    @Test
    public void testQueryUserOrders() {
        // Given
        LitemallOrder order = TestDataFactory.createOrder(TestConstants.TEST_USER_ID);
        orderService.add(order);

        // When
        List<LitemallOrder> orders = orderService.queryByUserId(TestConstants.TEST_USER_ID);

        // Then
        assertThat(orders).isNotNull();
        assertThat(orders).extracting("userId")
                .contains(TestConstants.TEST_USER_ID);
    }
}
