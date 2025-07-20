"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { messageCollection, type Message } from "@/lib/sync/messages";

import { ScrollArea } from "@/components/ui/scroll-area";

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
