package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallFullReduction;
import org.linlinjava.litemall.db.service.LitemallFullReductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 小程序端 - 满减活动
 */
@RestController
@RequestMapping("/wx/fullReduction")
@Validated
public class WxFullReductionController {
    private final Log logger = LogFactory.getLog(WxFullReductionController.class);

    @Autowired
    private LitemallFullReductionService fullReductionService;

    /**
     * 获取当前可用的满减活动列表
     */
    @GetMapping("/list")
    public Object list() {
        List<LitemallFullReduction> fullReductionList = fullReductionService.queryEnabled();
        return ResponseUtil.okList(fullReductionList);
    }
}
