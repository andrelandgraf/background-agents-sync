"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { taskCollection, type Task } from "@/lib/sync/tasks";
import { Badge } from "@/components/ui/badge";

function PendingSpinner() {
  return (
    <div className="inline-flex items-center">
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

export function PendingTaskList() {
  const { data: allTasks } = useLiveQuery(taskCollection);

  const pendingTasks =
    (allTasks as Task[])?.filter((task) => task.status === "pending") || [];

  return (
    <div className="w-80 h-full bg-muted/30 p-2">
      <div className="h-full">
        <div className="pb-2">
          <h2 className="text-lg font-semibold text-foreground">
            Pending Tasks
          </h2>
        </div>
        <div className="space-y-2 pt-0">
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending tasks</p>
          ) : (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-2 bg-card rounded-md shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20"></div>
                <div className="absolute inset-0 pending-shimmer opacity-30"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 animate-pulse"></div>
                <div className="relative flex items-start gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="mt-0.5">
                      <PendingSpinner />
                    </div>
                    <h3 className="font-medium text-sm text-card-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors leading-relaxed break-words">
                      {task.name}
                    </h3>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-800 animate-pulse shrink-0 mt-0.5"
                  >
                    {task.status}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50 animate-pulse"></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
