package org.linlinjava.litemall.core.task;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.db.domain.LitemallPushLog;
import org.linlinjava.litemall.db.service.LitemallPushLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 定时推送任务
 * 每分钟检查一次待发送的定时推送
 * 使用乐观锁确保多实例部署时不会重复执行
 *
 * TODO: 重试机制需要数据库支持 retry_count 字段
 * 建议在后续迭代中添加：
 * 1. litemall_push_log 表添加 retry_count 字段
 * 2. 失败时检查 retry_count < MAX_RETRY，改回 pending 状态并推迟 scheduled_at
 * 3. 超过最大重试次数后标记为 failed
 */
@Component
public class ScheduledPushTask {
    private final Log logger = LogFactory.getLog(ScheduledPushTask.class);

    private static final int MAX_RETRY = 3;

    @Autowired
    private LitemallPushLogService pushLogService;

    /**
     * 每分钟执行一次，检查待发送的定时推送
     */
    @Scheduled(cron = "0 * * * * ?")
    public void checkScheduledPush() {
        try {
            // 查询状态为 pending 且 scheduled_at <= 当前时间的推送
            List<LitemallPushLog> pendingPushList = pushLogService.findPendingScheduled();

            if (pendingPushList.isEmpty()) {
                return;
            }

            logger.info("发现 " + pendingPushList.size() + " 条待发送的定时推送");

            for (LitemallPushLog pushLog : pendingPushList) {
                try {
                    // 使用乐观锁尝试获取执行权，只有成功锁定的才执行
                    if (!pushLogService.tryLockForSending(pushLog.getId())) {
                        logger.debug("推送任务已被其他实例锁定: " + pushLog.getTitle());
                        continue;
                    }

                    // TODO: 实际推送逻辑需要集成企业微信服务
                    // 这里暂时标记为已发送
                    int successCount = 1;
                    int failCount = 0;

                    // 更新推送结果
                    pushLog.setStatus("sent");
                    pushLog.setSuccessCount(successCount);
                    pushLog.setFailCount(failCount);
                    pushLog.setTotalCount(successCount + failCount);
                    pushLog.setSentAt(LocalDateTime.now());
                    pushLog.setUpdateTime(LocalDateTime.now());
                    pushLogService.updateById(pushLog);

                    logger.info("定时推送发送成功: " + pushLog.getTitle());

                } catch (Exception e) {
                    logger.error("定时推送发送失败: " + pushLog.getTitle(), e);
                    // 更新失败状态
                    pushLog.setStatus("failed");
                    pushLog.setErrorMsg(e.getMessage());
                    pushLog.setUpdateTime(LocalDateTime.now());
                    pushLogService.updateById(pushLog);
                }
            }
        } catch (Exception e) {
            logger.error("定时推送任务执行失败", e);
        }
    }
}
