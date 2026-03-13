---
title: パフォーマンス
description: NestJS、Express、Fastify との Nestelia ベンチマーク結果比較
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# パフォーマンス

Nestelia は Elysia の上にデコレーターと依存性注入の薄いレイヤーを追加します — パフォーマンスへの影響はほぼゼロです。結果：Elysia レベルの速度で NestJS スタイルの開発体験を実現。

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="5 シナリオの平均リクエスト数/秒。500 接続、シナリオごとに 10 秒。macOS arm64、Bun 1.3、Node 24。"
/>

## シナリオ別結果

| シナリオ | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 75,868 | 77,912 | 47,946 | 40,605 | 39,098 |
| **JSON** GET /json | 75,232 | 78,548 | 45,279 | 38,472 | 36,752 |
| **Path Params** GET /user/:id | 58,854 | 76,953 | 45,867 | 38,658 | 28,003 |
| **POST JSON** POST /user | 51,266 | 64,383 | 30,567 | 34,119 | 24,707 |
| **DI + Service** GET /users | 73,983 | 77,585 | 44,757 | 38,126 | 25,550 |
| **平均** | **67,041** | **75,076** | **42,883** | **37,996** | **30,822** |

## 再現方法

```bash
# ベンチマーク依存関係をインストール
cd benchmark && bun install && cd ..

# 負荷テストツールをインストール
brew install bombardier

# すべてのベンチマークを実行（5 シナリオ × 5 フレームワーク）
bun run bench

# または特定のフレームワークを実行
bun run bench nestelia elysia fastify
```

## なぜ Nestelia は速いのか？

Nestelia はすべての依存性注入、モジュール配線、ルート登録を**起動時**に解決します。リクエスト処理時には、コントローラーがサービスメソッドを直接呼び出します — ミドルウェアチェーンもリクエストごとのコンテナ検索もありません。

| | Nestelia | NestJS |
|---|---|---|
| ランタイム | Bun | Node.js |
| HTTP レイヤー | Elysia | Express（デフォルト） |
| DI 解決 | 起動時 | 起動時 |
| メタデータリフレクション | 起動時にキャッシュ | リクエストごと |
| リクエストコンテキスト | 高速パスでスキップ | 常に作成 |
| ミドルウェアチェーン | なし（Elysia ハンドラー） | Express ミドルウェアスタック |
| バリデーション | Elysia TypeBox（コンパイル時） | class-validator（ランタイムリフレクション） |
