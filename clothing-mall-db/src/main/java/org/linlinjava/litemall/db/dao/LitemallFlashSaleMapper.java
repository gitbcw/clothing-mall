package org.linlinjava.litemall.db.dao;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import org.linlinjava.litemall.db.domain.LitemallFlashSale;
import org.linlinjava.litemall.db.domain.LitemallFlashSaleExample;

public interface LitemallFlashSaleMapper {
    long countByExample(LitemallFlashSaleExample example);

    int deleteByExample(LitemallFlashSaleExample example);

    int deleteByPrimaryKey(Integer id);

    int insert(LitemallFlashSale record);

    int insertSelective(LitemallFlashSale record);

    LitemallFlashSale selectOneByExample(LitemallFlashSaleExample example);

    LitemallFlashSale selectOneByExampleSelective(@Param("example") LitemallFlashSaleExample example, @Param("selective") LitemallFlashSale.Column ... selective);

    List<LitemallFlashSale> selectByExampleSelective(@Param("example") LitemallFlashSaleExample example, @Param("selective") LitemallFlashSale.Column ... selective);

    List<LitemallFlashSale> selectByExample(LitemallFlashSaleExample example);

    LitemallFlashSale selectByPrimaryKeySelective(@Param("id") Integer id, @Param("selective") LitemallFlashSale.Column ... selective);

    LitemallFlashSale selectByPrimaryKey(Integer id);

    LitemallFlashSale selectByPrimaryKeyWithLogicalDelete(@Param("id") Integer id, @Param("andLogicalDeleted") boolean andLogicalDeleted);

    int updateByExampleSelective(@Param("record") LitemallFlashSale record, @Param("example") LitemallFlashSaleExample example);

    int updateByExample(@Param("record") LitemallFlashSale record, @Param("example") LitemallFlashSaleExample example);

    int updateByPrimaryKeySelective(LitemallFlashSale record);

    int updateByPrimaryKey(LitemallFlashSale record);

    int logicalDeleteByExample(@Param("example") LitemallFlashSaleExample example);

    int logicalDeleteByPrimaryKey(Integer id);
}
