# 由迹而寻 v1.0.0 发布检查

检查日期：2026-08-09

## 自动门禁

- `npm.cmd run type-check`：通过。
- `npm.cmd test`：9 个文件、26 项用例通过。
- `npm.cmd run validate:data`：28 个原创动作及动画媒体通过。
- `npm.cmd run check:release`：敏感发布文案、超长弹窗按钮、无事件按钮、页面注册缺失、业务源码旧系统接口和多余隐私字段均为 0。
- `npm.cmd run build:h5`：通过。
- `npm.cmd run build:mp-weixin`：通过。
- `npm.cmd run check:packages`：主包 1.38 MB，总包 2.47 MB；媒体大于 200 KB 的数量为 0。
- 后端 `npm.cmd test`：12 项通过。
- 生产 `https://api.asyore.cn/fitness-api/health`：服务与 MongoDB 正常。
- 生产冒烟检查：`PRODUCTION_SMOKE_OK`。

## 页面与关键流程

- 今日、训练、记录、我的四个一级页面：通过。
- 账号设置、数据管理、关于与声明、隐私保护指引、训练计划偏好：通过。
- 训练部位选择、动作库、动作详情：通过。
- 徒手与器械训练会话、训练完成页、无会话兜底页：通过。
- 云端备份开启弹窗可重复触发；关闭后状态可重新加载：通过。
- 训练会话直达与本地异常状态具备重建及兜底入口：通过。

截图证据保存在 `design/release-audit/`。

## 微信平台人工确认

- 使用微信开发者工具导入 `dist/build/mp-weixin`，勾选 ES6 转 ES5、增强编译与上传时压缩。
- 使用真实微信环境确认隐私协议弹窗、`wx.login`、`chooseAvatar`、昵称输入、分享与保存相册授权。
- 确认公众平台已配置 `https://api.asyore.cn` 为 request 合法域名；仅在启用远程媒体时再配置 downloadFile 合法域名。
- 核对小程序隐私保护指引、服务类目、主体信息与当前页面文案一致。
- 保存角色形象、动作媒体、名称和宣传素材的创作与授权记录，并完成人工动作安全审核。
