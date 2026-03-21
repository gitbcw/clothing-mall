package org.linlinjava.litemall.wx.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.linlinjava.litemall.core.system.AiConfig;
import org.linlinjava.litemall.db.domain.LitemallStorage;
import org.linlinjava.litemall.db.service.LitemallStorageService;
import org.linlinjava.litemall.wx.annotation.support.LoginUserHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * WxAiController 测试
 *
 * 使用简单的 Mock 服务替代 Mockito
 */
public class WxAiControllerTest {

    private MockMvc mvc;
    private MockStorageService mockStorageService;
    private MockAiConfig mockAiConfig;
    private WxAiController controller;
    private ObjectMapper objectMapper;

    /**
     * 简单的 Mock 存储服务
     */
    static class MockStorageService extends LitemallStorageService {
        private Map<Integer, LitemallStorage> storages = new HashMap<>();

        public void addStorage(LitemallStorage storage) {
            storages.put(storage.getId(), storage);
        }

        @Override
        public LitemallStorage findById(Integer id) {
            return storages.get(id);
        }
    }

    /**
     * 简单的 Mock AI 配置
     */
    static class MockAiConfig extends AiConfig {
        private boolean enabled = false;
        private String provider = "mock";

        @Override
        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        @Override
        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }
    }

    @Before
    public void setup() {
        controller = new WxAiController();
        mockStorageService = new MockStorageService();
        mockAiConfig = new MockAiConfig();

        org.springframework.test.util.ReflectionTestUtils.setField(controller, "storageService", mockStorageService);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "aiConfig", mockAiConfig);

        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new LoginUserHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();
    }

    // ============ 状态检查测试 ============

    @Test
    public void testStatus_disabled() throws Exception {
        mockAiConfig.setEnabled(false);
        mockAiConfig.setProvider("mock");

        mvc.perform(get("/wx/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(0))
                .andExpect(jsonPath("$.data.enabled").value(false))
                .andExpect(jsonPath("$.data.provider").value("mock"));
    }

    @Test
    public void testStatus_enabled() throws Exception {
        mockAiConfig.setEnabled(true);
        mockAiConfig.setProvider("openai");

        mvc.perform(get("/wx/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(0))
                .andExpect(jsonPath("$.data.enabled").value(true))
                .andExpect(jsonPath("$.data.provider").value("openai"));
    }

    // ============ URL 识别测试 ============

    @Test
    public void testRecognizeByUrl_emptyUrl() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("imageUrl", "");

        mvc.perform(post("/wx/ai/recognizeByUrl")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(401));
    }

    @Test
    public void testRecognizeByUrl_nullUrl() throws Exception {
        Map<String, Object> body = new HashMap<>();
        // 不传 imageUrl

        mvc.perform(post("/wx/ai/recognizeByUrl")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(401));
    }

    @Test
    public void testRecognizeByUrl_validUrl_mock() throws Exception {
        mockAiConfig.setEnabled(false);

        Map<String, Object> body = new HashMap<>();
        body.put("imageUrl", "https://example.com/clothes.jpg");

        mvc.perform(post("/wx/ai/recognizeByUrl")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(0))
                .andExpect(jsonPath("$.data.isMock").value(true))
                .andExpect(jsonPath("$.data.name").exists())
                .andExpect(jsonPath("$.data.category").exists())
                .andExpect(jsonPath("$.data.color").exists())
                .andExpect(jsonPath("$.data.material").exists())
                .andExpect(jsonPath("$.data.style").exists())
                .andExpect(jsonPath("$.data.confidence").exists());
    }

    @Test
    public void testRecognizeByUrl_resultHasAllFields() throws Exception {
        mockAiConfig.setEnabled(false);

        Map<String, Object> body = new HashMap<>();
        body.put("imageUrl", "https://example.com/test.jpg");

        mvc.perform(post("/wx/ai/recognizeByUrl")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").isString())
                .andExpect(jsonPath("$.data.category").isString())
                .andExpect(jsonPath("$.data.color").isString())
                .andExpect(jsonPath("$.data.size").isString())
                .andExpect(jsonPath("$.data.material").isString())
                .andExpect(jsonPath("$.data.style").isString())
                .andExpect(jsonPath("$.data.season").isString())
                .andExpect(jsonPath("$.data.pattern").isString())
                .andExpect(jsonPath("$.data.brief").isString())
                .andExpect(jsonPath("$.data.confidence").isNumber())
                .andExpect(jsonPath("$.data.imageUrl").value("https://example.com/test.jpg"));
    }

    // ============ 上传识别测试 ============

    @Test
    public void testRecognize_noParams() throws Exception {
        Map<String, Object> body = new HashMap<>();
        // 不传任何参数

        mvc.perform(post("/wx/ai/recognize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(401));
    }

    @Test
    public void testRecognize_withStorageId() throws Exception {
        mockAiConfig.setEnabled(false);

        // Mock storage
        LitemallStorage storage = new LitemallStorage();
        storage.setId(1);
        storage.setUrl("https://example.com/storage.jpg");
        mockStorageService.addStorage(storage);

        Map<String, Object> body = new HashMap<>();
        body.put("storageId", 1);

        mvc.perform(post("/wx/ai/recognize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(0))
                .andExpect(jsonPath("$.data.isMock").value(true));
    }

    @Test
    public void testRecognize_withFileKey() throws Exception {
        mockAiConfig.setEnabled(false);

        Map<String, Object> body = new HashMap<>();
        body.put("fileKey", "uploads/test.jpg");

        mvc.perform(post("/wx/ai/recognize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errno").value(0))
                .andExpect(jsonPath("$.data.isMock").value(true));
    }
}
