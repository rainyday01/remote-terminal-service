# Remote Terminal Service

**A Superpowers‑based remote terminal solution** that lets you control Windows/macOS terminals from an Android app.

---

## 📦 Release
- **Version:** `v0.0.1`
- **Tag:** `v0.0.1`
- **GitHub:** https://github.com/rainyday01/remote-terminal-service
- **APK (Android test build):** See the `android-app` release asset attached to tag `v0.0.1`.

---

## 🛠️ Architecture
```
remote-terminal-service/               ← repository root
│
├─ service/                           ← 后端 (Node.js + Docker)
│   ├─ Dockerfile                     # Docker 镜像构建
│   ├─ entrypoint.sh                  # 自动生成证书 & JWT，启动 wsServer
│   ├─ package.json
│   └─ src/                           # 核心实现
│       ├─ ptyManager.js              # PTY 创建/管理
│       ├─ wsServer.js                # WebSocket 协议（list/spawn/switch/input/output）
│       └─ auth.js                    # JWT/TLS 认证
│
├─ mobile/app/                        ← Android 客户端（Flutter）
│   ├─ pubspec.yaml
│   └─ lib/main.dart                 # 完整 UI 实现，已根据您提供的原型图完成
│
├─ README.md                          # 本文件 – 安装、使用、构建说明
└─ SKILL.md                           # Superpowers skill 描述（供内部使用）
```

---

## 🚀 快速开始（Docker 方式，推荐）
1. **构建 Docker 镜像**
   ```bash
   cd remote-terminal-service/service
   docker build -t remote-terminal-service .
   ```
2. **首次运行（会自动生成自签证书 & JWT）**
   ```bash
   docker run -d \
     -p 5273:5273 \
     -v $HOME/.openclaw/remote-term:/data \
     --restart=always \
     remote-terminal-service
   ```
   - 容器日志会输出 `TOKEN=xxxxx...`，复制完整的 JWT（包括 `Bearer` 前缀的 token）备用。
   - 生成的证书保存在 `/data/cert.pem`、`/data/key.pem`，如果需要使用受信任 CA，请自行替换。
3. **在 Android 客户端添加远程主机**
   - 打开 App → **Connection** 页面 → 填写 **IP**（局域网或外网 IP）与 **Token**（上一步复制的 JWT），点击 **保存并连接**。
   - 连接成功后，切回 **Session** 页面即可看到已创建的终端列表，点击任意会话即可实时交互。

---

## 🖥️ 直接运行（Node.js 方式，作为备选）
> 适用于不想使用 Docker 的机器（例如已有 Node 环境的开发机）。

```bash
# 进入服务目录
cd remote-terminal-service/service

# 安装依赖（仅一次）
npm ci

# 生成自签证书（如果还没有）
mkdir -p data && openssl req -newkey rsa:2048 -nodes -keyout data/key.pem \
    -x509 -days 365 -out data/cert.pem -subj "/CN=remote-terminal"

# 生成 JWT（一次性）
node -e "
  const jwt=require('jsonwebtoken');
  const secret=require('crypto').randomBytes(32).toString('hex');
  const token=jwt.sign({role:'client'},secret,{expiresIn:'30d'});
  console.log('TOKEN='+token); 
  const fs=require('fs');
  fs.writeFileSync('data/token.txt', token+'\n'+secret);
"

# 启动服务（默认 5273 端口）
node src/wsServer.js --cert data/cert.pem --key data/key.pem --tokenFile data/token.txt
```
- 同样在 **Connection** 页面填入 `IP` 与 **Token** 即可使用。

---

## 📱 Android 客户端（Flutter）
### 1. 编译测试版 APK
```bash
cd remote-terminal-service/mobile/app
flutter pub get
flutter build apk --release   # 产物在 build/app/outputs/flutter-apk/app-release.apk
```
将生成的 `app-release.apk` 上传到 GitHub Release（本仓库的 `v0.0.1` tag）供测试使用。

### 2. 主要功能概览
- **右上角**：刷新会话、深/浅主题切换、分屏显示（单屏/上下 2 屏/上下 3 屏循环）。
- **左上角**：下拉切换已保存的远程主机（IP + JWT）。
- **底部 Tab**：`Session / Connection / Setting`（按您提供的原型图实现）。
- **右下角**：新建终端（`+` 按钮）。
- **Session 页面**：支持 1/2/3 屏分布显示，实时输出、等宽字体、快捷键按钮（Ctrl C、Ctrl L、方向键等）。
- **Connection 页面**：IP、Token 配置，已保存主机列表可增删。
- **Setting 页面**：暗主题开关、关于信息、帮助链接。

---

## 📖 Usage Flow
1. **部署后端**（Docker 推荐）。
2. **打开 Android 客户端** → 在 **Connection** 页面添加主机 → 保存并连接。
3. **切换到 Session** → `+` 新建终端或点击已有终端进入交互。
4. **分屏**：点击右上角的分屏图标循环 1‑2‑3 屏显示，以便同时查看多个会话。
5. **断开/重连**：关闭 APP 后，后端仍保持 PTY 进程运行；再次打开并重新连接后可继续操作。

---

## 🛡️ 安全说明
- **TLS**：服务默认使用自签证书，生产环境建议换为可信 CA 证书。
- **JWT**：每次部署会生成一次性 secret，保存在 `data/token.txt`，仅持有 token 的客户端能够连接。
- **防火墙**：建议只在局域网开放 `5273` 端口，或通过 SSH 隧道/Cloudflare Tunnel 等方式进行安全穿透。

---

## 🙋‍♂️ 联系 & 贡献
- **作者**：小v（Elli）
- **Issue / Pull Request**：欢迎提交 Issue 或 PR。
- **License**：MIT – 代码可自由使用、修改和分发。

---

*本 README 由 AI 助手根据需求自动生成，实际部署请根据具体环境进行适当调整。*
