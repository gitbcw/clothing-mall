from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # 登录
    page.goto('http://localhost:9527')
    page.wait_for_load_state('networkidle')

    # 使用 CSS 选择器定位用户名和密码输入框
    username_input = page.locator('input.el-input__inner[type="text"]').first
    password_input = page.locator('input.el-input__inner[type="password"]').first

    username_input.fill('admin123')
    password_input.fill('admin123')

    page.click('button.el-button--primary')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # 访问订单管理页面
    page.goto('http://localhost:9527/#/mall/order')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    # 截图
    page.screenshot(path='order_page.png', full_page=True)

    # 检查是否有错误提示
    error_count = page.locator('.el-message--error').count()
    if error_count > 0:
        error_text = page.locator('.el-message--error').text_content()
        print(f"Error message: {error_text}")
    else:
        print("No error message visible")

    # 检查表格是否有数据
    table_rows = page.locator('.el-table__body-wrapper tr').count()
    print(f"Table rows: {table_rows}")

    browser.close()
    print("Done")
