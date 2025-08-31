# MVP 架构（基于三仓设计）

## 仓库 A：rag-js（Nx）

- **apps/frontend**：Vue3 + Vite + Pinia，核心页面包含 Login / OnboardingTaste / Recommend / Admin。
- **apps/backend**：Express + TS + MongoDB，负责业务 API、鉴权、画像更新与推荐编排。
- **packages/shared-types**：从 contracts 生成的 DTO / Schema。
- **packages/shared-utils**：日志、配置、错误处理、HTTP 客户端。
- **infra**：Docker Compose 管理 frontend/backend/mongodb。
- **docs**：ADR、接口说明、运行手册。
- **CI/CD**：GitHub Actions，受影响执行。

## 仓库 B：rag-py（Pants）

- **services/vector**

  - FastAPI（仅内部服务，不对外暴露搜索）。
  - API 包含：
    - `POST /embed`（文本批量转向量）
    - `POST /index/upsert`（批量写入 Qdrant）
    - `POST /vector/get`（按 id 获取向量，用于画像更新）
    - `POST /snapshot/trigger`（触发快照保存）
    - `GET /health`（健康检查）
  - 内部依赖：Qdrant HTTP/gRPC 客户端。

- **pipelines/ingest**

  - 输入：已准备好的 JSON 菜品文件。
  - 流程：加载 JSON → 清洗/规范化（字典映射、指纹生成 `fp_v1`）→ 拼接 `emb_input` → 批量嵌入 → 写入 Qdrant → 更新 Mongo `index_status`。
  - 调度：Mongo 状态机 + APScheduler/Cron（支持重试/幂等/断点续传）。

- **libs/embeddings**

  - 模型适配：`bge-m3` / `multilingual-e5-large`（可配置切换）。
  - 支持批处理、CPU/GPU 自适应、归一化。
  - 统一封装推理接口（供 services 和 pipelines 调用）。

- **libs/io**

  - Qdrant 客户端封装（集合管理、批量 upsert、快照管理）。
  - Mongo DAO（`dishes_clean/user_profiles/user_events`）。
  - 对象存储封装（S3/OSS/GCS），管理快照文件。

- **libs/contracts**

  - 从 `contracts` 仓库生成的 Pydantic 模型与客户端（类型安全校验）。

- **infra**

  - Dockerfile、docker-compose、K8s（Deployment/CronJob/ConfigMap/Secret）。
  - 观测性：结构化日志、指标（嵌入 QPS、失败率、滞留任务数）。

- **CI/CD**
  - Pants 驱动：
    - `lint`（ruff/black）
    - `typecheck`（mypy）
    - `test`（pytest）
    - `package`（wheel）
    - `docker`（镜像构建与缓存）。
  - 合并需通过测试与类型检查；镜像安全扫描可选。

## 仓库 C：contracts

- **openapi.yaml**：Backend ↔ Frontend/Vector 的唯一契约，生成 TS 类型与 Python Pydantic 模型。
- **schemas/**：用户事件、字典配置的 JSON Schema（可选）。

---

# 总结

该架构将 **前端 + 后端（Nx 管理）** 与 **数据采集 + 向量服务（Pants 管理）** 分离，  
通过 **contracts 仓库的 API 契约驱动** 保持边界清晰。  
所有服务容器化部署，MongoDB 管理元数据，FAISS 管理向量索引。  
MVP 可在一周内上线，验证用户价值与推荐效果，并具备后续快速扩展的能力。
