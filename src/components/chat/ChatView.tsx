import { cn } from '@/lib/utils';
import { CopyIcon, GlobeIcon, PanelLeftIcon, PenBoxIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '../../lib/types';
import {
  chatSelectors,
  generateTitleThunk,
  updateModelThunk,
  getAllChatsThunk,
} from '../../redux/slice/chatSlice';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import ModelSelect from '../ModelSelect';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { createTRPCChatTransport } from '@/lib/trpcChatTransport';

import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import { MessageSquare } from 'lucide-react';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ai-elements/reasoning';
import { Spinner } from '../ui/spinner';
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '../ai-elements/attachments';
import { Message as DbMessage } from '../../lib/types';
import { extractReasoning } from '../../lib/reasoningHelper';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

function toUIMessage(msg: DbMessage): UIMessage {
  if (msg.role !== 'assistant') {
    return {
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      parts: [{ type: 'text', text: msg.content }],
    };
  }

  const [reasoning, content] = extractReasoning(msg.content);
  const parts: UIMessage['parts'] = [];
  if (reasoning.length > 0) {
    parts.push({ type: 'reasoning', text: reasoning, providerMetadata: {} });
  }
  parts.push({ type: 'text', text: content });

  return {
    id: msg.id,
    role: 'assistant',
    parts,
  };
}

const MessageParts = ({
  message,
  isLastMessage,
  isStreaming,
  onRegenerate,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
  onRegenerate: () => void;
}) => {
  const reasoningParts = message.parts.filter((part) => part.type === 'reasoning');
  const reasoningText = reasoningParts
    .map((part) => (part.type === 'reasoning' ? part.text : ''))
    .join('\n\n');
  const hasReasoning = reasoningParts.length > 0;
  const lastPart = message.parts[message.parts.length - 1];
  const isReasoningStreaming = isLastMessage && isStreaming && lastPart?.type === 'reasoning';

  const fullText = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('');

  const hasVisibleContent = fullText.length > 0 || hasReasoning;
  // isLoadingState covers the gap between streaming start and first token arrival.
  // status === 'submitted' is not handled separately because the tRPC transport
  // synchronously enqueues 'start'/'text-start' before any network round-trip,
  // collapsing submitted→streaming into a single React render batch.
  // If the transport is replaced with one that delays these chunks, revisit this.
  const isLoadingState =
    message.role === 'assistant' && isLastMessage && isStreaming && !hasVisibleContent;

  if (isLoadingState) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner className="size-4" />
        <span className="text-sm">Thinking...</span>
      </div>
    );
  }

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
          return (
            <MessageResponse className="text-base" key={`${message.id}-${i}`}>
              {part.text}
            </MessageResponse>
          );
        }
        return null;
      })}

      {message.role === 'assistant' && isLastMessage && (
        <MessageActions>
          <MessageAction onClick={onRegenerate} label="Retry">
            {/* RefreshCcwIcon */}
          </MessageAction>
          <MessageAction onClick={() => navigator.clipboard.writeText(fullText)} label="Copy">
            <CopyIcon className="size-3" />
          </MessageAction>
        </MessageActions>
      )}
    </>
  );
};

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) {
    return null;
  }
  return (
    <PromptInputHeader>
      <Attachments variant="inline">
        {attachments.files.map((attachment) => (
          <Attachment
            data={attachment}
            key={attachment.id}
            onRemove={() => attachments.remove(attachment.id)}
          >
            <AttachmentPreview />
            <AttachmentRemove />
          </Attachment>
        ))}
      </Attachments>
    </PromptInputHeader>
  );
};

export default function ChatView({ chat, isNewChat = false }: ChatViewProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { state: sidebarState, toggleSidebar } = useSidebar();

  const [internalModel, setInternalModel] = useState(chat.model);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [input, setInput] = useState('');

  // Prefer the Redux chat record so title/model updates reflect immediately.
  // Falls back to the prop for new chats before their first Redux presence.
  const reduxChat = useAppSelector((state: RootState) =>
    chatSelectors.selectById(state.chats, chat.id),
  );
  const liveChat = reduxChat ?? chat;
  const activeModel = isNewChat ? internalModel : liveChat.model;

  // Load historical messages from Redux (populated from SQLite via tRPC)
  const historicalMessages = useAppSelector((state: RootState) =>
    selectMessagesByChatId(state, chat.id),
  );

  // Transport is stable per chat; the model is resolved at send-time from a
  // ref so switching models mid-stream never tears down the active subscription.
  // The ref is only ever read inside sendMessages (an event-handler context),
  // so the render-phase warnings are safe to suppress here.
  const modelRef = useRef(activeModel);
  useEffect(() => {
    modelRef.current = activeModel;
  }, [activeModel]);
  const titleGeneratedRef = useRef<boolean>(Boolean(liveChat.title));
  const transport = useMemo(
    // eslint-disable-next-line react-hooks/refs
    () => createTRPCChatTransport(chat.id, () => modelRef.current),
    [chat.id],
  );

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    transport,
    messages: historicalMessages.map(toUIMessage),
    onFinish: ({ messages: finalMessages }) => {
      const refreshChats = dispatch(getAllChatsThunk());
      const refreshMessages = dispatch(getMessagesThunk(chat.id));

      // Fire title generation exactly once, after the first turn completes.
      if (!titleGeneratedRef.current && finalMessages.length >= 2) {
        titleGeneratedRef.current = true;
        dispatch(
          generateTitleThunk({
            chatId: chat.id,
            messages: finalMessages.slice(0, 2).map((m) => ({
              role: m.role,
              content: m.parts
                .filter((p) => p.type === 'text')
                .map((p) => (p.type === 'text' ? p.text : ''))
                .join(''),
            })),
            model: modelRef.current,
          }),
        );
      }

      if (isNewChat) {
        Promise.all([refreshChats, refreshMessages]).then(() => {
          navigate(`/chat/${chat.id}`);
        });
      }
    },
  });

  const isStreaming = status === 'streaming';

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
      setInput('');
    }
  };

  const handleModelChange = (value: string) => {
    if (!isNewChat) {
      dispatch(updateModelThunk({ chatId: chat.id, model: value }));
    } else {
      setInternalModel(value);
    }
  };

  const handleNewChat = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col relative h-full overflow-hidden">
      <div
        className={cn('bg-background h-13 flex items-center shrink-0 drag-region pl-4', {
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

        <div className="flex items-center justify-between flex-1">
          <ModelSelect value={activeModel} onChange={handleModelChange} />
          <div className="no-drag-region pr-4">
            <ConversationDownload messages={messages} className="p-0 static" />
          </div>
        </div>
      </div>

      <div className="flex-1 max-h-[calc(100vh-52px)] overflow-y-auto">
        <div className="w-full max-w-3xl pb-64 mx-auto">
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
                        onRegenerate={regenerate}
                      />
                    </MessageContent>
                  </Message>
                ))
              )}
              {error && <div className="text-destructive text-sm px-2 py-1">{error.message}</div>}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0">
        <div className="mx-auto w-full max-w-3xl px-4">
          <PromptInput onSubmit={handleSubmit} globalDrop multiple className="bg-background">
            <PromptInputAttachmentsDisplay />

            <PromptInputBody>
              <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                    <PromptInputActionAddScreenshot />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  tooltip={{ content: 'Search the web', shortcut: '⌘K' }}
                  variant={useWebSearch ? 'default' : 'ghost'}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!input && status !== 'streaming'}
                status={status}
                onClick={status === 'streaming' ? stop : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
