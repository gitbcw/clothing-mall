package org.linlinjava.litemall.db.service;

import org.linlinjava.litemall.db.dao.ClothingMemberLevelMapper;
import org.linlinjava.litemall.db.domain.ClothingMemberLevel;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class ClothingMemberLevelService {

    @Resource
    private ClothingMemberLevelMapper levelMapper;

    public List<ClothingMemberLevel> queryAll() {
        return levelMapper.selectAll();
    }

    public ClothingMemberLevel findById(Integer id) {
        return levelMapper.selectByPrimaryKey(id);
    }

    /**
     * 根据积分查询对应等级
     */
    public ClothingMemberLevel queryByPoints(Integer points) {
        if (points == null || points < 0) {
            points = 0;
        }
        return levelMapper.selectByPoints(points);
    }

    public int add(ClothingMemberLevel level) {
        return levelMapper.insert(level);
    }

    public int update(ClothingMemberLevel level) {
        return levelMapper.updateByPrimaryKeySelective(level);
    }

    public int delete(Integer id) {
        return levelMapper.deleteByPrimaryKey(id);
    }
}
