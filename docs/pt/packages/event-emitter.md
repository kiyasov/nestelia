---
title: Event Emitter
icon: zap
description: Emissor de eventos tipado com suporte a wildcards e integração de DI
---

O módulo Event Emitter fornece um sistema de eventos tipado e assíncrono com suporte opcional a padrões wildcard. Métodos decorados com `@OnEvent()` são automaticamente descobertos e registrados durante o bootstrap — sem necessidade de registro manual.

## Instalação

Nenhuma dependência extra necessária — o módulo está incluído em `nestelia`.

## Configuração

```typescript
import { Module } from "nestelia";
import { EventEmitterModule } from "nestelia/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,  // habilitar padrões "order.*" e "**"
      global: true,    // tornar EventEmitter2 disponível globalmente
    }),
  ],
})
export class AppModule {}
```

## Emitindo eventos

Injete `EventEmitter2` e chame `emitAsync` (aguarda todos os handlers) ou `emit` (dispara e esquece):

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

## Ouvindo eventos

Adicione `@OnEvent()` a qualquer método de qualquer provedor `@Injectable()`. O módulo escaneia todos os provedores durante `onApplicationBootstrap` e registra os handlers automaticamente.

```typescript
import { Injectable } from "nestelia";
import { OnEvent } from "nestelia/event-emitter";

@Injectable()
export class NotificationListener {
  @OnEvent("order.created")
  handleOrderCreated(order: Order) {
    console.log("Novo pedido:", order.id);
  }

  @OnEvent("order.*")
  handleAnyOrderEvent(order: Order) {
    console.log("Evento de pedido disparado");
  }
}
```

## Padrões wildcard

Habilite `wildcard: true` no `forRoot` para usar padrões no estilo glob:

| Padrão | Corresponde a |
|--------|--------------|
| `order.*` | `order.created`, `order.shipped` … |
| `**` | todos os eventos |

## Opções de configuração

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `wildcard` | `boolean` | `false` | Habilitar correspondência wildcard |
| `delimiter` | `string` | `"."` | Delimitador de namespace |
| `maxListeners` | `number` | `10` | Máximo de listeners por evento |
| `global` | `boolean` | `false` | Registrar como módulo global |

## Exportações

| Exportação | Descrição |
|-----------|-----------|
| `EventEmitterModule` | Classe do módulo |
| `EventEmitter2` | Serviço de emissor de eventos injetável |
| `OnEvent(event, opts?)` | Decorador de método para handlers |
| `InjectEventEmitter()` | Atalho para decorador de parâmetro |
| `EVENT_EMITTER_TOKEN` | Token de injeção |
