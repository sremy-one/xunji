# 「由迹而寻」云端后端落地方案

## 结论

当前版本不依赖后端也可以完成本地演示与首轮体验测试。用户档案、训练中会话、训练记录和打卡数据均通过 `uni.setStorageSync` 保存在当前设备，动作与计划来自随包发布的本地数据。

一旦需要微信身份、多设备同步、换机恢复、远程更新动作、运营统计或服务端备份，就应接入后端。推荐保留“本地优先”：训练过程先写本地，网络恢复后再同步。这样弱网或断网时不会中断训练。

截至 2026-08-02，Node.js 20 + Express + Mongoose 服务已部署到 `api.asyore.cn`，MongoDB 8 已启用鉴权，PM2、Nginx 和 HTTPS 已通过健康检查。微信登录、JWT、训练同步、打卡、导出和账号删除均已实现；前端保持默认仅本地，只有用户主动同意后才启用云端备份。正式登录尚需管理员把轮换后的微信 AppSecret 直接写入服务器。

## 推荐上线分期

### 阶段 A：本地版上线验证

- 不建立账号系统，不上传训练数据。
- 继续使用现有 `ExerciseRepository`、`PlanRepository`、`WorkoutRepository`、`ProfileRepository` 的本地实现。
- 保留“数据仅保存在当前设备”的界面文案，并明确卸载、清理缓存或换机后可能丢失。
- 动作 GIF 和图片继续随小程序分包发布；当前体量无需提前上 CDN。

### 阶段 B：最小云端版

- 微信静默登录：客户端调用 `uni.login()` 取得临时 code，发送给后端；后端完成微信会话交换，并签发本项目自己的访问令牌。
- 云端同步用户档案、训练会话、组记录和打卡；动作库仍随包发布。
- 增加数据导出、删除账号与删除云端数据入口。
- 将“仅保存在当前设备”改为真实的数据收集与存储说明，并同步更新小程序隐私保护指引。

### 阶段 C：内容运营版

- 动作和计划增加版本接口，通过对象存储/CDN 分发媒体。
- 增加后台内容审核、灰度发布、版本回滚、错误监控和运营指标。
- 分享海报仍由用户主动触发，不上传通讯录，不建设公开动态流。

## 推荐架构

```text
uni-app 小程序
  ├─ 本地仓储（当前可离线运行）
  ├─ 同步队列（待上传操作）
  └─ HTTPS API
        ├─ 微信登录与令牌服务
        ├─ 用户/训练/打卡服务
        ├─ MongoDB 8
        ├─ Redis（可选：限流、短期会话）
        └─ 对象存储/CDN（可选媒体托管）
```

服务端当前采用 Node.js 20 + Express + Mongoose + MongoDB 8，与服务器现有 Java 服务通过独立 `/fitness-api/` 路由隔离。

已部署接口入口：

- `GET https://api.asyore.cn/fitness-api/health/live`
- `GET https://api.asyore.cn/fitness-api/health`
- `GET https://api.asyore.cn/fitness-api/v1`
- `POST https://api.asyore.cn/fitness-api/v1/auth/wechat`
- `POST https://api.asyore.cn/fitness-api/v1/auth/refresh`
- `GET|PUT https://api.asyore.cn/fitness-api/v1/profile`
- `POST|GET https://api.asyore.cn/fitness-api/v1/sync/push|pull`
- `GET|DELETE https://api.asyore.cn/fitness-api/v1/account/export|account`

## 最小数据表

| 表 | 关键字段 | 约束/用途 |
| --- | --- | --- |
| `users` | `id`, `openid`, `unionid`, `status`, `created_at` | `openid` 唯一；不保存微信 `session_key` 明文日志 |
| `user_profiles` | `user_id`, `goal`, `equipment`, `duration_minutes`, `days_per_week`, `version`, `updated_at` | 每个用户一条档案 |
| `workout_sessions` | `id`, `client_id`, `user_id`, `plan_id`, `plan_title`, `started_at`, `completed_at`, `duration_seconds`, `status`, `updated_at` | `client_id + user_id` 唯一，用于离线幂等同步 |
| `workout_sessions.records` | `exercise_id`, `set_number`, `reps`, `seconds`, `weight_kg`, `completed`, `skipped` | 首版作为训练会话内嵌文档，单次会话整体幂等写入 |
| `checkins` | `user_id`, `date`, `timezone`, `session_count`, `updated_at` | `user_id + date` 唯一，保证同日只增加一次连续天数 |
| `refreshtokens` | `user_id`, `token_hash`, `expires_at`, `revoked_at` | 只保存 SHA-256 哈希；TTL 索引自动清理过期令牌 |

动作目录和计划模板首期不必入库；等需要远程更新时再增加 `exercise_catalog_versions`、`exercises`、`plan_templates`。

## 最小接口

```text
POST /v1/auth/wechat                 微信 code 换项目令牌
GET  /v1/profile                     获取用户档案
PUT  /v1/profile                     更新用户档案
POST /v1/sync/push                   幂等上传本地变更
GET  /v1/sync/pull?cursor=...        增量拉取云端变更
GET  /v1/workout-sessions            分页获取训练历史
GET  /v1/records/summary             获取打卡和训练统计
POST /v1/account/export              申请数据导出
DELETE /v1/account                   删除账号及云端数据
GET  /v1/catalog/version             检查动作目录版本
```

训练同步以 `user_id + client_id` 唯一索引保证重试幂等。完成的训练会话视为不可变记录；打卡由服务端根据 Asia/Shanghai 的自然日从已完成会话派生，客户端不直接提交连续天数。

## 前端改造点

1. 新增 `ApiClient` 和 `AuthService`，统一处理基础地址、令牌、超时和错误码。
2. 为 `WorkoutRepository`、`ProfileRepository` 增加云端实现，页面和 Pinia 不直接调用网络接口。
3. 本地写入成功后追加同步队列；启动、回到前台和网络恢复时触发同步。
4. 失败采用指数退避；身份失效时只刷新令牌，不清除本地训练数据。
5. 使用 UUID 作为客户端记录 ID；服务器按幂等键去重。
6. 动作媒体远程化后使用“版本号 + 文件哈希”，下载失败则回退到随包占位资源。

## 服务器部署清单

- 已备案并可配置到小程序后台的 API 域名，例如 `api.example.com`；生产环境启用有效 HTTPS 证书。
- Nginx/Caddy 反向代理到后端进程；数据库不直接暴露公网。
- `AppSecret`、数据库密码和令牌签名密钥只放服务器环境变量或密钥管理服务，不进入前端代码、Git 或聊天记录。
- 数据库每日备份，定期做恢复演练；配置访问日志、错误监控、磁盘和证书到期告警。
- 接口进行参数校验、鉴权、限流和日志脱敏；生产库使用最小权限账号。
- 微信小程序后台配置 request 合法域名。uni-app 官方说明小程序网络 API 使用前必须配置域名白名单：[uni.request 文档](https://uniapp.dcloud.net.cn/api/request/request)。
- 微信登录客户端入口使用 `uni.login()`：[uni.login 文档](https://uniapp.dcloud.net.cn/api/plugins/login.html)。微信密钥交换必须在服务端完成。

## 隐私与版权上线门槛

- 训练目标、训练历史以及可能反映健康状况的数据应按最小必要原则处理，明确目的、保存期限和删除方式。正式接云前应根据[《中华人民共和国个人信息保护法》](https://www.npc.gov.cn/npc/c2/c30834/202108/t20210820_313088.html)完成隐私文本与产品入口评审。
- 商用发布前应对角色形象、动作媒体、名称和宣传素材完成专业权利审查，并保存可验证的创作与授权记录。

## 开始实施时需要的资料

- 服务器操作系统、CPU/内存和当前已安装的软件。
- 已备案域名及可修改 DNS、HTTPS 证书和小程序合法域名配置的权限。
- 选择的后端技术栈（推荐 NestJS + PostgreSQL；已有 Java 运维体系则选 Spring Boot + MySQL）。
- SSH 主机、端口、用户名和密钥文件路径。密钥文件本身不应粘贴到聊天中。
- 微信小程序 AppID。AppSecret 只在服务器上以环境变量配置，不通过聊天传递。

在这些信息确认前，不应直接把服务器接入当前发布包；先在测试域名和测试数据库完成登录、离线同步、重复提交和数据删除测试，再切换生产环境。
