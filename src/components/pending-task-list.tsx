"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { taskCollection, type Task } from "@/lib/sync/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PendingTaskList() {
  const { data: allTasks } = useLiveQuery(taskCollection);

  const pendingTasks =
    (allTasks as Task[])?.filter((task) => task.status === "pending") || [];

  return (
    <div className="w-80 h-full border-r bg-gray-50 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No pending tasks</p>
          ) : (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white rounded-lg border shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{task.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
