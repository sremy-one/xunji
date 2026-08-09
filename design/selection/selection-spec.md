# 「由迹而寻」训练意向页视觉规范

## 设计目标

- 把“即刻开始”与训练播放器之间补成一个有情绪反馈的选择步骤。
- 银铃位于画面正中偏上的木窗内，双手举起空白告示牌；界面文案由前端覆盖，保证文字清晰且可动态变化。
- 角色、窗户和告示牌只承担情绪与引导，不挤占下方六个训练部位的选择空间。

## ImageGen 资产

生成方式：OpenAI 内置 ImageGen，参考银铃桌宠精灵图和当前小程序头像。

### calm

> Stylized concept art, 3:2 mobile app hero illustration. Preserve the identity cues of the supplied Yinling reference: cute young anime fitness guide, long silver-white hair, violet eyes, white flower hair ornament with lavender ribbons, white and pale sage green sporty outfit. She appears centered in an open warm wooden window, upper body visible, holding a large blank cream announcement board with both hands. Gentle encouraging smile. Warm ivory background, mist blue and muted lavender accents, sage green leaves, fine navy linework, soft watercolor and colored-pencil texture, cozy daylight, generous clean board area for UI text. Match the established “由迹而寻” fitness mini-program visual system. No letters, no words, no logos, no watermark, no extra fingers, no duplicated character. Landscape 3:2 composition.

### worried

> Identity-preserving edit of the calm reference. Change only Yinling’s facial expression to gently worried and caring: slightly raised inner brows, small concerned mouth, one subtle sweat drop. Keep the exact character, pose, hands, blank sign, wooden window, palette, lighting and 3:2 composition unchanged. No text.

### surprised

> Identity-preserving edit of the calm reference. Change only Yinling’s facial expression to surprised but friendly: widened violet eyes and a small open mouth. Keep the exact character, pose, hands, blank sign, wooden window, palette, lighting and 3:2 composition unchanged. No text.

## 运行时反馈

| 选择数 | 表情 | 告示牌反馈 |
|---|---|---|
| 0 | calm | 可以多选，先从一两个部位开始吧 |
| 1 | calm | 专注一点，今天会练得很扎实 |
| 2 | calm | 这个组合不错，准备出发吧 |
| 3 | calm | 刚刚好，我来帮你安排顺序 |
| 4 | worried | 挑战难度会不会太大了？！ |
| 5–6 | surprised | 真的要选这么多吗？！ |

## 布局与行为

- 390×844 视口中，角色窗景完整显示在首屏上半部，训练选项保持两列。
- 底部主按钮固定，页面内容预留安全区和按钮占位，不遮挡最后一行选项。
- 选项可多选；选中态使用雾蓝底色与勾选图标，提醒卡使用番茄红强调。
- 训练顺序固定为：热身 → 腿 → 背 → 胸 → 肩 → 手臂 → 核心收尾。
- 动作数量随选择数增长，最多 8 个；器械优先遵循用户资料，缺少相应器械动作时回退到徒手动作。

