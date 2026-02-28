-- 售后数据
INSERT INTO litemall_aftersale (aftersale_sn, order_id, user_id, type, reason, amount, pictures, comment, status, handle_time, add_time, update_time, deleted) VALUES
('AS202602270001', 1, 1, 1, '商品质量问题', 99.00, '[]', 'T恤有破洞', 1, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW(), 0),
('AS202602270002', 3, 3, 2, '尺码不合适', 499.00, '[]', '羽绒服太小了', 0, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 0),
('AS202602270003', 5, 5, 1, '不喜欢', 399.00, '[]', '颜色和图片不一样', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), 0);

-- 团购规则
INSERT INTO litemall_groupon_rules (goods_id, goods_name, pic_url, discount, discount_member, expire_time, status, add_time, update_time, deleted) VALUES
(1181004, '简约纯色T恤', '', 79.00, 3, DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NOW(), NOW(), 0),
(1181006, '轻薄羽绒服', '', 399.00, 5, DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NOW(), NOW(), 0),
(1181008, '经典风衣外套', '', 299.00, 3, DATE_ADD(NOW(), INTERVAL 15 DAY), 1, NOW(), NOW(), 0);
