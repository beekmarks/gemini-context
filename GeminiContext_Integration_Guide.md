# GeminiContext.js Integration Guide

## Developer Reference for Agentic Visibility Implementation

**Library Version:** 2.0.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Installation](#1-installation)
2. [Quick Start](#2-quick-start)
3. [API Reference](#3-api-reference)
4. [Schema Generators](#4-schema-generators)
5. [Framework Integration](#5-framework-integration)
6. [Advanced Patterns](#6-advanced-patterns)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Installation

### Option A: Script Tag (Simplest)

Add the script to your HTML file before your application code:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Application</title>
</head>
<body>
    <!-- Your page content -->
    
    <!-- Include GeminiContext.js -->
    <script src="/path/to/GeminiContext.js"></script>
    
    <!-- Your application code -->
    <script>
        // GeminiContext is now available globally
        GeminiContext.init(() => ({
            summary: 'My page summary'
        }));
    </script>
</body>
</html>
```

### Option B: ES Modules

```html
<script type="module">
    import GeminiContext from '/path/to/GeminiContext.js';
    
    GeminiContext.init(() => ({
        summary: 'My page summary'
    }));
</script>
```

### Option C: CommonJS (Node.js/Bundlers)

```javascript
const GeminiContext = require('./GeminiContext.js');

// Or with ES6 import syntax in bundlers
import GeminiContext from './GeminiContext.js';
```

### Option D: Copy to Your Project

1. Download `GeminiContext.js`
2. Place it in your project's scripts/vendor folder
3. Include via your preferred method above

---

## 2. Quick Start

### Minimal Setup

```javascript
// Initialize with a context gathering function
GeminiContext.init(() => {
    return {
        summary: 'This page displays product information.',
        keyPoints: 'Product: Widget Pro. Price: $99.99. In Stock.'
    };
});
```

### With JSON-LD Schema

```javascript
GeminiContext.init(() => {
    return {
        summary: 'Product page for Widget Pro.',
        keyPoints: 'Price: $99.99. Rating: 4.5/5 stars.',
        schema: GeminiContext.schema.product({
            name: 'Widget Pro',
            description: 'Professional-grade widget',
            price: 99.99,
            inStock: true
        })
    };
});
```

### With Debug Mode

```javascript
// Enable debug logging to see what's being injected
GeminiContext.debug(true).init(() => {
    return {
        summary: 'Debug mode enabled - check console for output.'
    };
});
```

---

## 3. API Reference

### Core Methods

#### `GeminiContext.init(gatherContextFn, options)`

Initializes the library with a context gathering function. Call this once when your page loads.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `gatherContextFn` | `Function` | Yes | Function that returns a ContextData object |
| `options` | `Object` | No | Configuration options |
| `options.DEBUG` | `boolean` | No | Enable console logging (default: `false`) |
| `options.handleSPA` | `boolean` | No | Auto-update on SPA navigation (default: `true`) |

**Returns:** `undefined`

**Example:**

```javascript
GeminiContext.init(
    // Context gathering function
    () => {
        return {
            summary: 'User dashboard showing account overview.',
            keyPoints: 'Balance: $5,432.10. Recent transactions: 5.',
            intentHints: 'User may ask about transactions or balance.'
        };
    },
    // Options
    {
        DEBUG: true,
        handleSPA: true
    }
);
```

---

#### `GeminiContext.updateContext(data)`

Updates the Shadow Context with new data. Use this when page content changes without navigation.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | `ContextData` | Yes | Context data object |

**ContextData Object:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `summary` | `string` | No | Main page summary (max 200 words) |
| `keyPoints` | `string` | No | Key data points (max 200 words) |
| `intentHints` | `string` | No | Hints about user intent (max 100 words) |
| `customSections` | `Array` | No | Additional custom sections |
| `schema` | `Object` | No | JSON-LD schema data |

**Example:**

```javascript
// Update when data changes (e.g., after user action)
function onAccountSelected(account) {
    GeminiContext.updateContext({
        summary: `Viewing ${account.type} account ending in ${account.lastFour}.`,
        keyPoints: `Balance: ${account.balance}. Available: ${account.available}.`,
        intentHints: 'User selected a specific account. May ask about transactions.'
    });
}
```

---

#### `GeminiContext.clearContext()`

Removes all content from the Shadow Context.

**Parameters:** None

**Example:**

```javascript
// Clear context when user logs out
function onLogout() {
    GeminiContext.clearContext();
    GeminiContext.removeJSONLD();
}
```

---

#### `GeminiContext.injectJSONLD(schemaData)`

Injects or updates JSON-LD structured data in the page head.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schemaData` | `Object` | Yes | Schema.org structured data object |

**Example:**

```javascript
// Inject product schema
GeminiContext.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': 'Widget Pro',
    'description': 'Professional-grade widget',
    'offers': {
        '@type': 'Offer',
        'price': '99.99',
        'priceCurrency': 'USD'
    }
});
```

---

#### `GeminiContext.removeJSONLD()`

Removes the injected JSON-LD script element.

**Parameters:** None

**Example:**

```javascript
// Remove schema when navigating away from product page
GeminiContext.removeJSONLD();
```

---

#### `GeminiContext.refresh()`

Manually triggers a context refresh using the function passed to `init()`.

**Parameters:** None

**Example:**

```javascript
// Refresh after async data load
async function loadData() {
    await fetchUserData();
    GeminiContext.refresh();
}
```

---

#### `GeminiContext.debug(enabled)`

Enables or disables debug mode. When enabled, logs all operations to the console.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enabled` | `boolean` | No | Enable debug mode (default: `true`) |

**Returns:** `GeminiContext` (for chaining)

**Example:**

```javascript
// Enable debug mode
GeminiContext.debug(true);

// Disable debug mode
GeminiContext.debug(false);

// Chain with init
GeminiContext.debug(true).init(() => ({ summary: 'Test' }));
```

---

### Properties

#### `GeminiContext.config`

Returns a read-only copy of the current configuration.

**Example:**

```javascript
console.log(GeminiContext.config);
// {
//     EXTRACTION_DELAY_MS: 5000,
//     MAX_WORDS_PER_PASSAGE: 200,
//     MIN_WORDS_PER_PASSAGE: 5,
//     MAX_PASSAGES: 30,
//     CONTAINER_ID: 'gemini-shadow-context',
//     JSONLD_ID: 'gemini-json-ld',
//     DEBUG: false
// }
```

---

#### `GeminiContext.isInitialized`

Returns whether `init()` has been called.

**Example:**

```javascript
if (!GeminiContext.isInitialized) {
    GeminiContext.init(() => ({ summary: 'Page loaded' }));
}
```

---

#### `GeminiContext.version`

Returns the library version string.

**Example:**

```javascript
console.log(GeminiContext.version); // "2.0.0"
```

---

### Utility Functions

Available via `GeminiContext.utils.*` for advanced use cases and testing.

#### `GeminiContext.utils.createShadowContextLayer()`

Manually creates the Shadow Context container element.

```javascript
const container = GeminiContext.utils.createShadowContextLayer();
```

---

#### `GeminiContext.utils.removeShadowContextLayer()`

Removes the Shadow Context container from the DOM.

```javascript
GeminiContext.utils.removeShadowContextLayer();
```

---

#### `GeminiContext.utils.countWords(text)`

Counts words in a string.

```javascript
const count = GeminiContext.utils.countWords('Hello world'); // 2
```

---

#### `GeminiContext.utils.truncateToWords(text, maxWords)`

Truncates text to a maximum word count.

```javascript
const truncated = GeminiContext.utils.truncateToWords('One two three four five', 3);
// "One two three..."
```

---

#### `GeminiContext.utils.sanitize(text)`

Sanitizes text to remove potential script injections.

```javascript
const safe = GeminiContext.utils.sanitize('<script>alert("xss")</script>Hello');
// "Hello"
```

---

#### `GeminiContext.utils.isValidPassage(text)`

Checks if text meets minimum word requirements (5+ words).

```javascript
GeminiContext.utils.isValidPassage('Too short'); // false
GeminiContext.utils.isValidPassage('This has enough words to pass'); // true
```

---

## 4. Schema Generators

Pre-built functions to generate Schema.org structured data. Access via `GeminiContext.schema.*`.

### `GeminiContext.schema.product(data)`

Generates Product schema for e-commerce pages.

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Product name |
| `description` | `string` | No | Product description |
| `price` | `number` | Yes | Price value |
| `currency` | `string` | No | Currency code (default: 'USD') |
| `sku` | `string` | No | Product SKU |
| `brand` | `string` | No | Brand name |
| `inStock` | `boolean` | No | Availability status |
| `rating` | `number` | No | Average rating |
| `reviewCount` | `number` | No | Number of reviews |

**Example:**

```javascript
const schema = GeminiContext.schema.product({
    name: 'Wireless Headphones Pro',
    description: 'Premium noise-canceling headphones',
    price: 299.99,
    currency: 'USD',
    sku: 'WHP-001',
    brand: 'AudioTech',
    inStock: true,
    rating: 4.8,
    reviewCount: 1247
});

GeminiContext.injectJSONLD(schema);
```

---

### `GeminiContext.schema.howTo(data)`

Generates HowTo schema for tutorial/guide pages.

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | Yes | Tutorial title |
| `description` | `string` | No | Tutorial description |
| `duration` | `string` | No | Estimated time (ISO 8601) |
| `steps` | `Array` | Yes | Array of step objects |
| `steps[].name` | `string` | No | Step title |
| `steps[].text` | `string` | Yes | Step instructions |

**Example:**

```javascript
const schema = GeminiContext.schema.howTo({
    title: 'How to Set Up Your Account',
    description: 'Complete guide to account configuration',
    duration: 'PT10M',
    steps: [
        { name: 'Create Account', text: 'Click the Sign Up button and enter your email.' },
        { name: 'Verify Email', text: 'Check your inbox and click the verification link.' },
        { name: 'Set Password', text: 'Choose a secure password with at least 12 characters.' }
    ]
});

GeminiContext.injectJSONLD(schema);
```

---

### `GeminiContext.schema.faq(data)`

Generates FAQPage schema for help/support pages.

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `questions` | `Array` | Yes | Array of Q&A objects |
| `questions[].question` | `string` | Yes | The question |
| `questions[].answer` | `string` | Yes | The answer |

**Example:**

```javascript
const schema = GeminiContext.schema.faq({
    questions: [
        {
            question: 'What is your return policy?',
            answer: 'We offer 30-day returns on all unused items.'
        },
        {
            question: 'How long does shipping take?',
            answer: 'Standard shipping takes 3-5 business days.'
        }
    ]
});

GeminiContext.injectJSONLD(schema);
```

---

### `GeminiContext.schema.article(data)`

Generates Article schema for blog posts/news.

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | Yes | Article headline |
| `description` | `string` | No | Article summary |
| `author` | `string` | Yes | Author name |
| `authorType` | `string` | No | 'Person' or 'Organization' |
| `published` | `string` | Yes | ISO 8601 date |
| `modified` | `string` | No | ISO 8601 date |
| `publisher` | `string` | No | Publisher name |

**Example:**

```javascript
const schema = GeminiContext.schema.article({
    title: 'Understanding AI in Modern Browsers',
    description: 'A deep dive into browser-embedded AI agents.',
    author: 'Jane Smith',
    published: '2024-02-01T09:00:00Z',
    modified: '2024-02-03T14:30:00Z',
    publisher: 'Tech Insights'
});

GeminiContext.injectJSONLD(schema);
```

---

### `GeminiContext.schema.financialProduct(data)`

Generates FinancialProduct schema for banking/finance pages.

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Product name |
| `description` | `string` | No | Product description |
| `fees` | `string` | No | Fee description |
| `apr` | `number` | No | Annual percentage rate |
| `interestRate` | `number` | No | Interest rate |
| `provider` | `string` | No | Financial institution name |

**Example:**

```javascript
const schema = GeminiContext.schema.financialProduct({
    name: 'Premium Savings Account',
    description: 'High-yield savings with no minimum balance.',
    fees: 'No monthly maintenance fees',
    apr: 4.5,
    interestRate: 4.5,
    provider: 'Acme Bank'
});

GeminiContext.injectJSONLD(schema);
```

---

### `GeminiContext.schema.webPage(data)`

Generates WebPage schema for general pages.

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | Yes | Page title |
| `description` | `string` | No | Page description |
| `url` | `string` | No | Page URL (default: current URL) |
| `modified` | `string` | No | ISO 8601 date |
| `siteName` | `string` | No | Website name |

**Example:**

```javascript
const schema = GeminiContext.schema.webPage({
    title: 'Contact Us',
    description: 'Get in touch with our support team.',
    siteName: 'Acme Corp'
});

GeminiContext.injectJSONLD(schema);
```

---

### `GeminiContext.schema.softwareApplication(data)`

Generates SoftwareApplication schema for app/software pages.

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Application name |
| `description` | `string` | No | Application description |
| `category` | `string` | No | App category |
| `os` | `string` | No | Operating system |
| `version` | `string` | No | Software version |
| `price` | `number` | No | Price (omit for free) |
| `currency` | `string` | No | Currency code |

**Example:**

```javascript
const schema = GeminiContext.schema.softwareApplication({
    name: 'TaskMaster Pro',
    description: 'Advanced project management tool',
    category: 'BusinessApplication',
    os: 'Windows, macOS, Linux',
    version: '3.2.1',
    price: 49.99,
    currency: 'USD'
});

GeminiContext.injectJSONLD(schema);
```

---

## 5. Framework Integration

### Vanilla JavaScript

```javascript
// Simple page
document.addEventListener('DOMContentLoaded', () => {
    GeminiContext.init(() => ({
        summary: document.querySelector('meta[name="description"]')?.content || '',
        keyPoints: document.querySelector('.product-price')?.textContent || ''
    }));
});
```

---

### React

```jsx
// hooks/useGeminiContext.js
import { useEffect } from 'react';

export function useGeminiContext(contextData) {
    useEffect(() => {
        if (contextData) {
            GeminiContext.updateContext(contextData);
            if (contextData.schema) {
                GeminiContext.injectJSONLD(contextData.schema);
            }
        }
    }, [contextData]);
}

// Initialize once in App.js or index.js
useEffect(() => {
    if (!GeminiContext.isInitialized) {
        GeminiContext.init(() => ({}), { handleSPA: true });
    }
}, []);
```

```jsx
// ProductPage.jsx
import { useGeminiContext } from './hooks/useGeminiContext';

function ProductPage({ product }) {
    useGeminiContext({
        summary: `Product page for ${product.name}.`,
        keyPoints: `Price: $${product.price}. ${product.inStock ? 'In Stock' : 'Out of Stock'}.`,
        schema: GeminiContext.schema.product({
            name: product.name,
            price: product.price,
            inStock: product.inStock
        })
    });

    return (
        <div>
            <h1>{product.name}</h1>
            <p>${product.price}</p>
            <button aria-label={`Add ${product.name} to cart for $${product.price}`}>
                Add to Cart
            </button>
        </div>
    );
}
```

---

### Vue 3

```javascript
// composables/useGeminiContext.js
import { watch, onMounted } from 'vue';

export function useGeminiContext(contextRef) {
    onMounted(() => {
        if (!GeminiContext.isInitialized) {
            GeminiContext.init(() => ({}), { handleSPA: true });
        }
    });

    watch(contextRef, (newContext) => {
        if (newContext) {
            GeminiContext.updateContext(newContext);
            if (newContext.schema) {
                GeminiContext.injectJSONLD(newContext.schema);
            }
        }
    }, { immediate: true });
}
```

```vue
<!-- ProductPage.vue -->
<script setup>
import { computed } from 'vue';
import { useGeminiContext } from '@/composables/useGeminiContext';

const props = defineProps(['product']);

const geminiContext = computed(() => ({
    summary: `Product page for ${props.product.name}.`,
    keyPoints: `Price: $${props.product.price}.`,
    schema: GeminiContext.schema.product({
        name: props.product.name,
        price: props.product.price,
        inStock: props.product.inStock
    })
}));

useGeminiContext(geminiContext);
</script>
```

---

### Next.js (App Router)

```typescript
// components/GeminiContextProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ContextData {
    summary?: string;
    keyPoints?: string;
    intentHints?: string;
    schema?: object;
}

export function GeminiContextProvider({ context }: { context: ContextData }) {
    const pathname = usePathname();

    useEffect(() => {
        // Initialize on first mount
        if (typeof window !== 'undefined' && !window.GeminiContext?.isInitialized) {
            window.GeminiContext?.init(() => ({}));
        }
    }, []);

    useEffect(() => {
        // Update context when it changes
        if (typeof window !== 'undefined' && context) {
            window.GeminiContext?.updateContext(context);
            if (context.schema) {
                window.GeminiContext?.injectJSONLD(context.schema);
            }
        }
    }, [context, pathname]);

    return null;
}
```

---

### Angular

```typescript
// gemini-context.service.ts
import { Injectable } from '@angular/core';

declare const GeminiContext: any;

@Injectable({ providedIn: 'root' })
export class GeminiContextService {
    private initialized = false;

    init() {
        if (!this.initialized && typeof GeminiContext !== 'undefined') {
            GeminiContext.init(() => ({}), { handleSPA: true });
            this.initialized = true;
        }
    }

    updateContext(data: any) {
        if (typeof GeminiContext !== 'undefined') {
            GeminiContext.updateContext(data);
            if (data.schema) {
                GeminiContext.injectJSONLD(data.schema);
            }
        }
    }
}
```

```typescript
// product.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { GeminiContextService } from './gemini-context.service';

@Component({
    selector: 'app-product',
    template: `...`
})
export class ProductComponent implements OnInit {
    @Input() product: any;

    constructor(private geminiContext: GeminiContextService) {}

    ngOnInit() {
        this.geminiContext.updateContext({
            summary: `Product page for ${this.product.name}.`,
            keyPoints: `Price: $${this.product.price}.`
        });
    }
}
```

---

## 6. Advanced Patterns

### Custom Sections

Add multiple custom content sections:

```javascript
GeminiContext.updateContext({
    summary: 'Order confirmation page.',
    customSections: [
        {
            title: 'Order Details',
            content: 'Order #12345. Total: $299.99. Items: 3.'
        },
        {
            title: 'Shipping Information',
            content: 'Estimated delivery: Feb 10-12. Carrier: FedEx Ground.'
        },
        {
            title: 'Payment Summary',
            content: 'Paid with Visa ending in 4242. Transaction ID: TXN-789.'
        }
    ]
});
```

---

### Dynamic Updates on User Actions

```javascript
// Update context when user interacts with the page
document.querySelector('#account-selector').addEventListener('change', (e) => {
    const account = accounts.find(a => a.id === e.target.value);
    
    GeminiContext.updateContext({
        summary: `Viewing ${account.type} account.`,
        keyPoints: `Account: ${account.name}. Balance: ${account.balance}.`,
        intentHints: 'User switched accounts. May ask about this specific account.'
    });
});
```

---

### Combining Multiple Schema Types

```javascript
// For pages with multiple entity types
const productSchema = GeminiContext.schema.product({
    name: 'Widget Pro',
    price: 99.99,
    inStock: true
});

const faqSchema = GeminiContext.schema.faq({
    questions: [
        { question: 'What warranty is included?', answer: '2-year manufacturer warranty.' }
    ]
});

// Inject as array (Schema.org supports @graph)
GeminiContext.injectJSONLD({
    '@context': 'https://schema.org',
    '@graph': [productSchema, faqSchema]
});
```

---

### Conditional Context Based on User State

```javascript
GeminiContext.init(() => {
    const user = getCurrentUser();
    const page = getCurrentPage();
    
    const baseContext = {
        summary: `${page.title} page.`
    };
    
    // Add user-specific context if logged in
    if (user) {
        baseContext.keyPoints = `User: ${user.name}. Account type: ${user.tier}.`;
        baseContext.intentHints = `User is a ${user.tier} member. Prioritize ${user.tier} benefits.`;
    }
    
    // Add page-specific schema
    if (page.type === 'product') {
        baseContext.schema = GeminiContext.schema.product(page.product);
    }
    
    return baseContext;
});
```

---

## 7. Troubleshooting

### Context Not Being Read

**Symptoms:** Gemini doesn't seem to see your injected context.

**Checklist:**
- [ ] Is `GeminiContext.init()` being called?
- [ ] Is context injected within 5 seconds of page load?
- [ ] Are you using `opacity: 0` (not `display: none`)?
- [ ] Does each passage have at least 5 words?
- [ ] Enable debug mode: `GeminiContext.debug(true)`

```javascript
// Verify container exists and has content
const container = document.getElementById('gemini-shadow-context');
console.log('Container exists:', !!container);
console.log('Container content:', container?.innerHTML);
console.log('Container styles:', container?.style.cssText);
```

---

### SPA Navigation Not Updating Context

**Symptoms:** Context doesn't update when navigating in your SPA.

**Solutions:**

```javascript
// Option 1: Ensure handleSPA is enabled (default)
GeminiContext.init(gatherContext, { handleSPA: true });

// Option 2: Manually call refresh after navigation
router.afterEach(() => {
    GeminiContext.refresh();
});

// Option 3: Call updateContext directly
function onRouteChange(newRoute) {
    GeminiContext.updateContext(getContextForRoute(newRoute));
}
```

---

### JSON-LD Not Appearing

**Symptoms:** Structured data not showing in page source.

**Solutions:**

```javascript
// Verify JSON-LD exists
const jsonLd = document.getElementById('gemini-json-ld');
console.log('JSON-LD exists:', !!jsonLd);
console.log('JSON-LD content:', jsonLd?.textContent);

// Ensure schema object is valid
const schema = GeminiContext.schema.product({ name: 'Test', price: 10 });
console.log('Generated schema:', JSON.stringify(schema, null, 2));
```

---

### Content Being Truncated

**Symptoms:** Long content appears cut off.

**Explanation:** The library enforces a 200-word limit per passage to align with Chromium's DocumentChunker constraints.

**Solutions:**

```javascript
// Split long content into multiple sections
GeminiContext.updateContext({
    customSections: [
        { title: 'Overview', content: 'First 200 words...' },
        { title: 'Details', content: 'Next 200 words...' },
        { title: 'Specifications', content: 'Final 200 words...' }
    ]
});
```

---

### Debug Output

Enable comprehensive debugging:

```javascript
// Enable debug mode
GeminiContext.debug(true);

// Check configuration
console.log('Config:', GeminiContext.config);

// Check initialization state
console.log('Initialized:', GeminiContext.isInitialized);

// Verify word counting
console.log('Word count test:', GeminiContext.utils.countWords('one two three')); // 3

// Test sanitization
console.log('Sanitize test:', GeminiContext.utils.sanitize('<b>bold</b>')); // "&lt;b&gt;bold&lt;/b&gt;"
```

---

## Appendix: Complete Example Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Pro - Product Page</title>
</head>
<body>
    <main>
        <h1>Widget Pro</h1>
        <p class="price">$99.99</p>
        <p class="description">Professional-grade widget for serious users.</p>
        <button 
            id="add-to-cart"
            aria-label="Add Widget Pro to cart for $99.99"
        >
            Add to Cart
        </button>
    </main>

    <script src="GeminiContext.js"></script>
    <script>
        // Initialize with debug mode
        GeminiContext.debug(true).init(() => {
            // Gather context from the page
            const name = document.querySelector('h1')?.textContent || 'Product';
            const price = document.querySelector('.price')?.textContent || '';
            const description = document.querySelector('.description')?.textContent || '';

            return {
                summary: `Product page for ${name}.`,
                keyPoints: `${name}. Price: ${price}. ${description}`,
                intentHints: 'User is viewing a product. May ask about price, features, or availability.',
                schema: GeminiContext.schema.product({
                    name: name,
                    description: description,
                    price: parseFloat(price.replace(/[^0-9.]/g, '')),
                    inStock: true,
                    rating: 4.8,
                    reviewCount: 1247
                })
            };
        });

        // Update context when user adds to cart
        document.getElementById('add-to-cart').addEventListener('click', () => {
            GeminiContext.updateContext({
                summary: 'Widget Pro added to cart.',
                keyPoints: 'Cart now contains Widget Pro ($99.99). Proceed to checkout.',
                intentHints: 'User added item to cart. May ask about checkout or continue shopping.'
            });
        });
    </script>
</body>
</html>
```

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#7-troubleshooting) section
2. Enable debug mode and review console output
3. Verify your implementation against the examples above

---

*GeminiContext.js v2.0.0 - AI UX Developer Toolkit*
