package org.linlinjava.litemall.wx;

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
 * 小程序OCR库存识别测试
 * 测试用图片：C:/Users/cbw/Desktop/pic.png
 */
public class WxOcrTest {

    /**
     * 测试用桌面图片识别
     */
    @Test
    public void testRecognizeFromDesktopImage() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setApiKey("d6adXCnmEoURuO0Lx9keO9LL");
        properties.setSecretKey("TplRPeZIlxaDehEXvEcEPeagMvpbfWyM");

        OcrService ocrService = new OcrService();

        // 使用反射设置属性
        try {
            Field field = OcrService.class.getDeclaredField("ocrProperties");
            field.setAccessible(true);
            field.set(ocrService, properties);

            System.out.println("=== 测试小程序OCR识别 ===");

            // 测试解析桌面上的库存表格图片
            File testImage = new File("C:/Users/cbw/Desktop/pic.png");

            if (!testImage.exists()) {
                System.out.println("测试图片不存在: " + testImage.getAbsolutePath());
                fail("测试图片不存在");
                return;
            }

            byte[] imageBytes = Files.readAllBytes(testImage.toPath());
            System.out.println("图片大小: " + imageBytes.length + " bytes");

            List<OcrService.InventoryItem> items = ocrService.parseInventoryImage(imageBytes);
            System.out.println("识别结果数量: " + items.size());

            for (OcrService.InventoryItem item : items) {
                System.out.println("  - 商品编号: " + item.getGoodsSn() +
                        ", 颜色: " + item.getColor() +
                        ", 尺码: " + item.getSize() +
                        ", 数量: " + item.getQuantity());
            }

            assertTrue("应该识别到库存数据", items.size() > 0);

            // 验证识别到的数据
            for (OcrService.InventoryItem item : items) {
                assertNotNull("商品编号不能为空", item.getGoodsSn());
                assertTrue("商品编号应该是6位数字", item.getGoodsSn().matches("\\d{6}"));
                // 验证款号是806206
                assertEquals("款号应该是806206", "806206", item.getGoodsSn());
                System.out.println("识别成功: " + item.getGoodsSn());
            }

            assertTrue("应该识别到至少一条数据", items.size() > 0);
            System.out.println("=== OCR识别测试成功! ===");

            System.out.println("=== OCR识别测试成功! ===");

        } catch (Exception e) {
            System.err.println("OCR识别失败: " + e.getMessage());
            e.printStackTrace();
            fail("测试失败: " + e.getMessage());
        }
    }
}
