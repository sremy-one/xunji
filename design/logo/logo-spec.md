# 「由迹而寻」小程序头像规范

## 核心概念

- 角色：参考银铃的银白长发、紫眸、白绿运动装和花形发饰，重新绘制原创训练伙伴头像。
- 动作：微笑并轻握拳，表达“现在就开始”的温和行动力。
- 轨迹：雾蓝紫路径环绕角色，在末端形成四叶标记，呼应“由迹而寻”。
- 定位：适用于微信小程序头像、分享卡片角标和应用内个人头像。

## 颜色

- 暖米白 `#F7F3EA`
- 深墨蓝 `#102B4C`
- 雾蓝紫 `#758DDD`
- 鼠尾草绿 `#91A080`
- 番茄红 `#DF4F3F`

## 使用规则

- 微信后台上传优先使用 512×512 PNG。
- 应用内使用 256×256 JPEG，减少主包体积。
- 保留至少 10% 安全边距，不叠加文字或额外徽章。
- 最小建议展示尺寸为 48px。

## 文件

- 设计母版：`design/logo/youjierxun-app-avatar.png`
- 微信上传版：`design/logo/youjierxun-app-avatar-512.png`
- 应用资源：`src/static/brand/youjierxun-app-avatar.jpg`

## 最终 ImageGen 提示词

> Create an original 1:1 anime/chibi mascot avatar for the beginner fitness mini program “由迹而寻”. Use the supplied silver-haired desk-pet spritesheet only as character-style reference: silver-white long hair with a side flower bun, violet eyes, white-and-sage sporty outfit and soft purple accessories. Draw a new centered head-and-shoulders portrait with a friendly smile and one small raised fist. Integrate a simple mist-periwinkle path ribbon curving behind the portrait and ending in a tiny four-petal sage mark, expressing “trace” and “search”. Use a warm rice-cream rounded-square icon field, deep ink navy outlines, crisp vector-like cel shading, strong silhouette and generous 10% safe margin. No text, watermark, mockup, 3D, photorealism, gradients, busy scenery or extra characters.
