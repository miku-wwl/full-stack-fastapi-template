# ForeXchange项目10天开发工期计划
基于FastAPI后端架构与全量设计文档，制定以下**前后端同步开发、每日独立可验证**的10天工期计划，严格对齐前端10个Phase并补充对应后端开发任务：

## 工期总览
| 工期 | 日期 | 核心模块 | 前后端同步重点 |
|------|------|----------|----------------|
| Day1 | 后天 | 环境搭建+路由骨架 | 后端基础框架+前端路由体系 |
| Day2 | 大后天 | 认证系统 | JWT令牌流转+角色字段集成 |
| Day3 | 第3天 | 布局导航+汇率基础 | 侧边栏角色菜单+汇率模拟器 |
| Day4 | 第4天 | 仪表盘首页 | 统计数据聚合接口+卡片组件 |
| Day5 | 第5天 | 实时汇率行情 | 5秒轮询接口+汇率卡片 |
| Day6 | 第6天 | 汇率走势图 | 历史数据接口+ApexCharts集成 |
| Day7 | 第7天 | 汇款表单 | 汇率锁定+交易创建+队列集成 |
| Day8 | 第8天 | 交易历史 | 分页查询接口+详情弹窗 |
| Day9 | 第9天 | 合规审计 | 规则引擎+审核操作接口 |
| Day10 | 第10天 | 打磨上线 | 全链路联调+错误处理优化 |

## 每日详细工期安排

### Day1：环境搭建+路由骨架+后端基础
**核心目标**：前后端开发环境就绪，所有页面路由可访问，数据库连接正常
- **前端任务**：
  1. 初始化React+TypeScript+TanStack Router项目
  2. 创建所有8个页面路由文件（含受保护布局`_layout.tsx`）
  3. 配置路由守卫，未登录自动重定向到登录页
  4. 运行`npm run generate-client`生成初始API SDK
- **后端任务**：
  1. 搭建FastAPI基础项目结构（`main.py`、`models.py`、`crud.py`）
  2. 配置PostgreSQL连接与SQLModel ORM
  3. 完成`user`表迁移（新增`role`字段，默认`customer`）
  4. 实现健康检查接口`GET /api/v1/utils/health-check`
  5. 配置OpenAPI文档，确保`http://localhost:8000/docs`可访问
- **关键验证**：
  - 所有6个受保护路由未登录时重定向到`/login`
  - 后端健康检查返回`{"message": "Hello World"}`
  - API客户端生成成功，包含基础服务类
- **验收标准**：前后端服务可同时启动，浏览器访问无白屏，Console无报错

### Day2：认证流程（登录/注册/JWT）
**核心目标**：完整的OAuth2密码流认证，角色信息正确传递
- **前端任务**：
  1. 改造登录/注册页使用Dashboard统一认证布局
  2. 实现`useAuth` Hook，封装登录、注册、登出逻辑
  3. 配置JWT令牌自动注入请求头
  4. 实现令牌存储与刷新逻辑（localStorage）
- **后端任务**：
  1. 完善认证接口：`POST /api/v1/login/access-token`（返回`role`）
  2. 实现用户注册接口：`POST /api/v1/users/register`（支持`role`参数）
  3. 实现获取当前用户接口：`GET /api/v1/users/me`（返回完整用户信息）
  4. 配置JWT签名密钥与过期时间
- **关键验证**：
  - 注册新用户成功，数据库中`role`字段为`customer`
  - 登录后令牌存储到localStorage，刷新页面不丢失登录态
  - 登出后令牌清除，自动跳转到登录页
- **验收标准**：`GET /users/me`返回正确的`role`字段，无401未处理错误

### Day3：布局导航+角色菜单+汇率基础
**核心目标**：Dashboard侧边栏导航完成，角色差异化显示，汇率数据生成正常
- **前端任务**：
  1. 实现AppSidebar侧边栏，配置ForeXchange专属菜单项
  2. 增加角色判断逻辑，Auditor角色显示"Compliance Audit"菜单
  3. 修改AppHeader，显示用户角色徽章
  4. 为所有页面设置正确的`<title>`标签
- **后端任务**：
  1. 创建`currency_pair`和`rate_snapshot`表并完成迁移
  2. 实现`ForexSimulator`汇率模拟器类
  3. 编写种子数据脚本`seed_forex.py`，初始化12个主流货币对
  4. 配置后台任务定时生成汇率快照（每5秒一次）
- **关键验证**：
  - Customer角色登录看不到合规审计菜单
  - Auditor角色登录可看到全部6个菜单
  - 运行种子脚本后，数据库中存在12条货币对记录
- **验收标准**：所有菜单项点击正确跳转，页面标题随路由更新

### Day4：仪表盘首页+后端仪表盘接口
**核心目标**：首页展示4个核心统计卡片与最近交易列表
- **前端任务**：
  1. 创建`StatCard`通用统计卡片组件
  2. 创建`RecentTransactions`最近交易列表组件
  3. 重写仪表盘首页，集成两个组件
  4. 配置React Query缓存策略（10秒过期）
- **后端任务**：
  1. 实现`GET /api/v1/dashboard/summary`聚合接口
  2. 返回活跃汇率对数量、今日交易笔数、总汇款金额、合规警报数
  3. 实现`GET /api/v1/transactions?limit=10`接口，返回最近10笔交易
- **关键验证**：
  - 统计卡片数据与后端接口返回完全一致
  - 加载时显示Skeleton占位动画
  - 接口报错时显示友好错误提示而非白屏
- **验收标准**：Auditor角色看到的合规警报数红色高亮显示

### Day5：实时汇率行情+后端汇率接口
**核心目标**：实时汇率页面每5秒自动刷新，显示所有活跃货币对行情
- **前端任务**：
  1. 创建`RateCard`单个汇率卡片组件
  2. 创建`useForexRates`自定义Hook，封装5秒轮询逻辑
  3. 重写实时汇率页面，展示所有货币对卡片
  4. 实现涨跌幅颜色区分（涨绿跌红）
- **后端任务**：
  1. 实现`GET /api/v1/rates/live`接口，返回所有活跃货币对实时汇率
  2. 实现`GET /api/v1/rates/live/{pair}`接口，返回指定货币对汇率
  3. 接口返回`bid`、`ask`、`mid`、`change_pct`、`timestamp`字段
- **关键验证**：
  - 页面加载后每5秒自动刷新汇率数据
  - 切换到其他页面再切回，立即拉取最新数据
  - 后端模拟器停止后，显示最后已知数据+更新失败标签
- **验收标准**：至少显示12个活跃货币对，数字变化可见

### Day6：汇率走势图+后端历史汇率接口
**核心目标**：集成ApexCharts实现24小时汇率走势图
- **前端任务**：
  1. 创建`RateChart`折线图组件与`MiniChart`迷你图组件
  2. 在仪表盘首页嵌入默认货币对（USD/EUR）走势图
  3. 在实时汇率页面增加货币对切换与时间范围选择
  4. 适配暗色模式下的图表颜色
- **后端任务**：
  1. 实现`GET /api/v1/rates/history/{pair}`接口
  2. 支持`interval`（1m/5m/1h）和`range`（1h/6h/24h/7d）参数
  3. 返回时间序列数据，包含`timestamp`、`bid`、`ask`、`mid`
- **关键验证**：
  - 图表正常渲染，无空白区域
  - 切换货币对和时间范围时，图表数据立即更新
  - 鼠标悬停显示Tooltip，包含具体时间和汇率
- **验收标准**：无数据时显示"Waiting for market data..."空状态

### Day7：汇款表单+后端汇款接口
**核心目标**：完整的跨境汇款表单，支持汇率锁定与交易提交
- **前端任务**：
  1. 创建`CurrencySelector`货币对选择器组件
  2. 创建`RemittanceForm`汇款表单组件（react-hook-form+zod）
  3. 实现汇率锁定30秒倒计时功能
  4. 实时计算手续费与预估到账金额
  5. 增加IBAN格式校验
- **后端任务**：
  1. 实现`POST /api/v1/rates/lock`接口，返回锁定ID与有效期
  2. 实现`POST /api/v1/transactions`接口，创建交易记录
  3. 集成Azure Queue Storage，将交易ID推入队列异步处理
  4. 实现IBAN格式校验逻辑
- **关键验证**：
  - 锁定汇率后，30秒内提交有效，过期后按钮变灰
  - 输入错误IBAN格式时显示红色提示
  - 提交成功后返回`transaction_id`与状态"pending"
- **验收标准**：所有表单字段必填校验生效，提交中显示Loading状态

### Day8：交易历史+后端交易接口
**核心目标**：交易历史页面支持分页、筛选与详情查看
- **前端任务**：
  1. 创建`StatusBadge`交易状态标签组件（5种状态）
  2. 创建`TransactionTable`交易表格组件
  3. 创建`TransactionDetail`交易详情弹窗组件
  4. 实现分页加载与状态筛选功能
- **后端任务**：
  1. 完善`GET /api/v1/transactions`接口，支持`skip`、`limit`、`status`参数
  2. 实现`GET /api/v1/transactions/{id}`接口，返回单笔交易详情
  3. 实现Azure Queue消费者`process_remittance`函数
  4. 交易状态自动更新（pending→processing→completed/flagged）
- **关键验证**：
  - 交易列表按创建时间倒序排列
  - 点击表格行弹出详情弹窗，IBAN中间部分脱敏显示
  - 选择"Flagged"状态筛选，只显示被标记的交易
- **验收标准**：空列表显示友好空状态，加载更多功能正常

### Day9：合规审计+后端合规接口
**核心目标**：合规审计页面仅Auditor可访问，支持交易审核操作
- **前端任务**：
  1. 为合规页面增加路由守卫，非Auditor自动重定向
  2. 创建`ComplianceStats`合规统计卡片组件
  3. 创建`FlaggedTable`被标记交易表格组件
  4. 创建`ComplianceDetail`合规详情面板与审核操作按钮
- **后端任务**：
  1. 实现`GET /api/v1/compliance/overview`统计接口
  2. 实现`GET /api/v1/compliance/flagged`接口，返回所有被标记交易
  3. 实现`GET /api/v1/compliance/{tx_id}`接口，返回合规详情
  4. 实现`POST /api/v1/compliance/review/{tx_id}`审核接口
  5. 完成`run_compliance_rules`合规规则引擎（4条基础规则）
- **关键验证**：
  - Customer角色直接访问`/compliance`自动重定向到首页
  - 被标记交易按风险评分降序排列
  - 点击"Approve"或"Reject"后，交易状态立即更新
- **验收标准**：Reject操作必须填写原因，审核前有二次确认弹窗

### Day10：打磨上线+全链路联调
**核心目标**：全面优化用户体验，完成全链路功能测试
- **前端任务**：
  1. 完善所有组件的Loading、Empty、Error三态处理
  2. 实现令牌过期自动重定向与提示
  3. 优化网络错误与5xx服务器错误处理
  4. 定制404页面与全局错误边界
  5. 适配移动端375px宽度布局
- **后端任务**：
  1. 完善所有接口的错误处理与异常捕获
  2. 优化接口响应时间，确保首屏加载<3秒
  3. 完成Azure Queue消费者的重试机制
  4. 配置CORS与安全头
- **全链路验证**：
  1. 注册→登录→查看仪表盘→发起汇款→查看交易历史
  2. Auditor登录→查看合规警报→审核交易→验证状态更新
  3. 模拟网络断开、令牌过期、接口报错等边界情况
- **验收标准**：
  - 浏览器Console无Error级日志
  - Network标签无未处理的401/403/500错误
  - 所有表单校验生效，错误提示清晰
  - 暗色/亮色模式切换无样式异常

## 前后端接口对齐时间表
| 工期 | 前端依赖接口 | 后端完成时间 |
|------|--------------|--------------|
| Day1 | `/utils/health-check` | Day1上午 |
| Day2 | `/login/access-token`、`/users/register`、`/users/me` | Day1下午 |
| Day4 | `/dashboard/summary`、`/transactions?limit=10` | Day3下午 |
| Day5 | `/rates/live`、`/rates/live/{pair}` | Day4下午 |
| Day6 | `/rates/history/{pair}` | Day5下午 |
| Day7 | `/rates/lock`、`/transactions` | Day6下午 |
| Day8 | `/transactions?skip=&limit=&status=`、`/transactions/{id}` | Day7下午 |
| Day9 | `/compliance/*`系列接口 | Day8下午 |

## 注意事项
1. 每日下班前进行15分钟前后端接口联调，确保当天任务闭环
2. 所有代码提交前运行单元测试与类型检查
3. 提前准备好Azure资源（Container Apps、PostgreSQL、Queue Storage），Day8开始部署测试环境
4. Day10下午进行完整的用户验收测试，修复所有发现的bug
