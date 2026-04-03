import { cn } from '@/lib/utils';
import { CopyIcon, GlobeIcon, PanelLeftIcon, PenBoxIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '../../lib/types';
import { generateTitleThunk, updateModelThunk, getAllChatsThunk } from '../../redux/slice/chatSlice';
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

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

function toUIMessage(msg: DbMessage): UIMessage {
  return {
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    parts: [{ type: 'text', text: msg.content }],
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
    message.role === 'assistant' &&
    isLastMessage &&
    isStreaming &&
    !hasVisibleContent;

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

  const activeModel = isNewChat ? internalModel : chat.model;

  // Load historical messages from Redux (populated from SQLite via tRPC)
  const historicalMessages = useAppSelector((state: RootState) =>
    selectMessagesByChatId(state, chat.id)
  );

  // Create tRPC-backed transport, recreated when chatId or model changes
  const transport = useMemo(
    () => createTRPCChatTransport(chat.id, activeModel),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chat.id, activeModel]
  );

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    transport,
    messages: historicalMessages.map(toUIMessage),
    onFinish: () => {
      if (isNewChat) {
        // Wait for both thunks before navigating so historicalMessages is populated
        // when the new ChatView mounts (useChat only uses messages prop as initial value)
        Promise.all([
          dispatch(getMessagesThunk(chat.id)),
          dispatch(getAllChatsThunk()),
        ]).then(() => {
          navigate(`/chat/${chat.id}`);
        });
      } else {
        dispatch(getMessagesThunk(chat.id));
        dispatch(getAllChatsThunk());
      }
    },
  });

  const isStreaming = status === 'streaming';

  useEffect(() => {
    dispatch(getMessagesThunk(chat.id));
  }, [chat.id, dispatch]);

  // Auto-generate title after first two messages
  useEffect(() => {
    if (chat.title) return;
    if (messages.length !== 2) return;

    dispatch(
      generateTitleThunk({
        chatId: chat.id,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.parts
            .filter((p) => p.type === 'text')
            .map((p) => (p.type === 'text' ? p.text : ''))
            .join(''),
        })),
        model: activeModel,
      })
    );
  }, [activeModel, chat.id, chat.title, dispatch, messages]);

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
              {error && (
                <div className="text-destructive text-sm px-2 py-1">{error.message}</div>
              )}
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
