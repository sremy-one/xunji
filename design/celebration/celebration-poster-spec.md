# 「由迹而寻」银铃训练完成海报规范

## 用途与输出

- 用途：替换完成页顶部的圆形勾选标记，并同步用于“保存成果海报”画布。
- 生成方式：OpenAI 内置 ImageGen；`stylized-concept`。
- 身份参考：`design/logo/youjierxun-app-avatar.png`。
- 画风参考：`design/selection/yinling-board-calm.png`。
- 母版：1536×1024 PNG，保存在本目录。
- 运行时版本：960×640、JPEG quality 82，保存在 `src/static/celebration/`。
- 图内禁止文字、Logo、水印和 UI；运行时标题由前端叠加。

## 共用提示

> Use case: stylized-concept. Asset type: 3:2 landscape celebration poster for the “由迹而寻” fitness mini-program completion screen. Input image 1 is Yinling’s identity reference; input image 2 is the exact soft watercolor/colored-pencil art-direction reference. Preserve the same silver-white-haired, violet-eyed anime fitness guide, flower hair ornament, white/sage sportswear, deep navy linework, warm ivory, mist blue/lavender and sage green palette. Polished soft watercolor and colored-pencil anime illustration, centered with rounded-card crop safety. No text, letters, numbers, logos, watermark, UI, border, extra people, duplicated or malformed limbs/fingers.

## 八张海报

| # | 运行时标题 | 情绪与动作 | 发型 | 文件 |
|---|---|---|---|---|
| 01 | 跃起的瞬间 | 户外跑道上开心跃起、挥拳庆祝，轻微流汗 | 高马尾 | `yinling-finish-01-jump.png` |
| 02 | 慢慢舒展 | 窗边坐姿拉伸，闭眼放松，毛巾搭肩 | 松散丸子头 | `yinling-finish-02-stretch.png` |
| 03 | 大口呼吸 | 双手扶膝喘气，劳累又带着笑意 | 双马尾 | `yinling-finish-03-breath.png` |
| 04 | 风里发呆 | 窗台喝水，看着树叶短暂发呆 | 披发 | `yinling-finish-04-daydream.png` |
| 05 | 给今天比个耶 | 毛巾披肩、拿水瓶、比胜利手势 | 双丸子头 | `yinling-finish-05-peace.png` |
| 06 | 最后一组 | 家庭训练角完成最后一次哑铃弯举 | 侧马尾 | `yinling-finish-06-curl.png` |
| 07 | 安心躺一会 | 训练垫上舒展躺下，疲惫但很满足 | 低双丸子头 | `yinling-finish-07-recovery.png` |
| 08 | 记下这一刻 | 窗边记录训练，抬头露出满足的微笑 | 编发马尾 | `yinling-finish-08-journal.png` |

每张均使用共用提示，并补充表格中的场景、表情、动作、发型、构图与道具描述。生成时明确要求动作安全、手指完整、人物保持在 3:2 圆角卡片安全区内。

## 随机规则

- 训练会话 ID 经稳定哈希后对 8 取模。
- 新训练会话会得到近似随机海报。
- 同一完成记录重复进入时保持同一张，避免页面刷新后突然换图。
- 视觉验收可使用 `poster=1` 至 `poster=8` 固定预览，不影响正式流程。

