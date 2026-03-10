"""
API 测试配置和 fixtures
"""
import pytest
import requests
from typing import Optional


class APIClient:
    """API 客户端"""

    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.admin_token: Optional[str] = None
        self.user_token: Optional[str] = None

    def set_admin_token(self, token: str):
        """设置管理端 Token"""
        self.admin_token = token
        self.session.headers["X-Litemall-Admin-Token"] = token

    def set_user_token(self, token: str):
        """设置用户端 Token"""
        self.user_token = token
        self.session.headers["X-Litemall-Token"] = token

    def clear_tokens(self):
        """清除所有 Token"""
        self.admin_token = None
        self.user_token = None
        self.session.headers.pop("X-Litemall-Admin-Token", None)
        self.session.headers.pop("X-Litemall-Token", None)

    def request(self, method: str, path: str, **kwargs) -> requests.Response:
        """发送请求"""
        url = f"{self.base_url}{path}"
        kwargs.setdefault("timeout", self.timeout)
        return self.session.request(method, url, **kwargs)

    def get(self, path: str, **kwargs) -> requests.Response:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs) -> requests.Response:
        return self.request("POST", path, **kwargs)

    def put(self, path: str, **kwargs) -> requests.Response:
        return self.request("PUT", path, **kwargs)

    def delete(self, path: str, **kwargs) -> requests.Response:
        return self.request("DELETE", path, **kwargs)


@pytest.fixture(scope="session")
def api_client(config) -> APIClient:
    """API 客户端 fixture"""
    return APIClient(config.API_BASE_URL, config.DEFAULT_TIMEOUT)


@pytest.fixture(scope="function")
def admin_client(api_client) -> APIClient:
    """已登录管理端的 API 客户端"""
    # 尝试登录，如果服务不可用则跳过测试
    try:
        token = login_admin(api_client)
        api_client.set_admin_token(token)
        yield api_client
    except AssertionError as e:
        if "502" in str(e) or "503" in str(e):
            pytest.skip("后端服务暂时不可用")
        raise
    finally:
        api_client.clear_tokens()


def login_admin(client: APIClient, username: str = None, password: str = None) -> str:
    """管理端登录，返回 Token"""
    from tests.conftest import Config

    username = username or Config.ADMIN_USERNAME
    password = password or Config.ADMIN_PASSWORD

    resp = client.post("/admin/auth/login", json={
        "username": username,
        "password": password
    })

    assert resp.status_code == 200, f"登录失败: {resp.text}"

    data = resp.json()
    assert data.get("errno") == 0, f"登录失败: {data}"
    assert "data" in data, "响应缺少 data 字段"
    assert "token" in data["data"], "响应缺少 token 字段"

    return data["data"]["token"]


# ==================== 响应断言工具 ====================

class ResponseAssert:
    """响应断言工具类"""

    @staticmethod
    def success(response: requests.Response, message: str = None):
        """断言响应成功"""
        # 服务不可用时跳过测试
        if response.status_code in [502, 503]:
            pytest.skip(f"后端服务暂时不可用 ({response.status_code})")

        assert response.status_code == 200, f"HTTP 状态码错误: {response.status_code}"
        data = response.json()
        assert data.get("errno") == 0, f"业务错误: {data.get('errmsg', data)}"

        if message:
            print(f"✓ {message}")
        return data.get("data")

    @staticmethod
    def error(response: requests.Response, expected_errno: int = None):
        """断言响应失败"""
        assert response.status_code == 200, f"HTTP 状态码错误: {response.status_code}"
        data = response.json()
        assert data.get("errno") != 0, f"预期失败但成功: {data}"

        if expected_errno is not None:
            assert data.get("errno") == expected_errno, \
                f"错误码不匹配: 期望 {expected_errno}, 实际 {data.get('errno')}"

        return data

    @staticmethod
    def has_list(response: requests.Response, min_count: int = 0):
        """断言响应包含列表数据"""
        data = ResponseAssert.success(response)
        assert "list" in data, "响应缺少 list 字段"
        assert len(data["list"]) >= min_count, \
            f"列表长度不足: 期望 >= {min_count}, 实际 {len(data['list'])}"
        return data["list"]

    @staticmethod
    def has_pagination(response: requests.Response):
        """断言响应包含分页数据"""
        data = ResponseAssert.success(response)
        assert "list" in data, "响应缺少 list 字段"
        assert "total" in data, "响应缺少 total 字段"
        assert "pages" in data, "响应缺少 pages 字段"
        return data


@pytest.fixture
def assert_resp():
    """响应断言 fixture"""
    return ResponseAssert()
