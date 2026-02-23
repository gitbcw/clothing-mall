package org.linlinjava.litemall.db.dao;

import org.linlinjava.litemall.db.domain.ClothingMemberLevel;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ClothingMemberLevelMapper {

    int insert(ClothingMemberLevel record);

    int insertSelective(ClothingMemberLevel record);

    int deleteByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(ClothingMemberLevel record);

    int updateByPrimaryKey(ClothingMemberLevel record);

    ClothingMemberLevel selectByPrimaryKey(Integer id);

    List<ClothingMemberLevel> selectAll();

    ClothingMemberLevel selectByPoints(@Param("points") Integer points);
}
