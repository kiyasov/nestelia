import "reflect-metadata";

import { Module } from "nestelia";

import { MathService } from "./math.service";

@Module({ providers: [MathService] })
export class AppModule {}
