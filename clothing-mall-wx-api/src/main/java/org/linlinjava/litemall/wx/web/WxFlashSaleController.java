package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallFlashSale;
import org.linlinjava.litemall.db.service.LitemallFlashSaleService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小程序端 - 限时特卖
 */
@RestController
@RequestMapping("/wx/flashSale")
@Validated
public class WxFlashSaleController {
    private final Log logger = LogFactory.getLog(WxFlashSaleController.class);

    @Autowired
    private LitemallFlashSaleService flashSaleService;

    /**
     * 进行中的特卖列表
     */
    @GetMapping("/list")
    public Object list(@RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "sort_order") String sort,
                       @Order @RequestParam(defaultValue = "asc") String order) {
        List<LitemallFlashSale> flashSaleList = flashSaleService.querySelective(null, null,
                LitemallFlashSaleService.STATUS_ONGOING, page, limit, sort, order);
        return ResponseUtil.okList(flashSaleList);
    }

    /**
     * 特卖详情
     */
    @GetMapping("/detail")
    public Object detail(@RequestParam Integer id) {
        LitemallFlashSale flashSale = flashSaleService.findById(id);
        if (flashSale == null || flashSale.getStatus() != LitemallFlashSaleService.STATUS_ONGOING) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(flashSale);
    }

    /**
     * 查询商品的特卖信息
     */
    @GetMapping("/goods")
    public Object goods(@RequestParam Integer goodsId) {
        LitemallFlashSale flashSale = flashSaleService.findOngoingByGoodsId(goodsId);
        if (flashSale == null) {
            return ResponseUtil.ok(null);
        }
        return ResponseUtil.ok(flashSale);
    }
}
