package org.linlinjava.litemall.db.domain;

import java.time.LocalDateTime;

public class ClothingActivityTop {
    private Integer id;
    private Integer goodsId;
    private Integer sortOrder;
    private LocalDateTime addTime;
    private LocalDateTime updateTime;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getGoodsId() { return goodsId; }
    public void setGoodsId(Integer goodsId) { this.goodsId = goodsId; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getAddTime() { return addTime; }
    public void setAddTime(LocalDateTime addTime) { this.addTime = addTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
