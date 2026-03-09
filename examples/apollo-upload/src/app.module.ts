import "reflect-metadata";

import { Module } from "nestelia";
import { GraphQLModule } from "../../../packages/apollo/src";

import { UploadResolver } from "./upload.resolver";

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: "/graphql",
      autoSchemaFile: true,
      playground: true,
    }),
  ],
  providers: [UploadResolver],
})
export class AppModule {}
