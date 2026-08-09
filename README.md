# 由迹而寻

面向健身新手的本地优先 uni-app 小程序，使用 Vue 3、TypeScript、Composition API 与 Pinia。产品围绕“制定计划 → 动作训练 → 自动打卡 → 查看记录 → 分享成果”形成闭环，同时输出 H5 和微信小程序构建产物。

## 已实现

- 今日、训练、记录、我的四个主导航与首次引导。
- 首次进入保持游客模式，不调用 `wx.login`、不访问云端数据库。只有用户主动保存个人信息或开启云端备份时，才在隐私确认后获取微信临时凭证并建立隔离的数据空间。
- 前端按 `config → request → api → services/stores → pages` 分层，公共样式集中于 `styles`，具体约束见 `docs/frontend-architecture.md`。
- “即刻开始”进入银铃训练意向页，支持背、肩、腿、胸、核心、手臂多选，并根据选择数量切换关心提示和表情。
- 自定义组合按热身、大肌群、辅助和核心收尾自动排序，动作数随选择范围增长并限制在 4–8 个。
- 训练完成页随机展示 8 张银铃纪念海报；同一训练记录保持稳定，并在保存成果海报时复用当前画面。
- 完成页缺少会话数据时显示银铃兜底状态，提供重新挑选训练和返回今日入口，不再出现纯空白页面。
- 3 套可解释的 6 动作入门计划、28 个原创银铃动作、部位/器械筛选和动作详情。
- 训练计时、组数/次数/重量记录、暂停、休息、跳过、同类替换、退出恢复与完成结算。
- 同日幂等打卡、连续天数、训练量统计、历史回显、微信原生分享与 H5 海报替代。
- `youjierxun.v1.*` 版本化本地存储，并自动迁移前两版品牌命名空间的数据；仓储/服务边界可替换为 uniCloud/CDN 实现。
- 主包与四个分包、H5 宽屏居中适配、微信胶囊安全区、Phosphor 本地图标、数据/包体/交互/视觉 QA。

## 开发与构建

Windows 下使用 `npm.cmd`：

```powershell
npm.cmd install
npm.cmd run dev:h5
npm.cmd run dev:mp-weixin
npm.cmd run type-check
npm.cmd test
npm.cmd run build:h5
npm.cmd run build:mp-weixin
npm.cmd run check:packages
```

微信开发者工具导入目录：

```text
dist/build/mp-weixin
```

固定视觉验收页：

```text
http://localhost:5173/#/pages/today/index?preview=1
```

## 数据生成

`src/data/exercises.generated.json` 保存 28 个核心原创银铃动作。`scripts/prepare-exercises.mjs` 只接受 `yl-` 前缀、原创作者与自有版权字段，
不会把外部参考数据或媒体复制到发布包。

```powershell
npm.cmd run prepare:data
npm.cmd run validate:data
```

核心批次为 28 个动作：徒手 14 个、哑铃 8 个、弹力带 6 个；肩部与手臂模块现已支持徒手训练。
每个动作包含银铃原创循环 GIF、缩略图、原创中文步骤和“锻炼××肌”文字说明；训练画面采用高马尾、编发、丸子头或盘发等固定运动发型，不使用披发。
三套默认计划均提供 6 个动作；部位多选计划会按热身、所选部位和核心收尾动态编排。

## 质量记录

- 小程序头像母版：[design/logo/youjierxun-app-avatar.png](design/logo/youjierxun-app-avatar.png)
- 微信上传版头像：[design/logo/youjierxun-app-avatar-512.png](design/logo/youjierxun-app-avatar-512.png)
- LOGO 规范：[design/logo/logo-spec.md](design/logo/logo-spec.md)
- 银铃主题横幅：[design/poster/youjierxun-yinling-banner.png](design/poster/youjierxun-yinling-banner.png)
- 横幅规范：[design/poster/youjierxun-banner-spec.md](design/poster/youjierxun-banner-spec.md)
- 横幅规范：[design/poster/yinling-banner-spec.md](design/poster/yinling-banner-spec.md)
- 视觉基准：[design/reference-home-option-3.png](design/reference-home-option-3.png)
- 首页实现截图：[design/implementation-home.jpg](design/implementation-home.jpg)
- 头像实现截图：[design/implementation-profile-avatar.jpg](design/implementation-profile-avatar.jpg)
- 海报首页对照：[design/poster-home-comparison.png](design/poster-home-comparison.png)
- 首页安全区修复对照：[design/home-safe-area-comparison.png](design/home-safe-area-comparison.png)
- 训练意向页三状态对照：[design/selection-state-comparison.png](design/selection-state-comparison.png)
- 银铃意向页视觉规范与生成提示：[design/selection/selection-spec.md](design/selection/selection-spec.md)
- 银铃完成海报八图总览：[design/celebration/yinling-finish-eight-posters.jpg](design/celebration/yinling-finish-eight-posters.jpg)
- 完成页改版前后对照：[design/celebration/complete-before-after-comparison.png](design/celebration/complete-before-after-comparison.png)
- 无会话兜底页：[design/celebration/implementation-complete-fallback.png](design/celebration/implementation-complete-fallback.png)
- 完成海报规范与生成提示：[design/celebration/celebration-poster-spec.md](design/celebration/celebration-poster-spec.md)
- QA 结论：[design-qa.md](design-qa.md)

## 数据与媒体许可

发布包中的银铃动作动画、缩略图和中文动作说明均为“由迹而寻”原创核心素材，
版权标记为 `© 由迹而寻 · 银铃原创动作`。外部健身数据集只允许在本地参考区
用于核对通用动作名称、器械分类和起止姿势，其图片与 GIF 不得进入 `src`、
`dist`、服务器资源目录或发布安装包。完整边界见 [NOTICE.md](NOTICE.md)。
