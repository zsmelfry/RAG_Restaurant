# AKS + Helm 部署流程（MVP）

## 1. 前期准备

- 在 **Cloudflare** 购买并托管域名。
- 使用 **cert-manager**（DNS-01 + Cloudflare API）签发 `*.example.com` 证书。
- 为 MongoDB (1GB) 和 Qdrant (1GB) 预留 **Azure Disk PVC**。
- 准备镜像仓库（ACR 或 GHCR/DockerHub）。
- 设置 **CircleCI**，用于构建与部署。

---

## 2. 基础设施层（AKS 集群）

- 创建一个 **3 节点 AKS 集群**（B2s/B2ms）。
- 使用 Helm 安装 **NGINX Ingress Controller**。
- 使用 Helm 安装 **cert-manager**（自动签发 TLS 证书）。
- 使用 Helm 安装 **Prometheus + Grafana** 做监控与告警。

---

## 3. 数据服务层

- 用 Helm 部署 **MongoDB**（1GB PVC）。
- 用 Helm 部署 **Qdrant**（1GB PVC）。
- 数据卷基于 **Azure Disk**，定期快照存储。

---

## 4. 应用服务层

- **backend**：Express + TypeScript，连 MongoDB/Qdrant。
- **frontend**：Vue3 + Vite。
- **indexer**：Python FastAPI，生成向量并写入 Qdrant。
- 每个服务通过独立 Helm Chart 部署（或 monorepo Chart + values.yaml 分环境）。
- Ingress 配置：

  - `api.example.com` → backend
  - `app.example.com` → frontend
  - `indexer` → 内部访问，不暴露外网。

---

## 5. 外部资源

- **图片** 存放在 Cloudflare R2，绑定 `img.example.com`。
- **Cloudflare** 提供 DNS、WAF、CDN，加速 API/前端/图片。
- 日志与错误监控可接入 **Prometheus + Grafana / Sentry**。

---

## 6. CI/CD 流程（CircleCI）

1. 代码提交到 main/dev 分支。
2. Nx build → Docker build（frontend/backend/indexer）。
3. 镜像推送到仓库（GHCR/ACR）。
4. 执行 `helm upgrade --install`，更新 AKS。
5. 健康检查（readinessProbe/livenessProbe），失败则自动回滚。

---

## 7. 运维要点

- **持久化**：MongoDB/Qdrant 必须绑定 PVC，避免数据丢失。
- **弹性伸缩**：HPA 基于 CPU/QPS 自动扩缩容。
- **回滚机制**：Helm 内置版本控制，可 `rollback`。
- **安全性**：

  - Secrets 用 Kubernetes Secret（可选 sealed-secrets）。
  - Ingress 强制 TLS。
  - RBAC 控制后台/前端/运维权限。
