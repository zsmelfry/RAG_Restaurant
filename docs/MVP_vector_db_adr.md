# ADR: MVP 向量数据库选型 —— Qdrant

## 背景

MVP 阶段需要一个开源免费、支持多语言向量检索的数据库，用于菜品和用户画像的相似度搜索。目标数据规模在 1 万 ~ 10 万 条，重点在 **快速落地、低延迟、易用性**。

## 决策

选择 **Qdrant** 作为 MVP 的向量数据库。

## 理由

- **开箱即用**：Rust 实现，单体部署，Docker 一键启动。
- **内置 API**：自带 REST/gRPC，不需要额外开发服务层。
- **过滤功能强**：可在搜索时直接按 `allergens`、`budget` 等字段过滤，契合菜品推荐场景。
- **性能足够**：HNSW 支持增量更新，满足 ≤100k 数据规模的实时检索。
- **生态支持**：官方 SDK 覆盖 Python 和 JavaScript，Python 用于 Indexer，Node.js 用于在线检索。

## 备选方案

- **FAISS**：成熟但仅是库，需要自建服务，开发成本更高。
- **Milvus**：分布式、适合亿级，但部署复杂，MVP 阶段过重。
- **Weaviate / Vespa**：功能多，但资源开销大，学习曲线高。
- **Annoy / HNSWlib**：极轻量，但缺少服务化与增量更新能力。

## 影响

- Python Indexer 使用 `qdrant-client` 写入/更新向量。
- Node.js Backend 使用 `qdrant-js` 直接做向量搜索。
- Qdrant 部署为单体服务，持久化索引快照到对象存储。
- 后续若数据规模上升，可平滑迁移至 Milvus 或 Qdrant 分布式版本。

## 状态

**Accepted** （MVP 阶段执行）
