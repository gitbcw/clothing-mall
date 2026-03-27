package org.linlinjava.litemall.db.service;

import org.linlinjava.litemall.db.dao.ClothingActivityTopMapper;
import org.linlinjava.litemall.db.domain.ClothingActivityTop;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Service
public class ClothingActivityTopService {

    @Resource
    private ClothingActivityTopMapper activityTopMapper;

    public List<ClothingActivityTop> queryAll() {
        return activityTopMapper.selectAll();
    }

    public List<Integer> queryTopGoodsIds() {
        List<ClothingActivityTop> list = activityTopMapper.selectAll();
        List<Integer> ids = new ArrayList<>();
        for (ClothingActivityTop item : list) {
            ids.add(item.getGoodsId());
        }
        return ids;
    }

    public void add(ClothingActivityTop record) {
        activityTopMapper.insert(record);
    }

    public void remove(Integer id) {
        activityTopMapper.deleteByPrimaryKey(id);
    }

    public void removeByGoodsId(Integer goodsId) {
        activityTopMapper.deleteByGoodsId(goodsId);
    }

    public void updateSortOrder(Integer id, Integer sortOrder) {
        activityTopMapper.updateSortOrder(id, sortOrder);
    }
}
