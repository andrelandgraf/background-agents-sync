import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { selectMessageTaskSchema } from "@/lib/db/schema";

export { type MessageTask } from "@/lib/db/schema";

export const messageTaskCollection = createCollection(
  electricCollectionOptions({
    id: "message_tasks",
    shapeOptions: {
      url: new URL(
        `/api/shape`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:3000`,
      ).toString(),
      params: {
        table: "message_tasks",
      },
    },
    schema: selectMessageTaskSchema,
    getKey: (item) => item.id,
  }),
);
