import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatComponent from "@/components/ChatComponent";
import { checkSubscription } from "@/lib/subscription";

async function ChatPage({ params }: { params: { chatId: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(params.chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find(
    (chat) => chat.id === parseInt(params.chatId)
  ); 
  const isPro = await checkSubscription();
  return (
    <div className="flex h-screen">
      <div className="flex w-full h-full">
        <div className="flex-[1] max-w-xs h-full">
          <ChatSideBar
            chats={_chats}
            chatId={parseInt(params.chatId)}
            isPro={isPro}
          />
        </div>
        <div className="flex-[5] p-4 h-full">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        <div className="flex-[3] border-l-4 border-l-slate-200 h-full">
          <ChatComponent chatId={parseInt(params.chatId)} />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
