---
title: Event Emitter
icon: zap
description: ワイルドカード対応・DI統合済みの型安全なイベントエミッター
---

Event Emitter モジュールは、型安全で非同期対応のイベントシステムを提供します。オプションでワイルドカードパターンマッチングを有効にできます。`@OnEvent()` でデコレートされたメソッドはブートストラップ時に自動的に検出・登録されます。

## インストール

追加依存関係は不要です — モジュールは `nestelia` に含まれています。

## セットアップ

```typescript
import { Module } from "nestelia";
import { EventEmitterModule } from "nestelia/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,  // "order.*" や "**" パターンを有効化
      global: true,    // EventEmitter2 をアプリ全体で利用可能に
    }),
  ],
})
export class AppModule {}
```

## イベントの送信

`EventEmitter2` を注入し、`emitAsync`（全ハンドラーを待機）または `emit`（ファイア＆フォーゲット）を呼び出します：

```typescript
import { Injectable } from "nestelia";
import { EventEmitter2 } from "nestelia/event-emitter";

@Injectable()
export class OrdersService {
  constructor(private readonly events: EventEmitter2) {}

  async placeOrder(order: Order) {
    await this.events.emitAsync("order.created", order);
    return order;
  }
}
```

## イベントのリッスン

任意の `@Injectable()` プロバイダーのメソッドに `@OnEvent()` を追加します。モジュールが `onApplicationBootstrap` 中に自動的にスキャンして登録します。

```typescript
import { Injectable } from "nestelia";
import { OnEvent } from "nestelia/event-emitter";

@Injectable()
export class NotificationListener {
  @OnEvent("order.created")
  handleOrderCreated(order: Order) {
    console.log("新規注文:", order.id);
  }

  @OnEvent("order.*")
  handleAnyOrderEvent(order: Order) {
    console.log("注文イベント発火");
  }
}
```

## ワイルドカードパターン

`forRoot` で `wildcard: true` を有効にすると glob スタイルのパターンが使用できます：

| パターン | マッチ |
|---------|--------|
| `order.*` | `order.created`、`order.shipped` … |
| `**` | すべてのイベント |

## 設定オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|----|-----------|----|
| `wildcard` | `boolean` | `false` | ワイルドカードマッチングを有効化 |
| `delimiter` | `string` | `"."` | 名前空間の区切り文字 |
| `maxListeners` | `number` | `10` | イベントごとの最大リスナー数 |
| `global` | `boolean` | `false` | グローバルモジュールとして登録 |

## エクスポート

| エクスポート | 説明 |
|------------|------|
| `EventEmitterModule` | モジュールクラス |
| `EventEmitter2` | インジェクタブルなイベントエミッターサービス |
| `OnEvent(event, opts?)` | イベントハンドラーメソッドデコレーター |
| `InjectEventEmitter()` | パラメーターデコレーターの省略形 |
| `EVENT_EMITTER_TOKEN` | インジェクショントークン |
