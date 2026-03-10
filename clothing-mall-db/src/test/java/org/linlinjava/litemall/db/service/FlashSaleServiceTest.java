package org.linlinjava.litemall.db.service;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.linlinjava.litemall.db.dao.LitemallFlashSaleMapper;
import org.linlinjava.litemall.db.domain.LitemallFlashSale;
import org.linlinjava.litemall.db.domain.LitemallFlashSaleExample;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

/**
 * 限时特卖服务测试
 */
@RunWith(MockitoJUnitRunner.class)
public class FlashSaleServiceTest {

    @Mock
    private LitemallFlashSaleMapper flashSaleMapper;

    @InjectMocks
    private LitemallFlashSaleService flashSaleService;

    private LitemallFlashSale createFlashSale(Integer id, Integer stock, Integer sales) {
        LitemallFlashSale flashSale = new LitemallFlashSale();
        flashSale.setId(id);
        flashSale.setGoodsId(1);
        flashSale.setGoodsName("测试商品");
        flashSale.setFlashPrice(java.math.BigDecimal.valueOf(79.00));
        flashSale.setFlashStock(stock);
        flashSale.setFlashSales(sales);
        flashSale.setStatus(LitemallFlashSaleService.STATUS_ONGOING);
        flashSale.setStartTime(LocalDateTime.now().minusHours(1));
        flashSale.setEndTime(LocalDateTime.now().plusHours(1));
        flashSale.setDeleted(false);
        return flashSale;
    }

    // ==================== 库存扣减测试 ====================

    @Test
    public void testReduceStock_Success() {
        // Given: 库存100，已售10
        LitemallFlashSale flashSale = createFlashSale(1, 100, 10);
        when(flashSaleMapper.selectByPrimaryKey(1)).thenReturn(flashSale);
        when(flashSaleMapper.updateByPrimaryKeySelective(any())).thenReturn(1);

        // When: 扣减5件
        boolean result = flashSaleService.reduceStock(1, 5);

        // Then
        assertThat(result).isTrue();

        // 验证更新参数
        ArgumentCaptor<LitemallFlashSale> captor = ArgumentCaptor.forClass(LitemallFlashSale.class);
        verify(flashSaleMapper).updateByPrimaryKeySelective(captor.capture());
        LitemallFlashSale updated = captor.getValue();
        assertThat(updated.getFlashStock()).isEqualTo(95);  // 100 - 5
        assertThat(updated.getFlashSales()).isEqualTo(15);  // 10 + 5
    }

    @Test
    public void testReduceStock_NotFound() {
        // Given: 特卖不存在
        when(flashSaleMapper.selectByPrimaryKey(anyInt())).thenReturn(null);

        // When
        boolean result = flashSaleService.reduceStock(999, 1);

        // Then
        assertThat(result).isFalse();
        verify(flashSaleMapper, never()).updateByPrimaryKeySelective(any());
    }

    @Test
    public void testReduceStock_InsufficientStock() {
        // Given: 库存3，尝试扣减5
        LitemallFlashSale flashSale = createFlashSale(1, 3, 10);
        when(flashSaleMapper.selectByPrimaryKey(1)).thenReturn(flashSale);

        // When
        boolean result = flashSaleService.reduceStock(1, 5);

        // Then: 库存不足，扣减失败
        assertThat(result).isFalse();
        verify(flashSaleMapper, never()).updateByPrimaryKeySelective(any());
    }

    @Test
    public void testReduceStock_ExactStock() {
        // Given: 库存5，尝试扣减5（刚好够）
        LitemallFlashSale flashSale = createFlashSale(1, 5, 10);
        when(flashSaleMapper.selectByPrimaryKey(1)).thenReturn(flashSale);
        when(flashSaleMapper.updateByPrimaryKeySelective(any())).thenReturn(1);

        // When
        boolean result = flashSaleService.reduceStock(1, 5);

        // Then
        assertThat(result).isTrue();

        ArgumentCaptor<LitemallFlashSale> captor = ArgumentCaptor.forClass(LitemallFlashSale.class);
        verify(flashSaleMapper).updateByPrimaryKeySelective(captor.capture());
        assertThat(captor.getValue().getFlashStock()).isEqualTo(0);
    }

    // ==================== 库存恢复测试 ====================

    @Test
    public void testAddStock_Success() {
        // Given: 库存100，已售50
        LitemallFlashSale flashSale = createFlashSale(1, 100, 50);
        when(flashSaleMapper.selectByPrimaryKey(1)).thenReturn(flashSale);
        when(flashSaleMapper.updateByPrimaryKeySelective(any())).thenReturn(1);

        // When: 恢复5件（订单取消）
        boolean result = flashSaleService.addStock(1, 5);

        // Then
        assertThat(result).isTrue();

        ArgumentCaptor<LitemallFlashSale> captor = ArgumentCaptor.forClass(LitemallFlashSale.class);
        verify(flashSaleMapper).updateByPrimaryKeySelective(captor.capture());
        LitemallFlashSale updated = captor.getValue();
        assertThat(updated.getFlashStock()).isEqualTo(105);  // 100 + 5
        assertThat(updated.getFlashSales()).isEqualTo(45);   // 50 - 5
    }

    @Test
    public void testAddStock_SalesNotNegative() {
        // Given: 库存100，已售3
        LitemallFlashSale flashSale = createFlashSale(1, 100, 3);
        when(flashSaleMapper.selectByPrimaryKey(1)).thenReturn(flashSale);
        when(flashSaleMapper.updateByPrimaryKeySelective(any())).thenReturn(1);

        // When: 恢复5件（超过已售数量）
        boolean result = flashSaleService.addStock(1, 5);

        // Then: 已售数量不会变成负数
        assertThat(result).isTrue();

        ArgumentCaptor<LitemallFlashSale> captor = ArgumentCaptor.forClass(LitemallFlashSale.class);
        verify(flashSaleMapper).updateByPrimaryKeySelective(captor.capture());
        assertThat(captor.getValue().getFlashSales()).isEqualTo(0);  // max(3-5, 0) = 0
    }

    @Test
    public void testAddStock_NotFound() {
        // Given: 特卖不存在
        when(flashSaleMapper.selectByPrimaryKey(anyInt())).thenReturn(null);

        // When
        boolean result = flashSaleService.addStock(999, 1);

        // Then
        assertThat(result).isFalse();
        verify(flashSaleMapper, never()).updateByPrimaryKeySelective(any());
    }

    // ==================== 查询测试 ====================

    @Test
    public void testFindById() {
        // Given
        LitemallFlashSale flashSale = createFlashSale(1, 100, 10);
        when(flashSaleMapper.selectByPrimaryKey(1)).thenReturn(flashSale);

        // When
        LitemallFlashSale result = flashSaleService.findById(1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    public void testFindOngoingByGoodsId_Found() {
        // Given
        LitemallFlashSale flashSale = createFlashSale(1, 100, 10);
        when(flashSaleMapper.selectByExample(any(LitemallFlashSaleExample.class)))
                .thenReturn(Arrays.asList(flashSale));

        // When
        LitemallFlashSale result = flashSaleService.findOngoingByGoodsId(1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(LitemallFlashSaleService.STATUS_ONGOING);
    }

    @Test
    public void testFindOngoingByGoodsId_NotFound() {
        // Given
        when(flashSaleMapper.selectByExample(any(LitemallFlashSaleExample.class)))
                .thenReturn(Collections.emptyList());

        // When
        LitemallFlashSale result = flashSaleService.findOngoingByGoodsId(999);

        // Then
        assertThat(result).isNull();
    }

    // ==================== 状态常量测试 ====================

    @Test
    public void testStatusConstants() {
        assertThat(LitemallFlashSaleService.STATUS_NOT_START).isEqualTo((short) 0);
        assertThat(LitemallFlashSaleService.STATUS_ONGOING).isEqualTo((short) 1);
        assertThat(LitemallFlashSaleService.STATUS_ENDED).isEqualTo((short) 2);
    }
}
