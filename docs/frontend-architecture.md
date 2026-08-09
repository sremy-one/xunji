# 前端架构约定

## 目录职责

```text
src/
├─ api/          # 后端业务接口定义，不处理页面状态
├─ config/       # 运行环境、品牌常量、路由分级等静态配置
├─ request/      # uni.request 封装、鉴权请求与统一错误
├─ router/       # uni-app 跳转拦截、首次登录和直接启动守卫
├─ services/     # 登录会话、云同步、本地仓储和存储适配器
├─ stores/       # Pinia 界面与跨页面状态
├─ styles/       # 全局样式；设计令牌仍由 uni.scss 注入
├─ components/   # 可复用业务组件
├─ pages/        # 主包页面，只保留一级页面、登录和轻量引导
└─ packages/     # 动作库、计划编排和训练流程分包
```

依赖只允许从上层业务流向下层基础能力：页面调用 store/service，service 调用 api，api 调用 request。`request` 不依赖页面或 store，避免循环依赖。

## 路由权限

- 一级公开页：今日、训练、记录、我的。
- 登录页：始终公开。
- 受保护页：首次引导及所有 `packages/**` 页面。
- 首次进入且没有登录会话时展示一次登录页；用户取消后回到一级页。
- 一级页触发分包页面时，由 `router/index.ts` 拦截并携带原目标进入登录页。
- 分享或二维码直接打开受保护页面时，由 App 启动/显示守卫转到登录页；成功后恢复原路径与查询参数。
- 训练计划按钮在写入活动会话前额外检查登录，避免游客取消登录后遗留半成品会话。

## 登录与数据

`wx.login` 的临时 code 只发送到后端 `/auth/wechat`。后端用 OpenID 查找账号，不存在则创建，随后返回本项目 JWT、刷新令牌和脱敏账号信息。前端不保存 OpenID、AppSecret 或 `session_key`。

账号登录与云端备份相互独立：登录只负责访问受保护页面；训练数据默认本地保存，用户仍需在“我的”页主动开启云端备份。

## 构建质量

- `mp-weixin.lazyCodeLoading` 固定为 `requiredComponents`。
- 主包上限按 1.5 MB 预警，单个图片或音频按 200 KB 预警。
- 仅供分包使用的工具必须放在对应 `packages/**` 内，禁止从分包导入主包公共 JS 后形成“主包未使用文件”。
- `npm.cmd run build:mp-weixin` 会移除框架注入的未声明 DCloud 阴影图片预加载。
- `npm.cmd run check:packages` 用于检查主包、分包和总包体积。
