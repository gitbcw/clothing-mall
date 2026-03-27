package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.ClothingActivityTop;
import org.linlinjava.litemall.db.domain.LitemallGoods;
import org.linlinjava.litemall.db.service.ClothingActivityTopService;
import org.linlinjava.litemall.db.service.LitemallGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin/activity/top")
public class AdminActivityTopController {
    private final Log logger = LogFactory.getLog(AdminActivityTopController.class);

    @Autowired
    private ClothingActivityTopService activityTopService;

    @Autowired
    private LitemallGoodsService goodsService;

    @GetMapping("/list")
    public Object list() {
        List<ClothingActivityTop> topList = activityTopService.queryAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (ClothingActivityTop top : topList) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", top.getId());
            item.put("goodsId", top.getGoodsId());
            item.put("sortOrder", top.getSortOrder());
            LitemallGoods goods = goodsService.findById(top.getGoodsId());
            if (goods != null) {
                item.put("goodsName", goods.getName());
                item.put("picUrl", goods.getPicUrl());
                item.put("retailPrice", goods.getRetailPrice());
            }
            result.add(item);
        }
        return ResponseUtil.ok(result);
    }

    @PostMapping("/add")
    public Object add(@RequestBody Map<String, Object> body) {
        Integer goodsId = (Integer) body.get("goodsId");
        Integer sortOrder = body.get("sortOrder") != null ? ((Number) body.get("sortOrder")).intValue() : 0;

        if (goodsId == null) {
            return ResponseUtil.badArgument();
        }
        // Check for duplicate
        for (ClothingActivityTop existing : activityTopService.queryAll()) {
            if (existing.getGoodsId().equals(goodsId)) {
                return ResponseUtil.fail(402, "该商品已在活动位置顶中");
            }
        }

        ClothingActivityTop record = new ClothingActivityTop();
        record.setGoodsId(goodsId);
        record.setSortOrder(sortOrder);
        activityTopService.add(record);
        return ResponseUtil.ok();
    }

    @PostMapping("/delete")
    public Object delete(@RequestBody Map<String, Object> body) {
        Integer id = (Integer) body.get("id");
        if (id == null) {
            return ResponseUtil.badArgument();
        }
        activityTopService.remove(id);
        return ResponseUtil.ok();
    }

    @PostMapping("/update")
    public Object update(@RequestBody Map<String, Object> body) {
        Integer id = (Integer) body.get("id");
        Integer sortOrder = body.get("sortOrder") != null ? ((Number) body.get("sortOrder")).intValue() : 0;
        if (id == null) {
            return ResponseUtil.badArgument();
        }
        activityTopService.updateSortOrder(id, sortOrder);
        return ResponseUtil.ok();
    }
}
