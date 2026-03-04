import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";

import { MathService } from "./math.service";

@Module({ providers: [MathService] })
export class AppModule {}
