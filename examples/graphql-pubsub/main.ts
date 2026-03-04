import "reflect-metadata";

import { createElysiaApplication } from "@kiyasov/elysia-nest";

import { AppModule } from "./src/app.module";

const app = await createElysiaApplication(AppModule);
app.listen(3000, () =>
  console.log("GraphQL PubSub example on http://localhost:3000/graphql"),
);
