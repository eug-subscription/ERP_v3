# Messages Tab → Top-Class SaaS Chat Upgrade

> [!NOTE]
> Analysis of the current Messages tab against best-in-class SaaS chat experiences (Intercom, Linear, Notion, Slack, Height). Covers **visual polish** and **new functional features** — video messages, file attachments, and @mentions.

---

## Current State

The Messages tab is a basic text-only chat with:

- Plain text bubbles with avatar + name + timestamp
- Thumbs up/down reactions + "Public Channel" chip
- Single-line `TextField` composer with a send button
- No file support, no mentions, no rich media

It works but looks like an MVP prototype — not a premium product.

---

## Part 1 — Visual Enhancements

### 1.1 Message Thread with Scroll Shadow

**Problem:** All messages render in a flat, unsized container. When the thread grows, the entire Card expands endlessly — no scroll boundary, no visual cue.

**Solution:**

- Wrap the message list in a `ScrollShadow` (HeroUI) with a fixed max height (e.g., `PANEL_SCROLL_HEIGHT` or `max-h-[480px]`).
- Auto-scroll to the newest message on mount and on new message arrival.
- Add a "scroll to bottom" floating mini-button when scrolled up (like Slack/Intercom).

```tsx
<ScrollShadow className="max-h-[480px] px-8 py-6">
    {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
    ))}
</ScrollShadow>
```

---

### 1.2 Message Grouping & Date Separators

**Problem:** Every message shows a full name + avatar + timestamp, even consecutive messages from the same user seconds apart. This looks cluttered and amateurish.

**Solution:**

- **Group consecutive messages** from the same sender — show avatar + name only on the first message of a group.
- **Collapse timestamps** — show timestamp on the first and last of a group; show relative time on hover for middle messages via `Tooltip`.
- **Date separators** — insert a centered separator row between different days (e.g., `── Today ──`, `── Feb 17 ──`).

```
── Today ──

  [Avatar] Phoenix Baker                     7:15 PM
           Hey there, can you choose the best design?
           Hurry up, I need a quick turnaround.    7:39 PM

  [Avatar] You                               7:42 PM
           Sure, give me 10 minutes.
```

---

### 1.3 Premium Bubble Design

**Problem:** Current bubbles use `bg-default-100` / `bg-accent-100` with minimal visual hierarchy. They look flat.

**Solution:**

| Element | Current | Upgraded |
|:---|:---|:---|
| Sender bubble | `bg-default-100` flat | `bg-default-50` with subtle `border border-default-200` and `shadow-sm` |
| Current user bubble | `bg-accent-100` flat | Gradient `bg-gradient-to-br from-accent-100 to-accent-50` with `shadow-accent-sm` |
| Hover state | None | `hover:shadow-md` + slight scale `hover:scale-[1.01]` with `transition-all duration-200` |
| Corner radius | `rounded-xl` uniform | Directional: sender gets `rounded-2xl rounded-tl-md`, current user gets `rounded-2xl rounded-tr-md` — chat-app style tails |
| Timestamp | Always visible | Show via `opacity-0 group-hover:opacity-100` transition — appears on hover |

---

### 1.4 Typing Indicator

**Problem:** No feedback when someone is composing a reply.

**Solution:** Add a subtle animated typing indicator that appears below the last message when another user is typing.

```tsx
<div className="flex items-center gap-2 px-4 py-2">
    <Avatar size="xs">...</Avatar>
    <div className="flex gap-1">
        <span className="size-1.5 rounded-full bg-default-400 animate-bounce [animation-delay:0ms]" />
        <span className="size-1.5 rounded-full bg-default-400 animate-bounce [animation-delay:150ms]" />
        <span className="size-1.5 rounded-full bg-default-400 animate-bounce [animation-delay:300ms]" />
    </div>
    <span className="text-tiny text-default-400">Phoenix is typing...</span>
</div>
```

This can be driven by a `isTyping` field in the message query or a separate WebSocket/polling hook in the future. For now, mock it.

---

### 1.5 Enhanced Reactions Bar

**Problem:** Current reactions are global (one like/dislike for the entire thread at the bottom). This is unconventional — SaaS chat reactions are per-message.

**Solution:**

- **Per-message reactions:** On hover, show a small reaction picker (emoji tray) floating to the right of each message bubble. Start with a minimal set: 👍 ❤️ 😂 👀 🎉.
- **Reaction pills:** Display selected reactions as small pills below each message (e.g., `👍 2` `❤️ 1`).
- **Remove** the global thread-level thumbs up/down bar.
- **Keep** the "Public Channel" chip — move it to the `Card.Header` as a status badge next to the title.

```tsx
// Reaction pill below message
<div className="flex gap-1 mt-1">
    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs rounded-full">
        👍 2
    </Button>
    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs rounded-full">
        ❤️ 1
    </Button>
</div>
```

---

### 1.6 Read Receipts & Status Indicators

**Problem:** No indication whether a message was delivered or read.

**Solution:** For current-user messages, show a subtle status icon below each bubble:

- `lucide:check` — Sent
- `lucide:check-check` — Delivered
- `lucide:check-check` in accent color — Read

```tsx
{message.isCurrentUser && (
    <div className="flex justify-end mt-0.5">
        <Icon
            icon={message.status === "read" ? "lucide:check-check" : "lucide:check"}
            className={`size-3.5 ${message.status === "read" ? "text-accent" : "text-default-400"}`}
        />
    </div>
)}
```

---

### 1.7 Online Presence on Avatars

**Problem:** Avatars are static — no indication of user activity.

**Solution:** Use HeroUI `Avatar` with a status badge dot:

- Green dot → Online
- Yellow dot → Away
- Gray dot → Offline

This is purely visual and driven by the `User` interface mock data.

---

## Part 2 — New Features

### 2.1 File Attachments

Allow users to attach files (images, PDFs, ZIPs) to messages.

#### Data Model Changes

Extend `Message` interface in `mock-messages.ts`:

```ts
export interface Attachment {
    id: string;
    fileName: string;
    fileSize: number;           // bytes
    mimeType: string;           // "image/png", "application/pdf", etc.
    thumbnailUrl?: string;      // for images/videos
    downloadUrl: string;
}

export interface Message {
    id: string;
    user: { name: string; avatar: string; status: "online" | "away" | "offline" };
    text: string;
    time: string;
    isCurrentUser: boolean;
    attachments?: Attachment[];  // NEW
    reactions?: Reaction[];      // NEW
    status?: "sent" | "delivered" | "read"; // NEW
}
```

#### New Component: `MessageAttachment.tsx`

Renders each attachment based on MIME type:

| Type | Rendering |
|:---|:---|
| `image/*` | Inline thumbnail (max 320px wide), click to open full-size in `Modal` lightbox |
| `application/pdf` | File card with PDF icon + name + size + download `Button` |
| `video/*` | Inline `<video>` player with poster thumbnail (see §2.2) |
| Other | Generic file card with `lucide:file` icon + name + size + download `Button` |

#### Composer Changes

Add an attachment button to `MessageComposer`:

```
[Avatar] [    Type a message...    ] [📎] [🎥] [➤]
```

- `📎` button opens native `<input type="file" multiple>` (hidden, triggered by `onPress`).
- Show attached files as removable `Chip` pills above the input before sending.
- Validate: max 5 files, max 25 MB each. Show `toast()` on validation failure.

---

### 2.2 Video Messages

Allow inline recording and playback of short video messages.

#### Recording Flow

1. User presses the video icon `🎥` in the composer toolbar.
2. A `Modal` opens with a camera preview (using `navigator.mediaDevices.getUserMedia`).
3. Controls: **Record** (red circle), **Stop**, **Re-record**, **Send**.
4. On send, the recorded blob is treated as a `video/*` attachment and appended to the message.
5. Max duration: **60 seconds**. Show a countdown timer ring during recording.

#### New Components

| Component | Responsibility |
|:---|:---|
| `VideoRecorderModal.tsx` | Camera preview + record/stop/send controls |
| `VideoPlayer.tsx` | Inline video player with poster, play button overlay, and progress bar |

#### Playback

- Render inline in the message bubble with a poster frame thumbnail.
- Play/pause on click. Show a slim progress bar below the video.
- Aspect ratio constrained to `aspect-video max-w-[320px]`.

#### Permissions

- If camera/microphone access is denied, show a friendly `Alert` explaining how to enable it.

---

### 2.3 @Mentions

Allow users to mention other participants in the chat.

#### Trigger

When the user types `@` in the composer, a **dropdown popup** appears above the input showing matching users.

#### New Components

| Component | Responsibility |
|:---|:---|
| `MentionPopover.tsx` | Floating list of matchable users shown on `@` trigger |
| `MentionChip.tsx` | Inline styled mention display inside message text |

#### Behavior

1. On typing `@`, query the order's participants list.
2. Filter as the user continues typing (e.g., `@Pho` → "Phoenix Baker").
3. The popover shows `Avatar` + name for each match. Use HeroUI `Popover` + `ListBox`.
4. On selection, insert a mention token into the text: `@[Phoenix Baker](user:phoenix-id)`.
5. Render mentions as inline styled spans with accent background.

#### Data Model

```ts
export interface Mention {
    userId: string;
    displayName: string;
}

// Add to Message interface
export interface Message {
    // ...existing fields
    mentions?: Mention[];
}
```

#### Display in Bubbles

Mentions render as clickable accent-colored inline elements within the message text:

```tsx
<span className="font-semibold text-accent cursor-pointer hover:underline">
    @Phoenix Baker
</span>
```

In the future, clicking a mention could open a user profile popover.

---

### 2.4 Message Actions (Context Menu)

**Problem:** No way to reply to, edit, or delete a specific message.

**Solution:** On hover, show a small action toolbar (floating to the right of the bubble):

| Action | Icon | Description |
|:---|:---|:---|
| Reply | `lucide:reply` | Quote the message and focus the composer |
| Edit | `lucide:pencil` | Only for own messages — inline edit mode |
| Delete | `lucide:trash-2` | Only for own messages — confirm via `AlertDialog` |
| React | `lucide:smile-plus` | Open emoji picker |

Use a HeroUI `Dropdown` or small icon button row that appears on `group-hover`.

---

### 2.5 Threaded Replies

**Problem:** All messages are flat — no way to reply to a specific message without losing context.

**Solution:**

- Add a `replyTo?: string` (message ID) to the `Message` interface.
- When replying, show a small quoted preview of the original message above the new bubble:

```
┌─ Replying to Phoenix Baker ─────────────┐
│ Hey there, can you choose the best design? │
└──────────────────────────────────────────┘
Sure, I'll pick design #3.
```

- The composer shows a small reply preview bar above the input when in reply mode, with a dismiss `×` button.

---

## Part 3 — Composer Upgrade

The composer is the most critical interaction point. Here's the target design:

### Layout

```
┌──────────────────────────────────────────────────────┐
│  [Reply preview bar — shown when replying]     [×]   │
├──────────────────────────────────────────────────────┤
│  [📎 attached-file.pdf  ×] [📷 photo.jpg  ×]        │
├──────────────────────────────────────────────────────┤
│  [Avatar]  Type a message...                         │
│            @mention popover appears here ↑           │
├──────────────────────────────────────────────────────┤
│  [📎 Attach] [🎥 Video] [😊 Emoji]        [Send ➤]  │
└──────────────────────────────────────────────────────┘
```

### Key Changes

| Element | Current | Target |
|:---|:---|:---|
| Input | Single-line `TextField` | `TextArea` with auto-grow (min 1 row, max 6 rows) |
| Send | Always visible icon button | Enabled only when text or attachments exist; accent color when active, ghost otherwise |
| Toolbar | None | Bottom row with Attach, Video, Emoji icon buttons |
| Keyboard | No shortcut | `Cmd+Enter` to send (show `Kbd` hint in `Tooltip`) |
| Attachments | Not supported | `Chip` pills above the input, removable |
| Reply | Not supported | Preview bar above the input, dismissible |

### New Component: `ComposerToolbar.tsx`

Separate the toolbar buttons (attach, video, emoji) into their own component for clean decomposition.

---

## Part 4 — New Component Inventory

| Component | Status | Files |
|:---|:---|:---|
| `MessagesTab.tsx` | Modify | Orchestrator — add ScrollShadow, scroll-to-bottom |
| `MessageBubble.tsx` | Modify | Grouped design, directional radius, hover actions, reactions |
| `MessageComposer.tsx` | Major rewrite | TextArea, toolbar, attachment chips, reply preview, mention trigger |
| `MessageReactions.tsx` | Delete or repurpose | Remove global reactions; move to per-message |
| `MessageAttachment.tsx` | **New** | Render file/image/video attachments inside bubbles |
| `MessageDateSeparator.tsx` | **New** | Centered date divider between day groups |
| `MessageActions.tsx` | **New** | Hover toolbar: reply, edit, delete, react |
| `MentionPopover.tsx` | **New** | @mention user search popover |
| `VideoRecorderModal.tsx` | **New** | Camera record modal |
| `VideoPlayer.tsx` | **New** | Inline video playback in bubbles |
| `ComposerToolbar.tsx` | **New** | Attach, video, emoji buttons row |
| `TypingIndicator.tsx` | **New** | Animated dots when someone is typing |
| `ScrollToBottomButton.tsx` | **New** | Floating button to jump to newest messages |

---

## Part 5 — Data Model Evolution

### Updated `Message` Interface

```ts
export interface User {
    id: string;
    name: string;
    avatar: string;
    status: "online" | "away" | "offline";
}

export interface Attachment {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    thumbnailUrl?: string;
    downloadUrl: string;
}

export interface Reaction {
    emoji: string;       // "👍", "❤️", etc.
    count: number;
    userIds: string[];
    hasReacted: boolean; // current user reacted
}

export interface Mention {
    userId: string;
    displayName: string;
}

export interface Message {
    id: string;
    user: User;
    text: string;
    time: string;                              // ISO string for proper formatting
    isCurrentUser: boolean;
    attachments: Attachment[];
    reactions: Reaction[];
    mentions: Mention[];
    status: "sending" | "sent" | "delivered" | "read";
    replyTo?: {
        messageId: string;
        text: string;
        userName: string;
    };
    isEdited: boolean;
    isDeleted: boolean;
}
```

---

## Part 6 — Implementation Priority

### Phase A — Visual Polish (No new features)

| # | Task | Effort |
|:---|:---|:---|
| A1 | ScrollShadow on message list + scroll-to-bottom button | Small |
| A2 | Message grouping + date separators | Medium |
| A3 | Premium bubble design (gradients, directional radius, hover states) | Small |
| A4 | Typing indicator (mocked) | Small |
| A5 | Move "Public Channel" chip to header, remove global reactions bar | Small |
| A6 | Read receipts + delivery status icons | Small |
| A7 | Online presence dots on avatars | Small |

### Phase B — Core Features

| # | Task | Effort |
|:---|:---|:---|
| B1 | Composer rewrite: TextArea + auto-grow + Cmd+Enter | Medium |
| B2 | File attachments: upload button + chips + `MessageAttachment` | Medium |
| B3 | Per-message reactions: emoji picker + reaction pills | Medium |
| B4 | Message hover actions: reply, edit, delete | Medium |
| B5 | Threaded replies: reply preview + `replyTo` field | Medium |

### Phase C — Advanced Features

| # | Task | Effort |
|:---|:---|:---|
| C1 | @Mentions: popover + inline rendering | Large |
| C2 | Video messages: recorder modal + inline player | Large |
| C3 | Emoji picker integration (lightweight library) | Medium |

---

## Part 7 — Reference: Best-in-class SaaS Chat

| Product | Standout Feature |
|:---|:---|
| **Intercom** | Grouped messages, rich media, typing indicator, read receipts |
| **Linear** | Threaded comments, mention autocomplete, minimal but polished UI |
| **Notion** | Inline page mentions, rich blocks inside comments |
| **Slack** | Emoji reactions per message, threaded replies, file preview |
| **Height** | Contextual reactions, inline attachments, activity timeline |

The target is to combine:

- **Intercom's** polish (grouping, typing, receipts)
- **Slack's** feature set (reactions, threads, files)
- **Linear's** minimalism (clean, fast, keyboard-first)
