# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-03

### Added
- Full library implementation with UMD module support
- Shadow Context Layer for invisible AI-readable content
- JSON-LD injection for structured data grounding
- Schema generators for common content types:
  - Product
  - Article
  - FAQ
  - HowTo
  - FinancialProduct
  - WebPage
  - SoftwareApplication
- SPA navigation handling (History API patching)
- Debug mode with console logging
- Comprehensive documentation
- Interactive Agentic Visibility Lab for testing
- Text sanitization and word count enforcement

### Technical Details
- Based on Chromium DocumentChunker analysis
- Respects 200 word max per passage
- Respects 5 word minimum threshold
- Respects 30 passage max limit
- Accounts for 5-second extraction delay

## [1.0.0] - 2026-01-15

### Added
- Initial proof of concept
- Basic Shadow Context injection
- Simple JSON-LD support

---

## Upgrade Guide

### From 1.x to 2.0

The 2.0 release includes breaking changes:

```javascript
// Old (1.x)
GeminiContext.inject({ text: 'Your context' });

// New (2.0)
GeminiContext.init(() => ({
    summary: 'Your context',
    keyPoints: 'Additional info'
}));
```

Key differences:
- `inject()` replaced with `init()` which takes a function
- Context data structure changed to use `summary`, `keyPoints`, `intentHints`
- Schema generators now available via `GeminiContext.schema.*`
