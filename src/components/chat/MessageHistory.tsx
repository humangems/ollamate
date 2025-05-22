import { useEffect, useRef, useState } from 'react';
import { Message } from '../../lib/types';
import { selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppSelector } from '../../redux/store';
import OtherMessage from './OtherMessage';
import UserMessage from './UserMessage';

type MessageHistoryProps = {
  chatId: string;
};

const isUserNearBottom = (element: HTMLElement, threshold = 50) => {
  const position = element.scrollTop + element.clientHeight;
  const height = element.scrollHeight;
  return position > height - threshold;
};

export default function MessageHistory({ chatId }: MessageHistoryProps) {
  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chatId));
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const onScroll = () => {
    if (!containerRef.current) return;
    const nearBottom = isUserNearBottom(containerRef.current, 50);
    setAutoScroll(nearBottom);
  };

  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 50);
  }, [chatId]);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  return (
    <div className=" h-[calc(100vh-52px)] overflow-y-auto" ref={containerRef} onScroll={onScroll}>
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
