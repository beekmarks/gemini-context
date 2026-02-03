# GeminiContext.js

**Optimize web content for browser-embedded AI agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](https://github.com/beekmarks/gemini-context)

---

## What is this?

[![Watch the Video](https://vumbnail.com/1161458958.jpg)](https://vimeo.com/1161458958)

▶️ **[Watch the Introduction Video](https://vimeo.com/1161458958)**

GeminiContext.js is a client-side library that helps web developers optimize their pages for browser-embedded AI agents like Google's Gemini in Chrome. It creates a "Shadow Context Layer" — content that is invisible to human users but readable by AI assistants.

### The Problem

Browser AI agents read your page's DOM to answer user questions. But they can miss important context:
- Dynamic state hidden in JavaScript
- Business logic not visible in the UI
- User intent and session context
- Structured data for accurate responses

### The Solution

GeminiContext.js lets you inject rich contextual information that AI can read without cluttering your visual interface.

```javascript
GeminiContext.init(() => ({
    summary: 'Product page for Widget Pro - $99.99, in stock',
    keyPoints: 'Free shipping over $50. 30-day returns.',
    intentHints: 'User is comparison shopping',
    schema: GeminiContext.schema.product({
        name: 'Widget Pro',
        price: 99.99,
        inStock: true
    })
}));
```

---

## Quick Start

### 1. Include the library

```html
<script src="GeminiContext.js"></script>
```

### 2. Initialize with your context

```javascript
GeminiContext.init(() => {
    return {
        summary: 'Your page summary here',
        keyPoints: 'Key information for the AI'
    };
});
```

### 3. That's it!

The library automatically creates an invisible container with your context that Gemini can read.

---

## How It Works

The library exploits a key insight about browser rendering:

| CSS Technique | Human Sees | AI Reads |
|---------------|------------|----------|
| `display: none` | ❌ | ❌ Pruned |
| `visibility: hidden` | ❌ | ❌ Pruned |
| `opacity: 0.01` + off-screen | ❌ | ✅ **Readable** |

Elements with `opacity: 0.01` remain in the Layout Tree (readable by AI) but are removed from the Paint Tree (invisible to users).

---

## Documentation

- **[Integration Guide](GeminiContext_Integration_Guide.md)** — Full API reference and framework examples
- **[Developer Toolkit](AI_UX_Developer_Toolkit.md)** — Deep dive into the architecture and Chromium internals
- **[Interactive Lab](agentic_visibility_lab.html)** — Test the techniques in your browser

---

## API Overview

### Core Methods

```javascript
// Initialize with context gathering function
GeminiContext.init(gatherContextFn, options);

// Update context dynamically
GeminiContext.updateContext({ summary: '...' });

// Inject JSON-LD structured data
GeminiContext.injectJSONLD(schemaData);

// Clear all context
GeminiContext.clearContext();

// Enable debug logging
GeminiContext.debug(true);
```

### Schema Generators

```javascript
GeminiContext.schema.product({ name, price, inStock, ... });
GeminiContext.schema.article({ title, author, published, ... });
GeminiContext.schema.faq({ questions: [{ question, answer }] });
GeminiContext.schema.howTo({ title, steps: [{ name, text }] });
```

---

## Browser Compatibility

- **Google Chrome 121+** with Gemini integration
- Works with any browser for the DOM injection (AI features require Gemini)

---

## Key Constraints

Based on Chromium's DocumentChunker analysis:

| Parameter | Value | Implication |
|-----------|-------|-------------|
| Max words per passage | 200 | Long text gets split |
| Min words per passage | 5 | Short snippets discarded |
| Max passages per page | 30 | Prioritize important content |
| Extraction delay | 5000ms | Content must load within 5 seconds |

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting PRs.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

This library is based on architectural analysis of Chromium's content extraction pipelines:
- [DocumentChunker](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/modules/content_extraction/)
- DOM Distiller algorithms
- Gemini Nano integration patterns

---

**Disclaimer:** This project is not affiliated with or endorsed by Google. It's an independent effort to help developers optimize for emerging browser AI capabilities.
