"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { messageCollection, type Message } from "@/lib/sync/messages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatWindow() {
  const { data: allMessages } = useLiveQuery(messageCollection);

  const sortedMessages =
    (allMessages as Message[])?.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ) || [];

  return (
    <div className="flex-1 flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center">
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4 max-w-2xl mx-auto">
              {sortedMessages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No messages yet
                </p>
              ) : (
                sortedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        AI
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          {message.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(message.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
