import "reflect-metadata";

import { createElysiaApplication } from "nestelia";

import { AppModule } from "./src/app.module";

const app = await createElysiaApplication(AppModule);
app.listen(3000, () => console.log("Apollo GraphQL on http://localhost:3000/graphql"));
