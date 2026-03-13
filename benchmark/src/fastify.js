import Fastify from "fastify";

const users = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
  { id: 3, name: "Charlie", email: "charlie@test.com" },
];

const port = Number(process.env.PORT) || 3000;
const app = Fastify({ logger: false });

app.get("/", () => "Hello World");
app.get("/json", () => ({ message: "Hello World", timestamp: Date.now() }));
app.get("/user/:id", (req) => {
  return users.find((u) => u.id === Number(req.params.id)) ?? { error: "Not found" };
});
app.post("/user", (req) => {
  return { id: users.length + 1, name: req.body.name, email: req.body.email };
});
app.get("/users", () => users);

app.listen({ port }).then(() => {
  if (process.send) process.send("ready");
});
