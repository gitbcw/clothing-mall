package org.linlinjava.litemall.core.system;

import org.linlinjava.litemall.db.domain.LitemallFullReduction;
import org.linlinjava.litemall.db.service.LitemallFullReductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * 满减活动服务
 */
@Service
public class FullReductionService {

    /**
     * 满减活动状态：禁用
     */
    public static final short STATUS_DISABLED = 0;
    /**
     * 满减活动状态：启用
     */
    public static final short STATUS_ENABLED = 1;

    @Autowired
    private LitemallFullReductionService fullReductionService;

    /**
     * 查询当前启用的满减规则
     *
     * @return 满减规则列表
     */
    public List<LitemallFullReduction> queryEnabled() {
        return fullReductionService.queryEnabled();
    }

    /**
     * 计算订单满减优惠金额
     *
     * @param orderAmount 订单金额
     * @return 满减优惠金额
     */
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        List<LitemallFullReduction> reductionList = queryEnabled();
        if (reductionList == null || reductionList.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // 按门槛降序，取最高优惠
        BigDecimal maxDiscount = BigDecimal.ZERO;
        for (LitemallFullReduction reduction : reductionList) {
            if (orderAmount.compareTo(reduction.getThreshold()) >= 0) {
                maxDiscount = reduction.getDiscount();
            }
        }

        return maxDiscount;
    }

    /**
     * 满减是否与优惠券叠加
     *
     * @return true 表示可以叠加
     */
    public boolean isStackWithCoupon() {
        return SystemConfig.isFullReductionStackWithCoupon();
    }

}