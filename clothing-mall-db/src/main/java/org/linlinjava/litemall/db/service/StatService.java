package org.linlinjava.litemall.db.service;

import org.linlinjava.litemall.db.dao.StatMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

@Service
public class StatService {
    @Resource
    private StatMapper statMapper;


    public List<Map> statUser() {
        return statMapper.statUser();
    }

    public List<Map> statOrder() {
        return statMapper.statOrder();
    }

    public List<Map> statGoods() {
        return statMapper.statGoods();
    }

    // ==================== 增长统计 ====================

    /**
     * 新增用户统计（按日）
     */
    public List<Map> statNewUsers(String startDate, String endDate) {
        return statMapper.statNewUsers(startDate, endDate);
    }

    /**
     * 日活用户统计（按日）
     */
    public List<Map> statDailyActiveUsers(String startDate, String endDate) {
        return statMapper.statDailyActiveUsers(startDate, endDate);
    }

    /**
     * 留存用户统计
     */
    public List<Map> statRetentionUsers(String cohortDate, int dayOffset) {
        return statMapper.statRetentionUsers(cohortDate, dayOffset);
    }

    /**
     * 累计用户数
     */
    public Map statTotalUsers() {
        return statMapper.statTotalUsers();
    }
}
