import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";

import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}
