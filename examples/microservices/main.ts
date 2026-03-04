import "reflect-metadata";

import { Transport, createElysiaNestApplication } from "../../packages/microservices";

import { AppModule } from "./src/app.module";

const app = await createElysiaNestApplication(AppModule, {
  transport: Transport.TCP,
  options: { host: "localhost", port: 3001 },
});
await app.listen();
console.log("Microservice listening on TCP :3001");
