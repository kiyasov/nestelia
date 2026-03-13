import { Elysia, t } from "elysia";

const users = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
  { id: 3, name: "Charlie", email: "charlie@test.com" },
];

const port = Number(process.env.PORT) || 3000;
new Elysia()
  .get("/", () => "Hello World")
  .get("/json", () => ({ message: "Hello World", timestamp: Date.now() }))
  .get("/user/:id", ({ params }) => {
    return users.find((u) => u.id === Number(params.id)) ?? { error: "Not found" };
  })
  .post(
    "/user",
    ({ body }) => {
      return { id: users.length + 1, name: body.name, email: body.email };
    },
    { body: t.Object({ name: t.String(), email: t.String() }) },
  )
  .get("/users", () => users)
  .listen(port, () => {
    process.send?.("ready");
  });
