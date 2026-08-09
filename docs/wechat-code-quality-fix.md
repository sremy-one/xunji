# 微信代码质量整改记录

整改日期：2026-08-08

| 检查项 | 整改前 | 整改后 |
| --- | ---: | ---: |
| 主包大小 | 1.60 MB，未通过 | 1.36 MB，通过（项目预警线 1.50 MB） |
| 总包大小 | 2.68 MB | 2.44 MB |
| 单个图片/音频超过 200 KB | 首页海报 378 KB | 0 个；首页海报约 114 KB |
| 主包未使用 JS | `services/share.js`、`utils/plan-builder.js` | 0 个已知项；代码已迁入对应分包 |
| 组件按需注入 | 未开启 | `lazyCodeLoading: requiredComponents` |

首页海报原始文件已归档至 `design/source-assets`，发布版保留 1152×768、JPEG 质量 78 的视觉无损式压缩结果。`scripts/optimize-jpeg-assets.ps1` 可以重复生成发布资源。

`scripts/check-packages.mjs` 现在会同时校验：

- 主包不超过 1.5 MB；
- 每个分包不超过 2 MB，总包不超过 20 MB；
- 图片和音频单文件不超过 200 KB；
- `requiredComponents` 已启用；
- 已知的分包专用 JS 不得重新出现在主包。

重新在微信开发者工具上传前，应执行：

```powershell
npm.cmd run type-check
npm.cmd test
npm.cmd run build:mp-weixin
npm.cmd run check:packages
```

导入目录为 `dist/build/mp-weixin`，不要导入 `src` 或整个 `lianji` 目录。
