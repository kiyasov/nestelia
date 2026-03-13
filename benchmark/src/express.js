import express from "express";

const users = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
  { id: 3, name: "Charlie", email: "charlie@test.com" },
];

const port = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World"); });
app.get("/json", (req, res) => { res.json({ message: "Hello World", timestamp: Date.now() }); });
app.get("/user/:id", (req, res) => {
  res.json(users.find((u) => u.id === Number(req.params.id)) ?? { error: "Not found" });
});
app.post("/user", (req, res) => {
  res.json({ id: users.length + 1, name: req.body.name, email: req.body.email });
});
app.get("/users", (req, res) => { res.json(users); });

app.listen(port, () => {
  if (process.send) process.send("ready");
});
