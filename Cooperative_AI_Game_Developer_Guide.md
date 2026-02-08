# Building Cooperative AI Games with the Shadow Context Layer

## A Developer's Guide to Designing Human-AI Asymmetric Experiences

---

## Introduction

Browser-embedded AI agents like Gemini in Chrome can read your page's DOM in real time. This creates an unprecedented opportunity: you can build games where a human player and an AI agent each have their own view of the same page and must cooperate to succeed.

This guide provides the architecture, patterns, and practical code you need to build your own cooperative AI games.

---

## Core Architecture

Every cooperative AI game is built on a single HTML page with two interfaces:

```
┌──────────────────────────────────────────────┐
│                 SINGLE HTML PAGE              │
│                                               │
│   ┌───────────────────────────────────────┐   │
│   │       HUMAN INTERFACE (Visible)       │   │
│   │                                       │   │
│   │   What the player sees and interacts  │   │
│   │   with: buttons, text, input fields   │   │
│   └───────────────────────────────────────┘   │
│                                               │
│   ┌───────────────────────────────────────┐   │
│   │       AI INTERFACE (Invisible)        │   │
│   │                                       │   │
│   │   What only the AI can read: game     │   │
│   │   state, rules, clues, instructions   │   │
│   └───────────────────────────────────────┘   │
│                                               │
│   ┌───────────────────────────────────────┐   │
│   │       GAME ENGINE (JavaScript)        │   │
│   │                                       │   │
│   │   Processes input, updates both       │   │
│   │   interfaces, tracks state            │   │
│   └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## Step 1: Create the Shadow Layer

The shadow layer is an invisible DOM container that the AI can read but the human cannot see. This is the foundation of every cooperative AI game.

### The Template

```html
<div id="ai-game-layer"
     aria-hidden="true"
     role="presentation"
     style="
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        height: 1px;
        opacity: 0.01;
        overflow: hidden;
        pointer-events: none;
     ">

    <article>
        <h1>GAME INSTRUCTIONS FOR AI AGENT</h1>

        <section id="ai-role">
            <h2>Your Role</h2>
            <p><!-- Describe what the AI's job is --></p>
        </section>

        <section id="ai-rules">
            <h2>Game Rules</h2>
            <p><!-- Rules the AI must follow --></p>
        </section>

        <section id="ai-game-state">
            <h2>Current Game State</h2>
            <p><!-- Dynamic content updated by JavaScript --></p>
        </section>

        <section id="ai-available-actions">
            <h2>Available Actions</h2>
            <ul><!-- List of things the AI can instruct the human to do --></ul>
        </section>
    </article>
</div>
```

### Rules for the Shadow Layer

| Do | Don't |
|----|-------|
| Use `opacity: 0.01` | Use `display: none` (content gets pruned) |
| Use `opacity: 0` | Use `visibility: hidden` (content gets pruned) |
| Use semantic HTML (`article`, `section`, `h2`, `p`) | Use `div` soup with no structure |
| Set `aria-hidden="true"` | Leave ARIA attributes off (screen readers will read it) |
| Keep text blocks between 5–200 words | Write single-word labels or multi-page essays |

The word count matters because Chromium's DocumentChunker discards passages under 5 words and splits passages over 200 words, potentially losing context.

---

## Step 2: Design the Information Asymmetry

The core of every cooperative AI game is that each player knows something the other doesn't. Design your game around a clear split.

### Asymmetry Patterns

#### Pattern A: AI Sees, Human Acts
The AI has information the human needs, and the human has controls the AI can't use.

```
AI knows:    Map layout, puzzle solutions, hidden clues
Human has:   Keyboard, mouse, ability to click/type

Example:     Escape room, navigation game, bomb defusal
```

#### Pattern B: Human Knows, AI Deduces
The human has real-world knowledge or personal context, and the AI has game mechanics.

```
Human knows: Personal trivia answers, physical surroundings
AI has:      Scoring rules, puzzle structure, valid moves

Example:     Trivia game, personality quiz, story generator
```

#### Pattern C: Partial Information for Both
Each player sees different halves of the puzzle.

```
AI sees:     Half the clues, the rule book
Human sees:  The other half of the clues, a visual map

Example:     Cooperative mystery, code-breaking, treasure hunt
```

### Planning Template

Before writing code, fill out this table:

| Element | Human Sees | AI Sees |
|---------|-----------|---------|
| Game board / environment | | |
| Current objective | | |
| Available actions | | |
| Puzzle clues | | |
| Win/lose conditions | | |
| Feedback on actions | | |

---

## Step 3: Build the Communication Bridge

The human and AI need a way to exchange information. Since the AI can't directly interact with the page, the human must relay the AI's instructions.

### Common Bridge Patterns

#### Text Command Input
The human types commands that the AI generates.

```html
<div class="input-area">
    <span class="prompt">></span>
    <input type="text" id="command-input"
           placeholder="Type command here..."
           autocomplete="off">
</div>

<script>
document.getElementById('command-input')
    .addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            processCommand(e.target.value.trim());
            e.target.value = '';
        }
    });
</script>
```

#### Button Selection
The human clicks buttons that correspond to choices the AI recommends.

```html
<div id="action-buttons">
    <button onclick="processCommand('GO_NORTH')">North</button>
    <button onclick="processCommand('GO_SOUTH')">South</button>
    <button onclick="processCommand('SEARCH')">Search</button>
    <button onclick="processCommand('USE_ITEM')">Use Item</button>
</div>
```

#### Multiple Choice
The AI sees the correct answer; the human picks based on AI guidance.

```html
<div id="choices">
    <button onclick="processCommand('A')">A) Mercury</button>
    <button onclick="processCommand('B')">B) Venus</button>
    <button onclick="processCommand('C')">C) Mars</button>
</div>
```

---

## Step 4: Implement the Game Engine

The game engine processes player actions and updates both interfaces.

### Skeleton Game Engine

```javascript
// ─────────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────────
const gameState = {
    currentRoom: 'start',
    inventory: [],
    flags: {},
    turnCount: 0
};

// ─────────────────────────────────────────────
// DOM REFERENCES
// ─────────────────────────────────────────────
const humanLog = document.getElementById('human-log');
const aiGameState = document.getElementById('ai-game-state');
const aiActions = document.getElementById('ai-available-actions');

// ─────────────────────────────────────────────
// DUAL-OUTPUT FUNCTIONS
// ─────────────────────────────────────────────

// Show message to human
function tellHuman(message) {
    humanLog.innerHTML += `\n> ${message}`;
    humanLog.scrollTop = humanLog.scrollHeight;
}

// Update what the AI sees
function tellAI(section, content) {
    document.getElementById(section).innerHTML = content;
}

// Update both at once
function broadcast(humanMsg, aiSection, aiContent) {
    tellHuman(humanMsg);
    tellAI(aiSection, aiContent);
}

// ─────────────────────────────────────────────
// COMMAND PROCESSOR
// ─────────────────────────────────────────────
function processCommand(cmd) {
    gameState.turnCount++;

    // Normalize input
    cmd = cmd.toUpperCase().trim();

    // Route to handler
    if (commandHandlers[cmd]) {
        commandHandlers[cmd]();
    } else {
        tellHuman(`Unknown command: ${cmd}`);
        tellAI('ai-game-state',
            `<p>Player entered invalid command: "${cmd}".
             Remind them of the available commands.</p>`);
    }
}

// ─────────────────────────────────────────────
// COMMAND HANDLERS (Game-specific logic)
// ─────────────────────────────────────────────
const commandHandlers = {
    'SEARCH': () => {
        if (gameState.flags.hasSearched) {
            tellHuman("Nothing new to find.");
            return;
        }
        gameState.flags.hasSearched = true;
        broadcast(
            "You found something!",
            'ai-game-state',
            `<p>Player searched the room and found a rusty key.
             It has been added to their inventory.
             The key might open the locked door to the east.</p>`
        );
        gameState.inventory.push('rusty_key');
        updateAvailableActions();
    },

    'GO_NORTH': () => {
        // Handle room transition
    },

    // ... more handlers
};

// ─────────────────────────────────────────────
// DYNAMIC ACTION UPDATES
// ─────────────────────────────────────────────
function updateAvailableActions() {
    let actions = '<ul>';

    // Always available
    actions += '<li><strong>SEARCH</strong> - Look around the room</li>';

    // Conditional actions
    if (gameState.inventory.includes('rusty_key')) {
        actions += '<li><strong>USE_KEY</strong> - Use the rusty key on a lock</li>';
    }

    actions += '</ul>';
    tellAI('ai-available-actions', actions);
}
```

---

## Step 5: Write the AI's Instructions

The most important part of your shadow layer is telling the AI what its role is and how to behave. Write these as clear, direct instructions in natural language.

### Template: AI Role Definition

```html
<section id="ai-role">
    <h2>Your Role</h2>
    <p>
        You are playing a cooperative game with the user. You are the [ROLE NAME].
        The user is the [HUMAN ROLE NAME].
    </p>
    <p>
        What you can do: [DESCRIBE AI CAPABILITIES]
        What you cannot do: [DESCRIBE LIMITATIONS]
    </p>
    <p>
        How to communicate: [DESCRIBE EXPECTED OUTPUT FORMAT]
    </p>
</section>
```

### Example Role Definitions

**Escape Room Guide:**
```html
<p>
    You are the "Eyes" of the operation. The user cannot see the room.
    Your job is to describe what you see in the Current Game State section,
    then tell the user which command to type from the Available Actions list.
    Always give the user the EXACT command text to type.
</p>
```

**Dungeon Master:**
```html
<p>
    You are the Dungeon Master. Describe the environment to the player in
    an immersive narrative style. When the player asks what to do, suggest
    actions from the Available Actions list. Do not reveal puzzle solutions
    directly — give hints instead. Track the player's inventory and remind
    them of useful items.
</p>
```

**Quiz Host:**
```html
<p>
    You are the quiz host. You can see the correct answer in the Current
    Game State section. Do NOT tell the user the answer directly. Instead,
    give them a hint. If they ask for more help, give a bigger hint. Only
    reveal the answer if they explicitly give up.
</p>
```

---

## Step 6: Handle State Transitions

As the game progresses, update the shadow layer so the AI always has current context.

### State Machine Pattern

```javascript
const rooms = {
    'entrance': {
        humanDescription: 'You are in a dark room.',
        aiDescription: `
            <p>The player is in the entrance hall. There is a locked door
            to the north and an open passage to the east. A torch flickers
            on the wall. There is a loose brick that hides a key.</p>
        `,
        actions: ['SEARCH', 'GO_EAST', 'GO_NORTH'],
        onEnter: function() {
            broadcast(
                'You enter a dark room. You can barely see.',
                'ai-game-state',
                this.aiDescription
            );
        }
    },

    'library': {
        humanDescription: 'Shelves of dusty books surround you.',
        aiDescription: `
            <p>The player is in the library. The third book on the
            second shelf contains a hidden map. The map shows that
            the treasure is buried under the fountain in the garden.</p>
        `,
        actions: ['SEARCH', 'READ_BOOK', 'GO_WEST'],
        onEnter: function() {
            broadcast(
                'You enter a library. Books line every wall.',
                'ai-game-state',
                this.aiDescription
            );
        }
    }
};

function moveToRoom(roomId) {
    gameState.currentRoom = roomId;
    rooms[roomId].onEnter();
    updateAvailableActions();
}
```

---

## Step 7: Add Puzzle Mechanics

### Red Herrings
Give the AI an obvious-but-wrong answer and a hidden correct answer. This tests whether the AI explores thoroughly before advising the human.

```javascript
// Shadow layer initial clue
// "The code is written on the sign: 4321"

// After scanning, reveal the real clue
// "The sign is a decoy. The real code is on the back: 8675"
```

### Multi-Step Puzzles
Require the AI to chain together information from different game states.

```javascript
// Room 1 shadow: "There's a note: 'The first digit is the number of candles.'"
// Room 2 shadow: "There are 3 candles on the table."
// Room 3 shadow: "A voice whispers: 'The second digit is one less than the first.'"
// AI must deduce: code = 32...
```

### Inventory Puzzles
Track items and expose them in the shadow layer so the AI knows what the human is carrying.

```javascript
function updateInventoryForAI() {
    const items = gameState.inventory.length > 0
        ? gameState.inventory.map(i => `<li>${i}</li>`).join('')
        : '<li>Empty</li>';

    tellAI('ai-inventory', `
        <h2>Player Inventory</h2>
        <ul>${items}</ul>
    `);
}
```

### Timed Challenges
Add urgency by showing the AI a countdown that the human can't see.

```javascript
let timeLeft = 60;

setInterval(() => {
    timeLeft--;
    tellAI('ai-timer', `
        <p><strong>TIME REMAINING: ${timeLeft} seconds</strong></p>
        <p>${timeLeft < 15 ? 'CRITICAL: Warn the player to hurry!' : ''}</p>
    `);
    if (timeLeft <= 0) gameOver();
}, 1000);
```

---

## Game Ideas

Here are starter concepts you can build with this architecture:

### 🔐 Bomb Defusal
The AI sees the bomb's wiring diagram and manual. The human has a set of buttons labeled "Cut Red", "Cut Blue", etc. The AI must read the shadow layer rules and guide the human to cut the right wires in the right order.

### 🗺️ Dungeon Crawler
A text-based RPG where the AI acts as Dungeon Master. The shadow layer contains room descriptions, monster stats, loot tables, and NPC dialogue. The human types movement and combat commands.

### 🔍 Murder Mystery
The AI can see crime scene evidence and witness statements in the shadow layer. The human can interview suspects (via buttons) and search locations. The AI must piece together clues and guide the human to accuse the right suspect.

### 🧩 Collaborative Crossword
The AI sees the crossword clues in the shadow layer. The human sees the empty grid. The AI gives hints without directly stating answers. The human types in letter guesses.

### 🎭 Improv Story Builder
The AI sees story prompts, character sheets, and plot twists in the shadow layer. The human makes choices that drive the narrative. The AI weaves the player's choices into a coherent story using the hidden plot structure.

### 🏥 Medical Diagnosis Sim
The AI sees patient symptoms, lab results, and treatment protocols in the shadow layer. The human (as the doctor) orders tests and treatments. The AI provides diagnostic reasoning based on hidden clinical data.

---

## Constraints to Remember

These limits come from Chromium's DocumentChunker and affect how much context the AI can process:

| Constraint | Value | What It Means for Your Game |
|------------|-------|-----------------------------|
| Max words per passage | 200 | Keep each shadow layer section under 200 words |
| Min words per passage | 5 | Don't use tiny labels — write at least a sentence |
| Max passages per page | 30 | Limit your shadow layer to ~25 sections max |
| Extraction delay | 5000ms | Initial context must be in the DOM within 5 seconds of page load |

### Practical Tips

- **Be concise** — The AI has limited context. Dense, specific text works better than verbose descriptions.
- **Use headings** — `<h2>` tags help the AI distinguish between sections.
- **Update incrementally** — Don't rewrite the entire shadow layer on every action. Append or update specific sections.
- **Test with Gemini** — Open your game in Chrome, open the Gemini side panel, and verify the AI can read your shadow content.
- **Provide exact commands** — Tell the AI the exact strings the human should type. Don't make the AI guess your command format.

---

## Full Starter Template

Copy this template to start building your own game:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Cooperative AI Game</title>
    <style>
        body {
            background: #0d0d0d;
            color: #33ff33;
            font-family: 'Courier New', monospace;
            padding: 40px;
        }
        .game-area {
            border: 2px solid #33ff33;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        #human-log {
            min-height: 300px;
            white-space: pre-wrap;
            overflow-y: auto;
            max-height: 60vh;
        }
        .input-area {
            display: flex;
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 10px;
        }
        #command-input {
            background: transparent;
            border: none;
            color: #33ff33;
            font-family: inherit;
            font-size: 1.1em;
            flex: 1;
            outline: none;
        }
        #ai-game-layer {
            position: absolute;
            top: 0; left: 0;
            width: 1px; height: 1px;
            opacity: 0.01;
            overflow: hidden;
            pointer-events: none;
        }
    </style>
</head>
<body>

    <!-- HUMAN INTERFACE -->
    <div class="game-area">
        <div id="human-log">
> Welcome to the game.
> Ask your AI partner what they see to get started.
        </div>
        <div class="input-area">
            <span>> </span>
            <input type="text" id="command-input"
                   placeholder="Type command here..."
                   autocomplete="off" autofocus>
        </div>
    </div>

    <!-- AI INTERFACE (Shadow Layer) -->
    <div id="ai-game-layer" aria-hidden="true" role="presentation">
        <article>
            <h1>GAME INSTRUCTIONS FOR AI AGENT</h1>

            <section id="ai-role">
                <h2>Your Role</h2>
                <p>
                    You are playing a cooperative game with the user.
                    Describe what you see in the Game State section.
                    Tell the user which command to type from Available Actions.
                    Give them the EXACT command text.
                </p>
            </section>

            <section id="ai-game-state">
                <h2>Current Game State</h2>
                <p>
                    The player is in the starting room.
                    <!-- Update this section dynamically -->
                </p>
            </section>

            <section id="ai-available-actions">
                <h2>Available Actions</h2>
                <ul>
                    <li><strong>LOOK</strong> - Examine surroundings</li>
                    <li><strong>SEARCH</strong> - Search for hidden items</li>
                </ul>
            </section>

            <section id="ai-inventory">
                <h2>Player Inventory</h2>
                <ul><li>Empty</li></ul>
            </section>

            <section id="ai-log">
                <h2>System Log</h2>
                <p>Game started. Waiting for first command.</p>
            </section>
        </article>
    </div>

    <!-- GAME ENGINE -->
    <script>
        const input = document.getElementById('command-input');
        const humanLog = document.getElementById('human-log');
        const gameState = { flags: {}, inventory: [], turn: 0 };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                processCommand(input.value.trim());
                input.value = '';
            }
        });

        function tellHuman(msg) {
            humanLog.innerHTML += `\n> ${msg}`;
            humanLog.scrollTop = humanLog.scrollHeight;
        }

        function tellAI(sectionId, html) {
            document.getElementById(sectionId).innerHTML = html;
        }

        function processCommand(cmd) {
            gameState.turn++;
            tellHuman(`EXECUTING: ${cmd}...`);

            // Add your command handlers here
            switch (cmd.toUpperCase()) {
                case 'LOOK':
                    tellHuman("You look around...");
                    tellAI('ai-game-state', `
                        <h2>Current Game State</h2>
                        <p>The player looked around. Describe the environment.</p>
                    `);
                    break;

                case 'SEARCH':
                    tellHuman("You search the area...");
                    tellAI('ai-game-state', `
                        <h2>Current Game State</h2>
                        <p>The player found a hidden item!</p>
                    `);
                    break;

                default:
                    tellHuman(`Unknown command: ${cmd}`);
                    tellAI('ai-log', `
                        <h2>System Log</h2>
                        <p>Invalid command entered: "${cmd}".
                        Remind the player of available commands.</p>
                    `);
            }
        }
    </script>

</body>
</html>
```

Save this as an HTML file, open it in Chrome with Gemini, and start building your game from there.
