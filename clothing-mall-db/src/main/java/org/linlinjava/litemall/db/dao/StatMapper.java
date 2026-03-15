package org.linlinjava.litemall.db.dao;

import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

public interface StatMapper {
    List<Map> statUser();

    List<Map> statOrder();

    List<Map> statGoods();

    /**
     * 增长统计：新增用户
     */
    List<Map> statNewUsers(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * 增长统计：日活用户
     */
    List<Map> statDailyActiveUsers(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * 增长统计：留存用户（某日新增用户在后续日期的留存情况）
     */
    List<Map> statRetentionUsers(@Param("cohortDate") String cohortDate, @Param("dayOffset") int dayOffset);

    /**
     * 增长统计：累计用户数
     */
    Map statTotalUsers();
}