package org.linlinjava.litemall.db.service;

import org.linlinjava.litemall.db.dao.ClothingGoodsSkuMapper;
import org.linlinjava.litemall.db.domain.ClothingGoodsSku;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Service
public class ClothingGoodsSkuService {

    @Resource
    private ClothingGoodsSkuMapper skuMapper;

    @Resource
    private LitemallGoodsService goodsService;

    public List<ClothingGoodsSku> queryByGoodsId(Integer goodsId) {
        return skuMapper.selectByGoodsId(goodsId);
    }

    /**
     * 根据商品款号查询SKU列表
     *
     * @param goodsSn 商品款号
     * @return SKU列表
     */
    public List<ClothingGoodsSku> queryByGoodsSn(String goodsSn) {
        if (goodsSn == null || goodsSn.trim().isEmpty()) {
            return new ArrayList<>();
        }
        LitemallGoods goods = goodsService.findByGoodsSn(goodsSn);
        if (goods == null) {
            return new ArrayList<>();
        }
        return skuMapper.selectByGoodsId(goods.getId());
    }

    public List<ClothingGoodsSku> queryByGoodsIdAndColor(Integer goodsId, String color) {
        return skuMapper.selectByGoodsIdAndColor(goodsId, color);
    }

    public ClothingGoodsSku queryByGoodsIdColorSize(Integer goodsId, String color, String size) {
        return skuMapper.selectByGoodsIdColorSize(goodsId, color, size);
    }

    public ClothingGoodsSku findById(Integer id) {
        return skuMapper.selectByPrimaryKey(id);
    }

    public int add(ClothingGoodsSku sku) {
        return skuMapper.insertSelective(sku);
    }

    public int update(ClothingGoodsSku sku) {
        return skuMapper.updateByPrimaryKeySelective(sku);
    }

    public int delete(Integer id) {
        return skuMapper.deleteByPrimaryKey(id);
    }

    public int deleteByGoodsId(Integer goodsId) {
        return skuMapper.deleteByGoodsId(goodsId);
    }

    /**
     * 减少库存
     */
    public int reduceStock(Integer id, Integer num) {
        return skuMapper.reduceStock(id, num);
    }

    /**
     * 增加库存
     */
    public int addStock(Integer id, Integer num) {
        return skuMapper.addStock(id, num);
    }

    /**
     * 检查库存是否充足
     */
    public boolean checkStock(Integer id, Integer num) {
        ClothingGoodsSku sku = findById(id);
        return sku != null && sku.getStock() >= num;
    }
}
