import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { selectMessageSchema } from "@/lib/db/schema";

export { type Message } from "@/lib/db/schema";

export const messageCollection = createCollection(
  electricCollectionOptions({
    id: "messages",
    shapeOptions: {
      url: new URL(
        `/api/shape`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:3000`,
      ).toString(),
      params: {
        table: "messages",
      },
    },
    schema: selectMessageSchema,
    getKey: (item) => item.id,
  }),
);
