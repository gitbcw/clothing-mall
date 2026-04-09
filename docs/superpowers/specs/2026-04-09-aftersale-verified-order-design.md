# 自提已核销订单申请换货功能设计

## 背景

用户反馈自提订单完成（状态 502-已核销）后，订单详情页没有"申请换货"按钮。经调研发现：

- `OrderUtil.build()` 对状态 502 未设置 `handleOption.aftersale = true`
- `WxAftersaleController.submit()` 只接受 401/402 状态，不接受 502

## 目标

- 已核销（502）订单在 7 天内可申请换货
- 超时后不可申请（按钮不显示，后端亦拒绝）

## 修改范围

| 文件 | 改动 |
|------|------|
| `clothing-mall-db/.../OrderUtil.java` | 502 分支加 `setAftersale(true)`；新增 `isAftersaleAllowed()` |
| `clothing-mall-wx-api/.../WxAftersaleController.java` | `submit()` / `cancel()` 调用 `isAftersaleAllowed()` |

## 详细设计

### OrderUtil.java

**502 分支修改** — `build()` 方法中，status == 502 的分支：

```java
} else if (status == 502) {
    handleOption.setDelete(true);
    handleOption.setRebuy(true);
    handleOption.setAftersale(true);  // 新增
}
```

**新增方法** — `isAftersaleAllowed(LitemallOrder order)`：

```java
public static boolean isAftersaleAllowed(LitemallOrder order) {
    short status = order.getOrderStatus().shortValue();
    boolean isCompletedStatus = (status == STATUS_CONFIRM
                              || status == STATUS_AUTO_CONFIRM
                              || status == STATUS_VERIFIED);
    if (!isCompletedStatus) {
        return false;
    }
    // 7 天时限判断，以 updateTime 为准
    LocalDateTime deadline = order.getUpdateTime().plusDays(7);
    return LocalDateTime.now().isBefore(deadline);
}
```

其中 `STATUS_VERIFIED = 502`。

### WxAftersaleController.java

**submit() 方法** — 将原来的状态校验：

```java
if (!OrderUtil.isConfirmStatus(order) && !OrderUtil.isAutoConfirmStatus(order)) {
    return ResponseUtil.fail(WxResponseCode.AFTERSALE_UNALLOWED, "不能申请售后");
}
```

改为：

```java
if (!OrderUtil.isAftersaleAllowed(order)) {
    return ResponseUtil.fail(WxResponseCode.AFTERSALE_UNALLOWED, "超过售后申请时限或订单状态不支持售后");
}
```

**cancel() 方法** — 同上替换。

### 前端按钮行为

- 502 订单在核销后 7 天内：显示"申请换货"按钮
- 核销超过 7 天：`handleOption.aftersale = false`（`isAftersaleAllowed` 返回 false），按钮不显示
- 绕过前端直接调 API：后端返回错误

## 影响面

- 前端：无需改动，按钮逻辑自动生效
- 已有 401/402 订单：同样受 7 天限制（**行为变更**，需确认可接受）
- 售后其他状态（审核通过/已发货/已完成）：不受 7 天限制，可正常流转

## 回滚方式

- `OrderUtil.java`：删除 502 分支的 `setAftersale(true)` 并移除 `isAftersaleAllowed()` 方法
- `WxAftersaleController.java`：还原状态判断条件为原来的 401/402 两项

## 测试要点

1. 502 订单（已核销 7 天内）→ 按钮显示 → 可提交售后
2. 502 订单（已核销超过 7 天）→ 按钮不显示 → 后端拒绝
3. 401/402 订单（已收货 7 天内）→ 按钮显示 → 可提交售后
4. 401/402 订单（已收货超过 7 天）→ 按钮不显示 → 后端拒绝
5. 售后提交后订单 aftersale_status 正确更新
