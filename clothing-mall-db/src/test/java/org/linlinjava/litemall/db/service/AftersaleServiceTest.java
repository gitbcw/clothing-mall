package org.linlinjava.litemall.db.service;

import org.junit.Test;
import org.linlinjava.litemall.db.dao.LitemallAftersaleMapper;
import org.linlinjava.litemall.db.domain.LitemallAftersale;
import org.linlinjava.litemall.db.domain.LitemallAftersaleExample;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 售后换货服务测试
 */
@RunWith(MockitoJUnitRunner.class)
public class AftersaleServiceTest {

    @Mock
    private LitemallAftersaleMapper aftersaleMapper;

    @InjectMocks
    private LitemallAftersaleService aftersaleService;

    private LitemallAftersale createAftersale(Integer id, Byte status) {
        LitemallAftersale aftersale = new LitemallAftersale();
        aftersale.setId(id);
        aftersale.setOrderId(1);
        aftersale.setUserId(1);
        aftersale.setType((byte) 1); // 换货类型
        aftersale.setStatus(status);
        aftersale.setReason("尺码不合适");
        aftersale.setDeleted(false);
        return aftersale;
    }

    // ==================== 查询测试 ====================

    @Test
    public void testFindById() {
        LitemallAftersale aftersale = createAftersale(1, (byte) 0);

        when(aftersaleMapper.selectByPrimaryKey(1)).thenReturn(aftersale);

        LitemallAftersale result = aftersaleService.findById(1);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    public void testFindById_NotFound() {
        when(aftersaleMapper.selectByPrimaryKey(999)).thenReturn(null);

        LitemallAftersale result = aftersaleService.findById(999);
        assertThat(result).isNull();
    }

    @Test
    public void testQuerySelective() {
        List<LitemallAftersale> list = Arrays.asList(
                createAftersale(1, (byte) 0),
                createAftersale(2, (byte) 1)
        );

        when(aftersaleMapper.selectByExample(any(LitemallAftersaleExample.class)))
                .thenReturn(list);

        List<LitemallAftersale> result = aftersaleService.querySelective(
                null, null, null, null, 1, 10, "add_time", "desc");
        assertThat(result).hasSize(2);
    }

    // ==================== 状态常量测试 ====================

    @Test
    public void testStatusConstants() {
        // 验证状态常量
        assertThat(LitemallAftersaleService.STATUS_PENDING).isEqualTo((byte) 0);
        assertThat(LitemallAftersaleService.STATUS_PROCESS).isEqualTo((byte) 1);
        assertThat(LitemallAftersaleService.STATUS_FINISH).isEqualTo((byte) 2);
        assertThat(LitemallAftersaleService.STATUS_REJECT).isEqualTo((byte) 3);
    }

    // ==================== 更新测试 ====================

    @Test
    public void testUpdateById() {
        LitemallAftersale aftersale = createAftersale(1, (byte) 0);
        aftersale.setStatus((byte) 1);

        when(aftersaleMapper.updateByPrimaryKeySelective(any())).thenReturn(1);

        int result = aftersaleService.updateById(aftersale);
        assertThat(result).isEqualTo(1);
    }

    @Test
    public void testDeleteById() {
        when(aftersaleMapper.logicalDeleteByPrimaryKey(1)).thenReturn(1);

        aftersaleService.deleteById(1);
        verify(aftersaleMapper).logicalDeleteByPrimaryKey(1);
    }

    // ==================== 按订单查询测试 ====================

    @Test
    public void testQueryByOrderId() {
        LitemallAftersale aftersale = createAftersale(1, (byte) 0);
        aftersale.setOrderId(100);

        List<LitemallAftersale> list = Arrays.asList(aftersale);

        when(aftersaleMapper.selectByExample(any(LitemallAftersaleExample.class)))
                .thenReturn(list);

        List<LitemallAftersale> result = aftersaleService.queryByOrderId(100);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOrderId()).isEqualTo(100);
    }

    @Test
    public void testQueryByUserId() {
        LitemallAftersale aftersale = createAftersale(1, (byte) 0);
        aftersale.setUserId(100);

        List<LitemallAftersale> list = Arrays.asList(aftersale);

        when(aftersaleMapper.selectByExample(any(LitemallAftersaleExample.class)))
                .thenReturn(list);

        List<LitemallAftersale> result = aftersaleService.queryByUserId(100);
        assertThat(result).hasSize(1);
    }
}
