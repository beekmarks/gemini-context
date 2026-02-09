# What's New

All notable updates to the **gemini-context** repository, in reverse chronological order.

---

## February 9, 2026

### 🔐 The Invisible Vault — Cooperative AI Escape Room

A fully playable demo game has been added that showcases the Shadow Context Layer in action. A human player and Google's Gemini AI work together in real time to solve puzzles and unlock a sealed vault.

**Play it live:** [ungodly.fun/gemini-games](https://www.ungodly.fun/gemini-games/) *(requires Chrome with Gemini)*

**Source:** [`turing_vault_final.html`](turing_vault_final.html)

#### How It Works

- **The human** sees a retro terminal interface and can type commands — but can't see the room.
- **The AI** reads the room layout, clues, and a mission manual through a hidden shadow layer — but can't type.
- Players must cooperate: Gemini reads the invisible context, generates command codes, and the human pastes them into the terminal.

#### Game Features

- **Red-herring puzzle** — A sticky note says "1969" (Apollo 11), but scanning the room reveals a hidden document with the real code: "1989" (fall of the Berlin Wall).
- **Multi-step solution path** — Players must SCAN → READ → UNLOCK in sequence, with the shadow layer updating dynamically after each action.
- **Dual-interface architecture** — The visible terminal and the invisible AI layer both update in response to every command, keeping both players in sync.

---

###  Cooperative AI Game Developer Guide

A comprehensive guide for developers who want to build their own cooperative human-AI games using the Shadow Context Layer technique.

**File:** [`Cooperative_AI_Game_Developer_Guide.md`](Cooperative_AI_Game_Developer_Guide.md)

**What it covers:**

- Shadow Context Layer architecture and why `opacity: 0.01` works
- Three asymmetry patterns: Blind Operator, Divided Knowledge, Time-Shifted Intel
- Skeleton game engine with dual-output command processing
- AI role definition templates for consistent behavior
- Puzzle mechanics — red herrings, multi-step chains, inventory gates, timed sequences
- Six game ideas with difficulty ratings and shadow layer designs
- A complete HTML starter template ready to customize

---

### 🔍 Invisible Vault Technical Breakdown

A detailed technical document explaining *how* and *why* The Invisible Vault works, aimed at developers who want to understand the underlying techniques.

**File:** [`Invisible_Vault_Technical_Breakdown.md`](Invisible_Vault_Technical_Breakdown.md)

**What it covers:**

- CSS visibility and the Layout Tree vs. Paint Tree distinction
- How `display: none` and `visibility: hidden` are pruned by Chromium's DocumentChunker while `opacity: 0.01` is not
- The conversation flow between human, terminal, shadow layer, and Gemini
- Command system breakdown (SCAN, READ, UNLOCK)
- Red-herring puzzle design and misdirection technique
- Five key techniques demonstrated: Shadow Context, Dynamic Context Updates, Asymmetric Information, Progressive Disclosure, State Synchronization

---

### 📝 README Updates

- Added **The Invisible Vault** section with a direct play link and description of the cooperative gameplay
- Added **Cooperative AI Game Developer Guide** and **Invisible Vault Technical Breakdown** to the Documentation section
- Added **introduction video** embed with Vimeo thumbnail

---

## February 3, 2026

### 🎬 Introduction Video

An introduction video was embedded in the README with a clickable Vimeo thumbnail.

**Watch:** [Introduction Video](https://vimeo.com/1161458958)

---

### 🚀 Initial Release — v2.0.0

The repository was published as open source with the complete GeminiContext.js library and supporting documentation.

#### Core Library

- **[`GeminiContext.js`](GeminiContext.js)** — Client-side library (v2.0.0) for optimizing web content for browser-embedded AI agents
- Shadow Context Layer technique using `opacity: 0.01` to keep content in the Layout Tree while invisible to users
- JSON-LD Schema.org structured data injection
- Schema generators for products, articles, FAQs, how-tos, financial products, web pages, and software applications
- SPA navigation handling via History API patching
- Dynamic context updates and debug mode
- UMD module pattern (works with CommonJS, AMD, and global `<script>` tags)

#### Documentation

- **[`GeminiContext_Integration_Guide.md`](GeminiContext_Integration_Guide.md)** — Full API reference with framework-specific examples (React, Vue, Angular, vanilla JS)
- **[`AI_UX_Developer_Toolkit.md`](AI_UX_Developer_Toolkit.md)** — Deep dive into Chromium internals, DocumentChunker constraints, and architectural rationale
- **[`agentic_visibility_lab.html`](agentic_visibility_lab.html)** — Interactive lab for testing shadow context techniques in the browser

#### Open Source Files

- MIT License, Contributing Guide, Code of Conduct
- GitHub issue templates (bug report, feature request, question)
- Pull request template
- Changelog, `.gitignore`, `package.json`
