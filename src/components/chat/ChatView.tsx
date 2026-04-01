import { cn } from '@/lib/utils';
import { PanelLeftIcon, PenBoxIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '../../lib/types';
import { generateTitleThunk, updateModelThunk } from '../../redux/slice/chatSlice';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import ModelSelect from '../ModelSelect';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import { useChat } from '@ai-sdk/react';
import { DirectChatTransport, ToolLoopAgent, UIMessage } from 'ai';
import { ollama } from 'ai-sdk-ollama';

import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { MessageSquare } from 'lucide-react';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ai-elements/reasoning';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

const agent = new ToolLoopAgent({
  model: ollama('glm-4.7:cloud'),
  instructions: 'You are a helpful assistant.',
  tools: {},
});

const MessageParts = ({
  message,
  isLastMessage,
  isStreaming,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
}) => {
  // Consolidate all reasoning parts into one block
  const reasoningParts = message.parts.filter((part) => part.type === 'reasoning');
  const reasoningText = reasoningParts.map((part) => part.text).join('\n\n');
  const hasReasoning = reasoningParts.length > 0;
  // Check if reasoning is still streaming (last part is reasoning on last message)
  const lastPart = message.parts.at(-1);
  const isReasoningStreaming = isLastMessage && isStreaming && lastPart?.type === 'reasoning';
  return (
    <>
      {hasReasoning && (
        <Reasoning className="w-full" isStreaming={isReasoningStreaming}>
          <ReasoningTrigger />
          <ReasoningContent>{reasoningText}</ReasoningContent>
        </Reasoning>
      )}
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>;
        }

        return null;
      })}
    </>
  );
};

export default function ChatView({ chat, isNewChat = false }: ChatViewProps) {
  // const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DirectChatTransport({ agent }),
  });

  const isStreaming = status === 'streaming';

  const [input, setInput] = useState('');

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
      setInput('');
    }
  };

  const dispatch = useAppDispatch();
  const [internalModel, setInternalModel] = useState(chat.model);
  const { state: sidebarState, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const activeModel = isNewChat ? internalModel : chat.model;
  const handleNewChat = () => {
    navigate('/');
  };

  useEffect(() => {
    dispatch(getMessagesThunk(chat.id));
  }, [chat.id, dispatch]);

  useEffect(() => {
    if (chat.title) return;

    if (messages.length !== 2) return;

    dispatch(
      generateTitleThunk({
        chatId: chat.id,
        messages: messages.map((m) => {
          return {
            role: m.role,
            content: m.content,
          };
        }),
        model: activeModel,
      }),
    );
  }, [activeModel, chat.id, chat.title, dispatch, messages]);

  const handleModelChange = (value: string) => {
    if (!isNewChat) {
      dispatch(updateModelThunk({ chatId: chat.id, model: value }));
    } else {
      setInternalModel(value);
    }
  };

  return (
    <div className="flex flex-col relative h-full">
      <div
        className={cn('bg-background h-[52px] flex items-center shrink-0 drag-region pl-4', {
          'pl-20': sidebarState === 'collapsed',
        })}
      >
        {sidebarState === 'collapsed' && (
          <>
            <Button variant="ghost" size="sm" className="no-drag-region" onClick={toggleSidebar}>
              <PanelLeftIcon />
            </Button>
            <Button variant="ghost" size="sm" className="no-drag-region" onClick={handleNewChat}>
              <PenBoxIcon />
            </Button>
          </>
        )}

        <ModelSelect value={activeModel} onChange={handleModelChange} />
      </div>

      <hr />

      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="Start a conversation"
                description="Type a message below to begin chatting"
              />
            ) : (
              messages.map((message, index) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    <MessageParts
                      message={message}
                      isLastMessage={index === messages.length - 1}
                      isStreaming={isStreaming}
                    />
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationDownload messages={messages} />
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={handleSubmit} className="mt-4 w-full max-w-2xl mx-auto relative">
          <PromptInputTextarea
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.currentTarget.value)}
            className="pr-12"
          />
          <PromptInputSubmit
            status={status === 'streaming' ? 'streaming' : 'ready'}
            disabled={!input.trim()}
            className="absolute bottom-1 right-1"
          />
        </PromptInput>
      </div>

      {/* <hr />

      <div className="flex-1 w-full h-full">
        <MessageHistory chatId={chat.id} />
      </div>

      <div className="absolute bottom-6 left-0 right-0">
        <MessageInput chatId={chat.id} model={activeModel} isNewChat={isNewChat} />
      </div> */}
    </div>
  );
}
