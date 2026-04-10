# remote-terminal-service

**Superpowers skill** – 通过 WebSocket 将本机的 PowerShell / Bash 终端实时暴露给 Android 客户端。

## 目标
- 在本机（Windows / macOS）以 **Docker**（首选）或 **Node.js 直接运行** 的方式启动一个守护服务。
- 客户端通过 TLS+JWT 认证的 WebSocket 与服务通信。
- 支持：
  - 列出当前已创建的终端会话（`list`）
  - 创建新会话（`spawn`）
  - 切换到指定会话（`switch`）
  - 实时双向输送字符（`input` / `output`）
  - 会话保持：断连后重新连接仍能继续操作。
- 终端在本机锁屏、用户注销后仍保持运行（服务以系统服务/容器方式启动）。

## 运行模式
| 模式 | 说明 |
|------|------|
| **docker** | 推荐。`docker run -d -p 5273:5273 --restart=always -v $HOME/.openclaw/remote-term:/data remote-terminal-service` |
| **node** | 备选。`npm install && node src/wsServer.js` |

## 主要文件结构
```
remote-terminal-service/
├─ SKILL.md                # 本文件（已阅）
├─ service/
│   ├─ Dockerfile          # Docker 镜像构建
│   ├─ entrypoint.sh       # 容器入口脚本
│   └─ src/
│       ├─ ptyManager.js   # 创建/管理 PTY 会话
│       ├─ wsServer.js     # WebSocket 协议实现
│       └─ auth.js         # JWT/TLS   
├─ mobile/app/             # 最小 Flutter 客户端（示例）
│   ├─ pubspec.yaml
│   └─ lib/main.dart
├─ tests/
│   └─ integration_test.dart   # 简单的端到端测试示例
└─ docs/deployment.md      # 部署、TLS、NSSM/launchd 指南
```

## 使用说明（Docker）
1. **构建镜像**
   ```bash
   cd ~/.openclaw/workspace/skills/remote-terminal-service/service
   docker build -t remote-terminal-service .
   ```
2. **第一次运行会生成 JWT**（在容器日志里可以看到 `TOKEN=` 行），复制保存。
3. **启动容器**
   ```bash
   docker run -d \
       -p 5273:5273 \
       -v $HOME/.openclaw/remote-term:/data \
       --restart=always \
       remote-terminal-service
   ```
4. **手机端**：打开 Android 客户端，填写本机局域网 IP 与端口 `5273`，粘贴之前保存的 JWT，即可看到终端列表。

## 使用说明（Node 直接运行）
```bash
cd ~/.openclaw/workspace/skills/remote-terminal-service/service
npm install   # 安装依赖
node src/wsServer.js   # 默认监听 5273（可通过 PORT 环境变量修改）
```
首次启动会在 `./data/token.txt` 生成 token。

## 开发指引
- **添加新功能**：在 `src/` 里编写模块，`wsServer.js` 中通过 `msg.type` 分发。
- **单元测试**：`tests/integration_test.dart`（Flutter）或 `npm test`（Node）可直接运行。
- **安全**：默认使用自签名证书（`/data/cert.pem`、`/data/key.pem`），生产环境请换成可信 CA。
```

---

**声明**：本 skill 仅用于内部技术验证，务必在可信网络中使用，避免未经授权的远程访问。
