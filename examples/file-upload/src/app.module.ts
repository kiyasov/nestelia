import "reflect-metadata";

import { Module } from "nestelia";

import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}
