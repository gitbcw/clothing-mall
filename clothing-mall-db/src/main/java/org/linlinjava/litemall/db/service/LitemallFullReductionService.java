package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.linlinjava.litemall.db.dao.LitemallFullReductionMapper;
import org.linlinjava.litemall.db.domain.LitemallFullReduction;
import org.linlinjava.litemall.db.domain.LitemallFullReductionExample;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.List;

@Service
public class LitemallFullReductionService {
    @Resource
    private LitemallFullReductionMapper fullReductionMapper;

    public List<LitemallFullReduction> querySelective(String name, Short status,
            Integer page, Integer limit, String sort, String order) {
        LitemallFullReductionExample example = new LitemallFullReductionExample();
        LitemallFullReductionExample.Criteria criteria = example.createCriteria();

        if (!StringUtils.isEmpty(name)) {
            criteria.andNameLike("%" + name + "%");
        }
        if (status != null) {
            criteria.andStatusEqualTo(status);
        }
        criteria.andDeletedEqualTo(false);

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        }

        PageHelper.startPage(page, limit);
        return fullReductionMapper.selectByExample(example);
    }

    public LitemallFullReduction findById(Integer id) {
        return fullReductionMapper.selectByPrimaryKey(id);
    }

    public int add(LitemallFullReduction fullReduction) {
        return fullReductionMapper.insertSelective(fullReduction);
    }

    public int updateById(LitemallFullReduction fullReduction) {
        return fullReductionMapper.updateByPrimaryKeySelective(fullReduction);
    }

    public void deleteById(Integer id) {
        fullReductionMapper.logicalDeleteByPrimaryKey(id);
    }

    /**
     * 查询启用的满减规则（按门槛降序）
     */
    public List<LitemallFullReduction> queryEnabled() {
        LitemallFullReductionExample example = new LitemallFullReductionExample();
        example.or()
                .andStatusEqualTo(STATUS_ENABLED)
                .andDeletedEqualTo(false);
        example.setOrderByClause("threshold desc, sort_order asc");
        return fullReductionMapper.selectByExample(example);
    }

    /**
     * 满减活动状态：禁用
     */
    public static final short STATUS_DISABLED = 0;
    /**
     * 满减活动状态：启用
     */
    public static final short STATUS_ENABLED = 1;
}
