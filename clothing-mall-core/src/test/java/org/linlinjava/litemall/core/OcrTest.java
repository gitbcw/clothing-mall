package org.linlinjava.litemall.core;

import org.junit.Test;
import org.linlinjava.litemall.core.ocr.OcrProperties;
import org.linlinjava.litemall.core.ocr.OcrService;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.util.List;

import static org.junit.Assert.*;

/**
 * 百度OCR服务测试
 *
 * 测试方法：
 * 1. 确保 application-core.yml 中已配置正确的 api-key 和 secret-key
 * 2. 确保 ocr.enabled = true
 * 3. 运行测试
 */
public class OcrTest {

    /**
     * 测试百度OCR API连接和图片识别
     */
    @Test
    public void testAccessToken() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setApiKey("d6adXCnmEoURuO0Lx9keO9LL");
        properties.setSecretKey("TplRPeZIlxaDehEXvEcEPeagMvpbfWyM");

        // 创建一个简单的OcrService来测试
        OcrService ocrService = new OcrService();

        // 使用反射设置属性（因为OcrService使用了@Autowired）
        try {
            Field field = OcrService.class.getDeclaredField("ocrProperties");
            field.setAccessible(true);
            field.set(ocrService, properties);

            System.out.println("=== 测试百度OCR Access Token ===");

            // 测试解析桌面上的库存表格图片
            File testImage = new File("C:/Users/cbw/Desktop/yjx.jpg");

            if (testImage.exists()) {
                byte[] imageBytes = Files.readAllBytes(testImage.toPath());
                System.out.println("图片大小: " + imageBytes.length + " bytes");

                try {
                    List<OcrService.InventoryItem> items = ocrService.parseInventoryImage(imageBytes);
                    System.out.println("识别结果数量: " + items.size());

                    for (OcrService.InventoryItem item : items) {
                        System.out.println("  - 商品编号: " + item.getGoodsSn() +
                                ", 颜色: " + item.getColor() +
                                ", 尺码: " + item.getSize() +
                                ", 数量: " + item.getQuantity());
                    }

                    assertTrue("应该识别到至少一条数据", items.size() > 0);
                    System.out.println("=== OCR测试成功! ===");

                } catch (Exception e) {
                    System.err.println("OCR识别失败: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("测试图片不存在: " + testImage.getAbsolutePath());
                System.out.println("请确认图片路径是否正确");
            }

        } catch (Exception e) {
            e.printStackTrace();
            fail("测试失败: " + e.getMessage());
        }
    }
}
