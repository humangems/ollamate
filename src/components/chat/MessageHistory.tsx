import { useEffect, useRef } from "react";
import { Message } from "../../lib/types";
import { selectMessagesByChatId } from "../../redux/slice/messageSlice";
import { RootState, useAppSelector } from "../../redux/store";
import OtherMessage from "./OtherMessage";
import UserMessage from "./UserMessage";

type MessageHistoryProps = {
  chatId: string;
}

export default function MessageHistory({ chatId }: MessageHistoryProps) {
  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chatId));
  const messagesRef = useRef<HTMLDivElement>(null);
  const isStreaming = useAppSelector((state: RootState) => state.chats.isStreaming[chatId]);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }, 50);
  }, [chatId]);

  useEffect(() => {
    if (isStreaming) {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      intervalIdRef.current = setInterval(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 500);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    }
  }, [isStreaming])

  return (
    <div className=" h-[calc(100vh-190px)] overflow-y-auto" ref={messagesRef}>
      <div className="pb-24 px-4 max-w-3xl mx-auto">
        {messages.map((message: Message) => {
          return message.role === 'user' ? (
            <UserMessage message={message} key={message.id} />
          ) : (
            <OtherMessage message={message} key={message.id} />
          );
        })}
      </div>
    </div>
  );
}