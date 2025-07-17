import { PendingTaskList } from "@/components/pending-task-list";
import { ChatWindow } from "@/components/chat-window";

export default function Home() {
  return (
    <div className="h-screen flex">
      <PendingTaskList />
      <ChatWindow />
    </div>
  );
}
