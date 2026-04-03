# Chat Loading & Thinking Indicators

**Date**: 2026-04-03
**Status**: Approved

---

## Problem

Two UX gaps exist in the current chat flow:

1. **No visible loading state**: When the user sends a message, `status` transitions from `submitted` → `streaming` almost instantly because `trpcChatTransport.ts` synchronously enqueues `start` and `text-start` chunks. The assistant message exists in the list immediately, but it has **empty content** — nothing indicates to the user that the model is processing.

2. **Thinking (reasoning) works but silently**: The `<Reasoning>` / `<ReasoningContent>` components are already wired up in `MessageParts`. However, because there is no loading state before them, the transition from "nothing visible" → "Thinking..." feels abrupt and looks broken.

---

## Root Cause Analysis

```
User sends message
 → sendMessage() called
 → transport.sendMessages() called
 → ReadableStream.start() runs synchronously
   → enqueues { type: 'start' }     ← useChat creates empty assistant message
   → enqueues { type: 'text-start' } ← text part added (empty)
 → status: submitted → streaming (instant, browser never renders submitted state)

 ... network round-trip ...

 → First token arrives (reasoning-delta OR text-delta)
   → If reasoning: Reasoning component shows ✓
   → If text: text renders ✓
```

The **gap** is between "empty assistant message created" and "first token arrives". During this window, `status === 'streaming'` but all parts are empty — nothing renders.

---

## Solution

**Scope**: `ChatView.tsx` only (no transport changes needed).

Add a **loading placeholder** inside `MessageParts` that activates when:
- The message is an assistant message (`role === 'assistant'`)
- It's the last message (`isLastMessage === true`)
- It's currently streaming (`isStreaming === true`)
- It has **no visible content**: text is empty AND no reasoning parts exist

In this state, render a spinner inside the message bubble instead of empty content.

---

## Component Changes

### `MessageParts` (inside `ChatView.tsx`)

Add a `isLoadingState` derived value:

```tsx
const hasVisibleContent = fullText.length > 0 || hasReasoning;
const isLoadingState =
  message.role === 'assistant' &&
  isLastMessage &&
  isStreaming &&
  !hasVisibleContent;
```

When `isLoadingState` is true, render a spinner placeholder instead of the normal content tree.

### Loading Placeholder UI

A minimal inline spinner that matches the message bubble aesthetic:
```tsx
<div className="flex items-center gap-2 text-muted-foreground">
  <Spinner className="size-4" />
  <span className="text-sm">Thinking...</span>
</div>
```

### Remove redundant submitted-state spinner

The existing `{status === 'submitted' && <div><Spinner /></div>}` outside the message list never renders visually (due to the synchronous transport). Remove it to keep the code clean.

---

## State Flow After Fix

```
User sends message → empty assistant message created
 → [LoadingState]: spinner shows ("Thinking...")
     ↓ first reasoning token
 → [ThinkingState]: Reasoning component auto-opens with shimmer "Thinking..."
     ↓ reasoning ends, text starts
 → [TextState]: text streams in, Reasoning collapses
     ↓ finish
 → [DoneState]: message complete, actions (copy/retry) appear
```

---

## What Does NOT Change

- `trpcChatTransport.ts` — no transport changes
- `reasoning.tsx` — the Reasoning component is already correct
- `shimmer.tsx` — unchanged
- Message rendering structure — only `MessageParts` logic changes

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/chat/ChatView.tsx` | Add `isLoadingState` logic to `MessageParts`, remove submitted-state spinner |
