import { cn } from '@/lib/utils';
import { CopyIcon, GlobeIcon, PanelLeftIcon, PenBoxIcon, RefreshCcwIcon } from 'lucide-react';
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
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
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
import { text } from 'stream/consumers';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

const agent = new ToolLoopAgent({
  model: ollama('glm-4.7:cloud'),
  instructions: 'You are a helpful assistant.',
  tools: {
    webSearch: ollama.tools.webSearch({}),
    webFetch: ollama.tools.webFetch({}),
  },
});

const models = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' },
];

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

      {message.role === 'assistant' && isLastMessage && (
        <MessageActions>
          <MessageAction onClick={() => regenerate()} label="Retry">
            <RefreshCcwIcon className="size-3" />
          </MessageAction>
          <MessageAction onClick={() => navigator.clipboard.writeText(part.text)} label="Copy">
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
  // const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DirectChatTransport({ agent }),
  });

  const isStreaming = status === 'streaming';

  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].id);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

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

        <ModelSelect value={activeModel} onChange={handleModelChange} />
      </div>

      <div className="flex-1 h-full bg-red-50 overflow-y-auto">
        <div className="w-full mx-auto">
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
              {(status === 'submitted' || status === 'streaming') && (
                <div>
                  {status === 'submitted' && <Spinner />}
                  <button type="button" onClick={() => stop()}>
                    Stop
                  </button>
                </div>
              )}
            </ConversationContent>
            <ConversationDownload messages={messages} />
            <ConversationScrollButton />
          </Conversation>
        </div>
      </div>

      {/* <hr />

      <div className="flex-1 w-full h-full">
        <MessageHistory chatId={chat.id} />
      </div>

      <div className="absolute bottom-6 left-0 right-0">
        <MessageInput chatId={chat.id} model={activeModel} isNewChat={isNewChat} />
      </div> */}

      <div className="absolute bottom-6 left-0 right-0">
        <div className="mx-auto w-full max-w-3xl px-4 bg-background">
          <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
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
                <PromptInputSelect
                  onValueChange={(value) => {
                    setModel(value);
                  }}
                  value={model}
                >
                  <PromptInputSelectTrigger>
                    <PromptInputSelectValue />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {models.map((model) => (
                      <PromptInputSelectItem key={model.id} value={model.id}>
                        {model.name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </PromptInputTools>
              <PromptInputSubmit disabled={!text && !status} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
