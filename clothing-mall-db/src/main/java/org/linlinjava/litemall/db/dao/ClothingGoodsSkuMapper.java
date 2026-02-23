package org.linlinjava.litemall.db.dao;

import org.linlinjava.litemall.db.domain.ClothingGoodsSku;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ClothingGoodsSkuMapper {

    int insert(ClothingGoodsSku record);

    int insertSelective(ClothingGoodsSku record);

    int deleteByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(ClothingGoodsSku record);

    int updateByPrimaryKey(ClothingGoodsSku record);

    ClothingGoodsSku selectByPrimaryKey(Integer id);

    List<ClothingGoodsSku> selectByGoodsId(@Param("goodsId") Integer goodsId);

    List<ClothingGoodsSku> selectByGoodsIdAndColor(@Param("goodsId") Integer goodsId, @Param("color") String color);

    ClothingGoodsSku selectByGoodsIdColorSize(@Param("goodsId") Integer goodsId, @Param("color") String color, @Param("size") String size);

    int reduceStock(@Param("id") Integer id, @Param("num") Integer num);

    int addStock(@Param("id") Integer id, @Param("num") Integer num);

    List<ClothingGoodsSku> selectSelective(ClothingGoodsSku record);

    int countSelective(ClothingGoodsSku record);

    int deleteByGoodsId(@Param("goodsId") Integer goodsId);
}
