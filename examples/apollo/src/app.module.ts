import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";
import { GraphQLModule } from "../../../packages/apollo/src";

import { BooksResolver } from "./books.resolver";

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: "/graphql",
      autoSchemaFile: true,
      playground: true,
    }),
  ],
  providers: [BooksResolver],
})
export class AppModule {}
