package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.linlinjava.litemall.db.dao.LitemallFlashSaleMapper;
import org.linlinjava.litemall.db.domain.LitemallFlashSale;
import org.linlinjava.litemall.db.domain.LitemallFlashSaleExample;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LitemallFlashSaleService {
    @Resource
    private LitemallFlashSaleMapper flashSaleMapper;

    /**
     * 特卖状态：未开始
     */
    public static final short STATUS_NOT_START = 0;
    /**
     * 特卖状态：进行中
     */
    public static final short STATUS_ONGOING = 1;
    /**
     * 特卖状态：已结束
     */
    public static final short STATUS_ENDED = 2;

    public List<LitemallFlashSale> querySelective(Integer goodsId, String goodsName,
            Short status, Integer page, Integer limit, String sort, String order) {
        LitemallFlashSaleExample example = new LitemallFlashSaleExample();
        LitemallFlashSaleExample.Criteria criteria = example.createCriteria();

        if (goodsId != null) {
            criteria.andGoodsIdEqualTo(goodsId);
        }
        if (!StringUtils.isEmpty(goodsName)) {
            criteria.andGoodsNameLike("%" + goodsName + "%");
        }
        if (status != null) {
            criteria.andStatusEqualTo(status);
        }
        criteria.andDeletedEqualTo(false);

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        }

        PageHelper.startPage(page, limit);
        return flashSaleMapper.selectByExample(example);
    }

    public LitemallFlashSale findById(Integer id) {
        return flashSaleMapper.selectByPrimaryKey(id);
    }

    /**
     * 查询指定商品的进行中特卖
     */
    public LitemallFlashSale findOngoingByGoodsId(Integer goodsId) {
        LitemallFlashSaleExample example = new LitemallFlashSaleExample();
        example.or()
                .andGoodsIdEqualTo(goodsId)
                .andStatusEqualTo(STATUS_ONGOING)
                .andDeletedEqualTo(false);
        List<LitemallFlashSale> list = flashSaleMapper.selectByExample(example);
        return list.isEmpty() ? null : list.get(0);
    }

    /**
     * 查询当前进行中的特卖列表
     */
    public List<LitemallFlashSale> queryOngoing(int offset, int limit) {
        LitemallFlashSaleExample example = new LitemallFlashSaleExample();
        example.or()
                .andStatusEqualTo(STATUS_ONGOING)
                .andDeletedEqualTo(false);
        example.setOrderByClause("sort_order asc, add_time desc");
        PageHelper.startPage(offset / limit + 1, limit);
        return flashSaleMapper.selectByExample(example);
    }

    /**
     * 扣减特卖库存
     *
     * @param id     特卖ID
     * @param number 扣减数量
     * @return 是否成功
     */
    public boolean reduceStock(Integer id, Integer number) {
        LitemallFlashSale flashSale = findById(id);
        if (flashSale == null) {
            return false;
        }
        Integer remainStock = flashSale.getFlashStock() - number;
        if (remainStock < 0) {
            return false;
        }
        LitemallFlashSale update = new LitemallFlashSale();
        update.setId(id);
        update.setFlashStock(remainStock);
        update.setFlashSales(flashSale.getFlashSales() + number);
        return flashSaleMapper.updateByPrimaryKeySelective(update) > 0;
    }

    /**
     * 增加特卖库存（订单取消时恢复）
     *
     * @param id     特卖ID
     * @param number 增加数量
     * @return 是否成功
     */
    public boolean addStock(Integer id, Integer number) {
        LitemallFlashSale flashSale = findById(id);
        if (flashSale == null) {
            return false;
        }
        LitemallFlashSale update = new LitemallFlashSale();
        update.setId(id);
        update.setFlashStock(flashSale.getFlashStock() + number);
        // 已售数量减少（如果大于0）
        int newSales = flashSale.getFlashSales() - number;
        update.setFlashSales(Math.max(newSales, 0));
        return flashSaleMapper.updateByPrimaryKeySelective(update) > 0;
    }

    /**
     * 更新特卖状态（根据时间自动更新）
     */
    public void updateStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 未开始 -> 进行中
        LitemallFlashSaleExample example1 = new LitemallFlashSaleExample();
        example1.or()
                .andStatusEqualTo(STATUS_NOT_START)
                .andStartTimeLessThanOrEqualTo(now)
                .andEndTimeGreaterThan(now)
                .andDeletedEqualTo(false);
        LitemallFlashSale update1 = new LitemallFlashSale();
        update1.setStatus(STATUS_ONGOING);
        flashSaleMapper.updateByExampleSelective(update1, example1);

        // 进行中 -> 已结束
        LitemallFlashSaleExample example2 = new LitemallFlashSaleExample();
        example2.or()
                .andStatusEqualTo(STATUS_ONGOING)
                .andEndTimeLessThanOrEqualTo(now)
                .andDeletedEqualTo(false);
        LitemallFlashSale update2 = new LitemallFlashSale();
        update2.setStatus(STATUS_ENDED);
        flashSaleMapper.updateByExampleSelective(update2, example2);
    }

    public int add(LitemallFlashSale flashSale) {
        return flashSaleMapper.insertSelective(flashSale);
    }

    public int updateById(LitemallFlashSale flashSale) {
        return flashSaleMapper.updateByPrimaryKeySelective(flashSale);
    }

    public void deleteById(Integer id) {
        flashSaleMapper.logicalDeleteByPrimaryKey(id);
    }
}
