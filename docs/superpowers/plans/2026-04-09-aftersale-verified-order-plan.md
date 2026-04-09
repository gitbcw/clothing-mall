# 自提已核销订单申请换货功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让已核销（502）自提订单在 7 天内可申请换货，同时统一 401/402/502 三种已完成状态的 7 天售后时限。

**Architecture:** 在 `OrderUtil` 中新增 `isAftersaleAllowed()` 方法统一判断状态+时限；在 `build()` 方法 502 分支加入 `setAftersale(true)`；在 `WxAftersaleController.submit()` 和 `cancel()` 中替换原状态校验逻辑。

**Tech Stack:** Java (Spring Boot), MyBatis, Litemall 框架

---

## 文件修改概览

| 文件 | 改动类型 | 改动内容 |
|------|---------|---------|
| `clothing-mall-db/.../util/OrderUtil.java` | 修改 | 1. 添加 import<br>2. 502 分支加 `setAftersale(true)`<br>3. 新增 `isAftersaleAllowed()` 方法 |
| `clothing-mall-wx-api/.../web/WxAftersaleController.java` | 修改 | submit() 和 cancel() 两处状态校验改为调用 `OrderUtil.isAftersaleAllowed()` |

---

## Task 1: OrderUtil.java — 添加 import 和 502 分支修改

**文件:** `clothing-mall-db/src/main/java/org/linlinjava/litemall/db/util/OrderUtil.java`

- [ ] **Step 1: 添加 LocalDateTime import**

在文件顶部 `import java.util.List;` 后添加：

```java
import java.time.LocalDateTime;
```

- [ ] **Step 2: 502 分支加入 setAftersale(true)**

找到 `build()` 方法中 `status == 502` 的分支（第132-134行），在 `handleOption.setRebuy(true);` 后添加：

```java
handleOption.setAftersale(true);
```

修改后完整分支为：

```java
} else if (status == 502) {
    handleOption.setDelete(true);
    handleOption.setRebuy(true);
    handleOption.setAftersale(true);
}
```

- [ ] **Step 3: 新增 isAftersaleAllowed() 方法**

在 `OrderUtil` 类末尾（`isAutoConfirmStatus()` 方法之后，`}` 结束符之前）添加：

```java
/**
 * 判断订单是否在售后申请时限内（已完成状态且 7 天内）
 *
 * @param order 订单对象
 * @return true 表示可申请售后
 */
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

- [ ] **Step 4: 验证编译**

```bash
cd clothing-mall && mvn compile -pl clothing-mall-db -q
```

预期：无编译错误。

- [ ] **Step 5: 提交**

```bash
git add clothing-mall-db/src/main/java/org/linlinjava/litemall/db/util/OrderUtil.java
git commit -m "feat(db): 502订单支持售后申请并增加7天时限判断

- OrderUtil.build(): 502分支新增setAftersale(true)
- 新增isAftersaleAllowed()方法统一判断状态和时限
- 影响: 401/402/502三种已完成状态均受7天限制"
```

---

## Task 2: WxAftersaleController.java — submit() 和 cancel() 两处替换

**文件:** `clothing-mall-wx-api/src/main/java/org/linlinjava/litemall/wx/web/WxAftersaleController.java`

- [ ] **Step 1: 修改 submit() 中的状态校验（第137-139行）**

将：
```java
if(!OrderUtil.isConfirmStatus(order) && !OrderUtil.isAutoConfirmStatus(order)){
    return ResponseUtil.fail(WxResponseCode.AFTERSALE_UNALLOWED, "不能申请售后");
}
```

替换为：
```java
if(!OrderUtil.isAftersaleAllowed(order)){
    return ResponseUtil.fail(WxResponseCode.AFTERSALE_UNALLOWED, "超过售后申请时限或订单状态不支持售后");
}
```

- [ ] **Step 2: 修改 cancel() 中的状态校验（第188-191行）**

将：
```java
if(!OrderUtil.isConfirmStatus(order) && !OrderUtil.isAutoConfirmStatus(order)){
    return ResponseUtil.fail(WxResponseCode.AFTERSALE_UNALLOWED, "不支持售后");
}
```

替换为：
```java
if(!OrderUtil.isAftersaleAllowed(order)){
    return ResponseUtil.fail(WxResponseCode.AFTERSALE_UNALLOWED, "超过售后申请时限或订单状态不支持售后");
}
```

- [ ] **Step 3: 验证编译**

```bash
cd clothing-mall && mvn compile -pl clothing-mall-wx-api -am -q
```

预期：无编译错误。

- [ ] **Step 4: 提交**

```bash
git add clothing-mall-wx-api/src/main/java/org/linlinjava/litemall/wx/web/WxAftersaleController.java
git commit -m "feat(wx): 售后申请/取消改用isAftersaleAllowed统一判断

- submit(): 替换状态校验为isAftersaleAllowed()
- cancel(): 同上
- 统一支持401/402/502三种已完成状态并受7天时限限制"
```

---

## 实施检查清单

完成所有步骤后，验证以下内容：

- [ ] `OrderUtil.isAftersaleAllowed()` 新增逻辑正确（STATUS_CONFIRM/STATUS_AUTO_CONFIRM/STATUS_VERIFIED + 7天）
- [ ] `OrderUtil.build()` 502 分支 `setAftersale(true)` 已添加
- [ ] `WxAftersaleController.submit()` 第137行已替换为 `isAftersaleAllowed()`
- [ ] `WxAftersaleController.cancel()` 第189行已替换为 `isAftersaleAllowed()`
- [ ] `mvn compile` 两个模块均无错误
- [ ] git commit 已完成（两个 commit）
