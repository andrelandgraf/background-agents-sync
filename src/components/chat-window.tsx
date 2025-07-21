"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { messageCollection, type Message } from "@/lib/sync/messages";
import {
  messageTaskCollection,
  type MessageTask,
} from "@/lib/sync/message-tasks";
import { taskCollection, type Task } from "@/lib/sync/tasks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

function MessageTaskDetails({ messageId }: { messageId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: allMessageTasks } = useLiveQuery(messageTaskCollection);
  const { data: allTasks } = useLiveQuery(taskCollection);

  const messageTasks =
    (allMessageTasks as MessageTask[])?.filter(
      (mt) => mt.message_id === messageId,
    ) || [];

  const relatedTasks =
    (allTasks as Task[])?.filter((task) =>
      messageTasks.some((mt) => mt.task_id === task.id),
    ) || [];

  if (relatedTasks.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
      case "succeeded":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
    }
  };

  return (
    <div className="mt-2 border-t border-border/50 pt-2">
      <details
        open={isExpanded}
        onToggle={(e) => setIsExpanded(e.currentTarget.open)}
      >
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
          {relatedTasks.length} related task
          {relatedTasks.length !== 1 ? "s" : ""}
        </summary>
        <div className="mt-2 space-y-1">
          {relatedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded"
            >
              <span className="font-medium truncate flex-1 mr-2">
                {task.name}
              </span>
              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                {task.status}
              </Badge>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export function ChatWindow() {
  const { data: allMessages } = useLiveQuery(messageCollection);

  const sortedMessages =
    (allMessages as Message[])?.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ) || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <div className="flex-1 flex flex-col m-2">
        <div className="pb-2">
          <h2 className="text-lg font-semibold text-center text-foreground">
            Activity Log
          </h2>
        </div>
        <div className="flex-1 p-0 pt-0">
          <ScrollArea className="h-full p-2">
            <div className="space-y-2 max-w-2xl mx-auto">
              {sortedMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  No messages yet
                </p>
              ) : (
                sortedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-accent/50 rounded-md p-2 hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0 mt-0.5">
                        AI
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed break-words">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.updated_at).toLocaleString()}
                        </p>
                        <MessageTaskDetails messageId={message.id} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
