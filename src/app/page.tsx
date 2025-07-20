import { PendingTaskList } from "@/components/pending-task-list";
import { ChatWindow } from "@/components/chat-window";
import { ClientOnly } from "@/components/ClientOnly";

export default function Home() {
  return (
    <ClientOnly>
      <div className="h-screen flex bg-background text-foreground">
        <PendingTaskList />
        <ChatWindow />
      </div>
    </ClientOnly>
  );
}
