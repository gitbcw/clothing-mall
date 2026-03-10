package org.linlinjava.litemall.core.system;

import org.linlinjava.litemall.core.util.HttpUtil;
import org.linlinjava.litemall.core.util.JacksonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * 企业微信客户消息推送服务
 */
@Service
public class WeWorkService {

    private static final Logger logger = LoggerFactory.getLogger(WeWorkService.class);

    // Token 缓存
    private String cachedAccessToken;
    private long tokenExpireTime;

    /**
     * 获取access_token
     */
    private String getAccessToken() {
        String corpId = SystemConfig.getWeWorkCorpId();
        String secret = SystemConfig.getWeWorkContactSecret();

        if (corpId == null || corpId.isEmpty() || secret == null || secret.isEmpty()) {
            logger.warn("企业微信配置缺失：corpId 或 secret");
            return null;
        }

        // 检查缓存
        if (cachedAccessToken != null && tokenExpireTime > System.currentTimeMillis() / 1000) {
            return cachedAccessToken;
        }

        // 刷新token
        String url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=" + corpId + "&corpsecret=" + secret;
        try {
            String response = HttpUtil.get(url);
            Map<String, Object> result = JacksonUtil.fromJson(response, Map.class);
            if (result != null && result.get("errcode") != null && result.get("errcode").equals(0)) {
                cachedAccessToken = (String) result.get("access_token");
                tokenExpireTime = System.currentTimeMillis() / 1000 + 7000; // 约2小时有效期
                logger.info("获取企微access_token成功");
                return cachedAccessToken;
            } else {
                logger.error("获取企微access_token失败: {}", result);
            }
        } catch (Exception e) {
            logger.error("获取企微access_token异常", e);
        }

        return null;
    }

    /**
     * 发送订单发货通知
     *
     * @param externalUserId 客户的外部联系人ID
     * @param orderSn        订单号
     * @param shipChannel    快递公司
     * @param shipSn         快递单号
     * @return 是否发送成功
     */
    public boolean sendShipNotification(String externalUserId, String orderSn,
                                         String shipChannel, String shipSn) {
        String accessToken = getAccessToken();
        if (accessToken == null) {
            logger.warn("企微推送失败：无法获取access_token");
            return false;
        }

        String sender = SystemConfig.getWeWorkSenderId();
        if (sender == null || sender.isEmpty()) {
            logger.warn("企微推送失败：未配置发送者账号");
            return false;
        }

        Map<String, Object> message = new HashMap<>();
        message.put("chat_type", "single");
        message.put("external_userid", Collections.singletonList(externalUserId));
        message.put("sender", sender);

        Map<String, String> text = new HashMap<>();
        text.put("content", String.format(
                "您好，您的订单 %s 已发货！\n快递公司：%s\n快递单号：%s",
                orderSn, shipChannel, shipSn));
        message.put("text", text);

        return postMessageTemplate(accessToken, message);
    }

    /**
     * 按标签群发活动消息
     *
     * @param tagId   标签ID
     * @param content 消息内容
     * @return 是否发送成功
     */
    public boolean sendPromotionByTag(String tagId, String content) {
        String accessToken = getAccessToken();
        if (accessToken == null) {
            logger.warn("企微推送失败：无法获取access_token");
            return false;
        }

        String sender = SystemConfig.getWeWorkSenderId();
        if (sender == null || sender.isEmpty()) {
            logger.warn("企微推送失败：未配置发送者账号");
            return false;
        }

        Map<String, Object> message = new HashMap<>();
        message.put("chat_type", "single");
        message.put("sender", sender);

        // 按标签筛选客户
        Map<String, Object> filter = new HashMap<>();
        filter.put("tag_list", Collections.singletonList(tagId));
        message.put("filter", filter);

        Map<String, String> text = new HashMap<>();
        text.put("content", content);
        message.put("text", text);

        return postMessageTemplate(accessToken, message);
    }

    /**
     * 发送生日祝福
     *
     * @param externalUserId 客户的外部联系人ID
     * @param userName       用户名
     * @return 是否发送成功
     */
    public boolean sendBirthdayGreeting(String externalUserId, String userName) {
        String accessToken = getAccessToken();
        if (accessToken == null) {
            logger.warn("企微推送失败：无法获取access_token");
            return false;
        }

        String sender = SystemConfig.getWeWorkSenderId();
        if (sender == null || sender.isEmpty()) {
            logger.warn("企微推送失败：未配置发送者账号");
            return false;
        }

        Map<String, Object> message = new HashMap<>();
        message.put("chat_type", "single");
        message.put("external_userid", Collections.singletonList(externalUserId));
        message.put("sender", sender);

        Map<String, String> text = new HashMap<>();
        text.put("content", String.format("亲爱的 %s，祝您生日快乐！🎂\n专属生日优惠券已发放到您的账户，快来选购心仪的商品吧！", userName));
        message.put("text", text);

        return postMessageTemplate(accessToken, message);
    }

    /**
     * 调用企微消息模板API
     */
    private boolean postMessageTemplate(String accessToken, Map<String, Object> message) {
        String url = "https://qyapi.weixin.qq.com/cgi-bin/externalcontact/add_msg_template?access_token=" + accessToken;
        try {
            String body = JacksonUtil.toJson(message);
            String response = HttpUtil.post(url, body);
            Map<String, Object> result = JacksonUtil.fromJson(response, Map.class);
            if (result != null && result.get("errcode") != null && result.get("errcode").equals(0)) {
                logger.info("企微消息推送成功");
                return true;
            } else {
                logger.error("企微消息推送失败: {}", result);
            }
        } catch (Exception e) {
            logger.error("企微消息推送异常", e);
        }
        return false;
    }
}
