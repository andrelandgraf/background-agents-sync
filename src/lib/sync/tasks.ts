import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { selectTaskSchema } from "@/lib/db/schema";

export { type Task, type TaskStatus } from "@/lib/db/schema";

export function getTaskCollection() {
  return createCollection(
    electricCollectionOptions({
      id: "tasks",
      shapeOptions: {
        url: new URL(
          `/api/shape`,
          typeof window !== `undefined`
            ? window.location.origin
            : `http://localhost:3000`,
        ).toString(),
        params: {
          table: "tasks",
        },
      },
      schema: selectTaskSchema,
      getKey: (item) => item.id,
    }),
  );
}
