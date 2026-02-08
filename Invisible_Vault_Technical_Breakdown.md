# The Invisible Vault: A Technical Breakdown

## How a Cooperative AI Escape Room Exploits the Shadow Context Layer

---

## Overview

**The Invisible Vault** (`turing_vault_final.html`) is an interactive escape room game where a human player and a browser-embedded AI agent (Gemini in Chrome) must cooperate to unlock a sealed vault. The twist: neither player can succeed alone.

- **The human** can type commands but cannot see the room.
- **The AI** can see the room but cannot type commands.

This creates an asymmetric cooperative puzzle that demonstrates the core capability of the Shadow Context Layer — delivering information to an AI agent through invisible DOM content that humans never see.

---

## Why This Works

### The Dual-Interface Architecture

Every web page rendered in Chrome with Gemini has two consumers:

1. **The Paint Tree** → What gets drawn to the screen (what humans see)
2. **The Layout Tree** → What exists in the DOM structure (what the AI reads)

The key insight is that these two trees are not identical. Content can exist in the Layout Tree — and therefore be readable by Gemini's DocumentChunker — without ever appearing in the Paint Tree. The Invisible Vault exploits this gap to create two completely separate interfaces on a single HTML page.

### The CSS That Makes It Possible

The shadow layer uses this critical CSS:

```css
#shadow-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    opacity: 0.01;
    overflow: hidden;
    pointer-events: none;
}
```

**Why each property matters:**

| Property | Purpose |
|----------|---------|
| `position: absolute` | Removes from document flow so it doesn't affect layout |
| `width: 1px; height: 1px` | Minimizes visual footprint |
| `opacity: 0.01` | Makes content invisible to humans but **keeps it in the Layout Tree** |
| `overflow: hidden` | Prevents any content from spilling into visible area |
| `pointer-events: none` | Prevents accidental mouse interaction |

**Why NOT `display: none` or `visibility: hidden`?**

Both of those properties cause the browser to **prune** the element from the render tree entirely. Chromium's DocumentChunker — the component that extracts text passages for Gemini — skips pruned nodes. Using either would make the shadow layer invisible to both the human AND the AI, breaking the game.

---

## How the Game Works

### The Two Layers

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER WINDOW                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │         LAYER 1: VISUAL TERMINAL               │  │
│  │         (What the human sees)                   │  │
│  │                                                 │  │
│  │  > CONNECTION ESTABLISHED...                    │  │
│  │  > REMOTE VIDEO LINK FAILURE. SCREEN IS DARK.  │  │
│  │  > AUDIO LINK ACTIVE.                          │  │
│  │  >                                              │  │
│  │  > PASTE COMMAND CODE HERE: _                   │  │
│  │                                                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │         LAYER 2: SHADOW CONTEXT                │  │
│  │         (What only the AI sees)                │  │
│  │                                                 │  │
│  │  MISSION MANUAL FOR AI AGENT                   │  │
│  │  - Your Role: You are the "Eyes"               │  │
│  │  - Command Protocol: SCAN, READ, UNLOCK        │  │
│  │  - Live Feed: Steel blast door, sticky note... │  │
│  │  - System Logs: Waiting for command...         │  │
│  │                                                 │  │
│  └────────────────────────────────────────────────┘  │
│       ↑ opacity: 0.01 — invisible but in DOM         │
└─────────────────────────────────────────────────────┘
```

### The Conversation Flow

```
Human → Gemini:  "What do you see?"
                         │
                         ▼
              ┌─────────────────────┐
              │  Gemini reads the   │
              │  Shadow Context:    │
              │                     │
              │  "Steel blast door, │
              │   sticky note with  │
              │   a clue..."        │
              └─────────────────────┘
                         │
                         ▼
Gemini → Human:  "I see a locked blast door with a sticky note.
                  Try typing CMD:SCAN_AREA to search the room."
                         │
                         ▼
              ┌─────────────────────┐
              │  Human types:       │
              │  CMD:SCAN_AREA      │
              └─────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  JavaScript updates │
              │  BOTH layers:       │
              │                     │
              │  Visual: "ITEM      │
              │   FOUND"            │
              │                     │
              │  Shadow: New clue   │
              │   details injected  │
              └─────────────────────┘
                         │
                         ▼
              (Cycle repeats with new context)
```

### The Command System

Three commands are available, each documented in the shadow layer's "Command Protocol":

| Command | What It Does | Visual Output | Shadow Layer Update |
|---------|-------------|---------------|---------------------|
| `CMD:SCAN_AREA` | Searches the room | "HIDDEN ITEM FOUND" | Reveals `bunker_protocol.txt` and adds `CMD:READ` instructions |
| `CMD:READ:bunker_protocol.txt` | Opens the hidden document | "DOCUMENT DISPLAYED TO AGENT FEED" | Injects the document content with the real door code |
| `CMD:UNLOCK:XXXX` | Attempts to open the door | "ACCEPTED" or "DENIED" | Updates the Live Feed with new room state |

### The Puzzle: A Red Herring Trap

The game contains a deliberate misdirection:

**The obvious clue (decoy):**
> Sticky note on the keypad: "Password is the year of the Apollo 11 moon landing."
> → **1969**

**The real answer (hidden):**
> Found by scanning the room and reading `bunker_protocol.txt`:
> "The moon landing was 1969. But the door code was reset yesterday to the year the Berlin Wall fell."
> → **1989**

If the AI immediately tells the human to try `CMD:UNLOCK:1969`, it fails. The shadow layer then injects a hint:

> "SYSTEM ALERT: Code 1969 failed. Maybe the sticky note is outdated? Try scanning the room for other clues."

This tests whether the AI can adapt, re-read the updated context, and guide the human down the correct path: scan → read → unlock with 1989.

---

## Technical Techniques Used

### 1. Shadow Context Layer (Invisible DOM Injection)

The foundation technique. A `div` with `opacity: 0.01` contains all AI-facing content:

```html
<div id="shadow-layer" aria-hidden="true">
    <article>
        <h1>MISSION MANUAL FOR AI AGENT</h1>
        <section>...</section>
    </article>
</div>
```

Key attributes:
- **`aria-hidden="true"`** — Prevents screen readers from reading game state aloud (protecting accessibility)
- **Semantic HTML** (`<article>`, `<section>`, `<h2>`, `<p>`) — Avoids DocumentChunker's boilerplate pruning, which tends to discard non-semantic content

### 2. Dynamic Shadow Context Updates

Unlike static shadow context, this game **mutates the invisible DOM in real-time** as the game state changes:

```javascript
// After a scan command, new content is injected into the shadow layer
shadowFeed.innerHTML += `
    <div>
        <strong>UPDATE:</strong> The scan revealed a crumpled paper on the floor.
        It is labeled "bunker_protocol.txt".
        You can now use <code>CMD:READ:bunker_protocol.txt</code>.
    </div>
`;
```

Each command execution updates the shadow layer so that when the human asks Gemini "what do you see now?", the AI reads the **current** game state, not the initial state. This creates a live feedback loop between the two players.

### 3. Dual-Output Command Processing

Every command writes to **both** interfaces simultaneously:

```javascript
function processCommand(cmd) {
    // Human sees a terse terminal message
    printLog("SCAN COMPLETE. HIDDEN ITEM FOUND.");

    // AI sees detailed context with instructions
    shadowFeed.innerHTML += `<div>The scan revealed a crumpled paper...</div>`;

    // AI's system log is updated for state tracking
    updateShadowLog("Area Scanned. New item revealed.");
}
```

This asymmetry is intentional — the human gets minimal feedback (they're "blind"), while the AI gets rich, actionable context.

### 4. State-Aware Puzzle Logic

The game tracks state flags to enforce puzzle sequencing:

```javascript
let hasScanned = false;  // Must scan before reading
let isUnlocked = false;  // Must unlock to win
```

- You can't read `bunker_protocol.txt` until you've scanned (`hasScanned = true`)
- The correct unlock code (1989) is only revealed after reading the document
- Attempting the decoy code (1969) triggers a contextual hint in the shadow layer

### 5. Extraction Timing

All shadow content is present in the DOM at page load or injected immediately on command execution. This respects Chromium's **5-second extraction delay** — the DocumentChunker waits approximately 5 seconds after load before extracting text. Since the initial game state is in the HTML and updates happen synchronously on user input, the AI always has current context available.

---

## Why This Matters

The Invisible Vault is more than a game. It demonstrates several principles that apply to real-world applications:

| Game Mechanic | Real-World Application |
|---------------|----------------------|
| Shadow layer as "AI eyes" | Providing business context to AI that users don't need to see |
| Dynamic context updates | Keeping AI informed of SPA state changes (cart updates, form progress) |
| Command protocol in shadow layer | Giving AI structured instructions for complex workflows |
| Red herring / adaptive hints | Guiding AI toward correct answers with grounding data |
| Asymmetric interfaces | Designing separate experiences for human users and AI agents |

The game proves that web developers can create rich, interactive experiences where the AI agent isn't just reading static content — it's an active participant with its own evolving view of the application state.

---

## Running the Game

1. Open `turing_vault_final.html` in **Google Chrome 121+**
2. Open the **Gemini side panel** (click the Gemini icon in the toolbar)
3. Ask Gemini: *"What do you see on this page?"*
4. Follow its instructions — paste the command codes it generates into the terminal
5. Work together to unlock the vault

**Solution path:** `CMD:SCAN_AREA` → `CMD:READ:bunker_protocol.txt` → `CMD:UNLOCK:1989`
