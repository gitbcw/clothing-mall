package org.linlinjava.litemall.db.dao;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import org.linlinjava.litemall.db.domain.LitemallFullReduction;
import org.linlinjava.litemall.db.domain.LitemallFullReductionExample;

public interface LitemallFullReductionMapper {
    long countByExample(LitemallFullReductionExample example);

    int deleteByExample(LitemallFullReductionExample example);

    int deleteByPrimaryKey(Integer id);

    int insert(LitemallFullReduction record);

    int insertSelective(LitemallFullReduction record);

    LitemallFullReduction selectOneByExample(LitemallFullReductionExample example);

    LitemallFullReduction selectOneByExampleSelective(@Param("example") LitemallFullReductionExample example, @Param("selective") LitemallFullReduction.Column ... selective);

    List<LitemallFullReduction> selectByExampleSelective(@Param("example") LitemallFullReductionExample example, @Param("selective") LitemallFullReduction.Column ... selective);

    List<LitemallFullReduction> selectByExample(LitemallFullReductionExample example);

    LitemallFullReduction selectByPrimaryKeySelective(@Param("id") Integer id, @Param("selective") LitemallFullReduction.Column ... selective);

    LitemallFullReduction selectByPrimaryKey(Integer id);

    LitemallFullReduction selectByPrimaryKeyWithLogicalDelete(@Param("id") Integer id, @Param("andLogicalDeleted") boolean andLogicalDeleted);

    int updateByExampleSelective(@Param("record") LitemallFullReduction record, @Param("example") LitemallFullReductionExample example);

    int updateByExample(@Param("record") LitemallFullReduction record, @Param("example") LitemallFullReductionExample example);

    int updateByPrimaryKeySelective(LitemallFullReduction record);

    int updateByPrimaryKey(LitemallFullReduction record);

    int logicalDeleteByExample(@Param("example") LitemallFullReductionExample example);

    int logicalDeleteByPrimaryKey(Integer id);
}
