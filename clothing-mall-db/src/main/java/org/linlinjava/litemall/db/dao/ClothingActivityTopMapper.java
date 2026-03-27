package org.linlinjava.litemall.db.dao;

import org.apache.ibatis.annotations.Param;
import org.linlinjava.litemall.db.domain.ClothingActivityTop;
import java.util.List;

public interface ClothingActivityTopMapper {
    int insert(ClothingActivityTop record);
    int deleteByPrimaryKey(@Param("id") Integer id);
    int deleteByGoodsId(@Param("goodsId") Integer goodsId);
    int updateSortOrder(@Param("id") Integer id, @Param("sortOrder") Integer sortOrder);
    ClothingActivityTop selectByGoodsId(@Param("goodsId") Integer goodsId);
    List<ClothingActivityTop> selectAll();
}
