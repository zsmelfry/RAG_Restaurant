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

- **services/vector**：FastAPI + FAISS，核心 API 包含 embed/search/upsert/get/save|load，支持 HNSWFlat / IVFPQ。
- **pipelines/ingest**：数据采集、清洗、规范化、批量嵌入、入库与索引更新。
- **libs/embeddings**：模型适配（bge-m3 / multilingual-e5-large）。
- **libs/io**：索引文件、对象存储、元数据持久化。
- **libs/contracts**：从 contracts 生成的 Pydantic 模型与客户端。
- **infra**：容器定义与部署脚本。
- **CI/CD**：Pants 驱动 lint / test / package / docker。

## 仓库 C：contracts

- **openapi.yaml**：Backend ↔ Frontend/Vector 的唯一契约，生成 TS 类型与 Python Pydantic 模型。
- **schemas/**：用户事件、字典配置的 JSON Schema（可选）。

---

# 总结

该架构将 **前端 + 后端（Nx 管理）** 与 **数据采集 + 向量服务（Pants 管理）** 分离，  
通过 **contracts 仓库的 API 契约驱动** 保持边界清晰。  
所有服务容器化部署，MongoDB 管理元数据，FAISS 管理向量索引。  
MVP 可在一周内上线，验证用户价值与推荐效果，并具备后续快速扩展的能力。
