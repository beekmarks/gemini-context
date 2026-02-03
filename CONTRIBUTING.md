# Contributing to GeminiContext.js

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** — Search the issue tracker to see if it's already reported
2. **Create a detailed report** including:
   - Browser version (Chrome version number)
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or console logs if applicable

### Suggesting Features

1. **Open a discussion** before implementing major features
2. **Describe the use case** — What problem does it solve?
3. **Consider backward compatibility** — Will it break existing implementations?

### Submitting Code

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/your-feature`)
3. **Make your changes**
4. **Test thoroughly** — Use the Agentic Visibility Lab
5. **Submit a pull request**

## Code Style Guidelines

### JavaScript

- Use `'use strict';` in all modules
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add JSDoc comments for public functions
- Keep functions small and focused

```javascript
/**
 * Description of what the function does
 * @param {string} param - Description of parameter
 * @returns {Object} Description of return value
 */
function exampleFunction(param) {
    // Implementation
}
```

### CSS (Shadow Context Layer)

- Always use `opacity: 0.01` (not `display: none`)
- Include `pointer-events: none` for safety
- Use `aria-hidden="true"` for accessibility

### Documentation

- Update relevant docs when changing functionality
- Use clear, concise language
- Include code examples where helpful

## Testing

### Manual Testing

1. Open `agentic_visibility_lab.html` in Chrome 121+
2. Open Gemini side panel
3. Run through all 6 experiments
4. Verify expected results

### Testing Checklist

- [ ] Shadow Context is invisible to users
- [ ] Shadow Context is readable by Gemini
- [ ] JSON-LD is properly injected
- [ ] SPA navigation updates context
- [ ] No console errors
- [ ] Works with debug mode enabled

## Pull Request Process

1. **Update documentation** if you've changed APIs
2. **Add yourself to contributors** (optional)
3. **Write a clear PR description** explaining:
   - What changes were made
   - Why they were needed
   - How they were tested
4. **Wait for review** — Maintainers will respond within a few days

## Development Setup

```bash
# Clone your fork
git clone https://github.com/beekmarks/gemini-context.git
cd gemini-context

# No build process required - it's vanilla JS
# Just open files in your browser or editor

# To test, open agentic_visibility_lab.html in Chrome
```

## Questions?

- Open a GitHub Discussion for general questions
- Tag issues with appropriate labels
- Be patient and respectful

## Recognition

Contributors will be recognized in:
- The README acknowledgments section
- Release notes for significant contributions

Thank you for helping make GeminiContext.js better! 🚀
