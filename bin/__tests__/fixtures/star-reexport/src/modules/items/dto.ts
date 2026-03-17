import { t } from "elysia";

export const createItemSchema = t.Object({
  name: t.String(),
  quantity: t.Number(),
});
