"use client";
import React from "react";
import { DrizzleChat } from "@/lib/db/schema";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SubscriptionButton from "./SubscriptionButton";
import { MessageCircle, PlusCircle } from "lucide-react";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);
  return (
    <div className="w-full h-full overflow-scroll p-4 text-gray-200 bg-gray-900 flex flex-col justify-between">
      <div>
        <Link href="/">
          <Button className="w-full border-dashed border-white border">
            <PlusCircle className="mr-2 w-4 h-4" />
            New Chat
          </Button>
        </Link>
        <div className="flex flex-col gap-2 mt-4">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <div
                className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                  "bg-blue-600 text-white": chat.id === chatId,
                  "hover:text-white": chat.id !== chatId,
                })}
              >
                <MessageCircle className="mr-2" />
                <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                  {chat.pdfName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default ChatSideBar;
