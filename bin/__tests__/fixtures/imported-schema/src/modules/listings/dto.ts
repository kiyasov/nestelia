import { t } from "elysia";

export const createListingSchema = t.Object({
  title: t.String(),
  price: t.Number(),
});

export const listingQuerySchema = t.Object({
  page: t.Optional(t.Number()),
});
