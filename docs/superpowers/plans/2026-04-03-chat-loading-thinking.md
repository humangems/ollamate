# Chat Loading & Thinking Indicators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a spinner inside the assistant message bubble while waiting for the first token, and ensure the existing Reasoning component transitions in naturally when thinking starts.

**Architecture:** The `MessageParts` component inside `ChatView.tsx` already renders reasoning and text. We add an `isLoadingState` guard that detects when streaming has started but no content has arrived yet (empty text + no reasoning parts), and renders a spinner placeholder instead of empty output. The old unused submitted-state spinner is removed.

**Tech Stack:** React, TypeScript, Tailwind CSS, `@ai-sdk/react` (`useChat` status), existing `<Spinner />` component at `src/components/ui/spinner.tsx`

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `src/components/chat/ChatView.tsx` | Modify | Add `isLoadingState` + spinner placeholder in `MessageParts`; remove dead submitted-state spinner |

No new files needed.

---

### Task 1: Add loading placeholder to `MessageParts`

**Files:**
- Modify: `src/components/chat/ChatView.tsx` (lines ~71–126 for `MessageParts`, lines ~289–294 for the submitted spinner)

**Context — current `MessageParts` return (lines 95–125):**
```tsx
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
```

**Context — current submitted spinner (lines ~289–294):**
```tsx
{status === 'submitted' && (
  <div>
    <Spinner />
  </div>
)}
```

- [ ] **Step 1: Add `isLoadingState` derived value and spinner branch in `MessageParts`**

  In `src/components/chat/ChatView.tsx`, inside `MessageParts`, add two derived values right after the existing `fullText` derivation (after line ~93), then add an early return before the main `return` block:

  ```tsx
  const hasVisibleContent = fullText.length > 0 || hasReasoning;
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
  ```

  The result: the `MessageParts` function body now looks like:

  ```tsx
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
  ```

- [ ] **Step 2: Remove the dead submitted-state spinner**

  In `ChatView`, inside `<ConversationContent>`, remove this block (currently after the `messages.map(...)` and before the `{error && ...}` block):

  ```tsx
  {status === 'submitted' && (
    <div>
      <Spinner />
    </div>
  )}
  ```

  After removal the `<ConversationContent>` block should look like:

  ```tsx
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
  ```

- [ ] **Step 3: Run the TypeScript compiler and linter**

  ```bash
  yarn build
  ```

  Expected: no TypeScript errors. If lint errors appear about unused `isStreaming` reference — they won't, because `isStreaming` is still used in `isLoadingState` and `isReasoningStreaming`.

- [ ] **Step 4: Manual smoke test**

  Start the app:
  ```bash
  yarn start
  ```

  Test sequence:
  1. Open any chat (or create a new one)
  2. Send a message to a non-thinking model (e.g. `llama3.2`) — immediately after sending, the assistant bubble should show spinner + "Thinking..." text; once tokens arrive it should transition to normal streaming text
  3. If you have a thinking model (e.g. `deepseek-r1`), send a message — spinner shows first, then Reasoning component opens with animated "Thinking...", then collapses and text streams in

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/chat/ChatView.tsx
  git commit -m "feat: add loading placeholder and fix thinking state in chat"
  ```

---

## Self-Review

**Spec coverage:**
- ✅ Loading while waiting for LLM → `isLoadingState` spinner
- ✅ Thinking text display → existing `<Reasoning>` naturally follows; no changes needed
- ✅ Redundant submitted spinner removed

**Placeholder scan:** No TBDs, TODOs, or vague steps. Full code shown for every change.

**Type consistency:** `isLoadingState` (boolean), `hasVisibleContent` (boolean) — both derived inside `MessageParts`, no cross-task type issues. `Spinner` is already imported at line 49.
