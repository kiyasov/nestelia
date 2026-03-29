import { t } from "elysia";

export const webhookItemSchema = t.Object({
  event: t.String(),
  payload: t.String(),
});

export const webhookListSchema = t.Array(webhookItemSchema);

export const webhookRequestSchema = t.Object({
  url: t.String(),
  events: t.Array(webhookItemSchema),
});
