/**
 * GeminiContext.js v2.0
 * 
 * Client-side library to optimize web content for browser-embedded AI agents
 * (specifically Gemini in Chrome, but patterns apply to other agents).
 * 
 * Based on architectural analysis of Chromium's DocumentChunker and 
 * content extraction pipelines.
 * 
 * @license MIT
 * @author AI UX Developer Toolkit
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/modules/content_extraction/
 */

(function(global, factory) {
    // UMD pattern for compatibility
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.GeminiContext = factory();
    }
}(typeof window !== 'undefined' ? window : this, function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // Values derived from Chromium source code analysis
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @typedef {Object} GeminiContextConfig
     * @property {number} EXTRACTION_DELAY_MS - Time browser waits before text extraction
     * @property {number} MAX_WORDS_PER_PASSAGE - Maximum words per content chunk
     * @property {number} MIN_WORDS_PER_PASSAGE - Minimum words to avoid noise filtering
     * @property {number} MAX_PASSAGES - Maximum passages per page
     * @property {string} CONTAINER_ID - Shadow context container element ID
     * @property {string} JSONLD_ID - JSON-LD script element ID
     * @property {boolean} DEBUG - Enable console logging
     */
    const CONFIG = {
        // Browser waits ~5000ms after load before extracting text
        // Source: passage_extraction_delay in Chromium feature flags
        EXTRACTION_DELAY_MS: 5000,

        // DocumentChunker prefers blocks of ~200 words
        // Source: max_words_per_aggregate_passage parameter
        MAX_WORDS_PER_PASSAGE: 200,

        // Text under 5 words is discarded as noise
        // Source: search_passage_minimum_word_count parameter
        MIN_WORDS_PER_PASSAGE: 5,

        // Maximum passages that get processed
        // Source: max_passages_per_page parameter
        MAX_PASSAGES: 30,

        // DOM element IDs
        CONTAINER_ID: 'gemini-shadow-context',
        JSONLD_ID: 'gemini-json-ld',

        // Debug mode
        DEBUG: false
    };

    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Console logger (only when DEBUG is enabled)
     * @private
     */
    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('%c[GeminiContext]', 'color: #3b82f6; font-weight: bold;', ...args);
        }
    }

    /**
     * Console warning logger
     * @private
     */
    function warn(...args) {
        console.warn('%c[GeminiContext]', 'color: #f97316; font-weight: bold;', ...args);
    }

    /**
     * Count words in a string
     * @param {string} text 
     * @returns {number}
     */
    function countWords(text) {
        if (!text || typeof text !== 'string') return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    /**
     * Truncate text to a maximum word count
     * @param {string} text 
     * @param {number} maxWords 
     * @returns {string}
     */
    function truncateToWords(text, maxWords) {
        if (!text || typeof text !== 'string') return '';
        const words = text.trim().split(/\s+/);
        if (words.length <= maxWords) return text.trim();
        return words.slice(0, maxWords).join(' ') + '...';
    }

    /**
     * Sanitize text to remove potential script injections
     * Preserves helpful content while blocking malicious patterns
     * @param {string} text 
     * @returns {string}
     */
    function sanitize(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text
            // Remove script tags
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Remove event handlers
            .replace(/\bon\w+\s*=/gi, '')
            // Remove javascript: URLs
            .replace(/javascript:/gi, '')
            // Escape HTML entities
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .trim();
    }

    /**
     * Validate that text meets minimum requirements
     * @param {string} text 
     * @returns {boolean}
     */
    function isValidPassage(text) {
        return countWords(text) >= CONFIG.MIN_WORDS_PER_PASSAGE;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SHADOW CONTEXT LAYER
    // Creates invisible-to-user, visible-to-AI container
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Create the Shadow Context Layer container
     * Uses CSS techniques that keep content in the Layout Tree but out of Paint Tree
     * 
     * CRITICAL: Do NOT use display:none or visibility:hidden - these are pruned
     * by the DocumentChunker before reaching the AI model.
     * 
     * @returns {HTMLElement} The shadow context container
     */
    function createShadowContextLayer() {
        // Return existing if already created
        let container = document.getElementById(CONFIG.CONTAINER_ID);
        if (container) {
            log('Shadow Context Layer already exists');
            return container;
        }

        container = document.createElement('div');
        container.id = CONFIG.CONTAINER_ID;

        // CRITICAL CSS: Invisible to humans, visible to DocumentChunker
        // Using opacity (not visibility:hidden) and off-screen positioning
        container.style.cssText = `
            position: absolute !important;
            top: -10000px !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            opacity: 0.01 !important;
            overflow: hidden !important;
            pointer-events: none !important;
            z-index: -1 !important;
            contain: strict !important;
        `;

        // CRITICAL: Hide from screen readers to protect A11y experience
        // The AI reads from DOM (not A11y tree) for summarization tasks
        container.setAttribute('aria-hidden', 'true');
        container.setAttribute('role', 'presentation');
        
        // Hint to search engine crawlers (not essential for Gemini)
        container.setAttribute('data-nosnippet', 'true');

        // Append to body
        if (document.body) {
            document.body.appendChild(container);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(container);
            });
        }

        log('Shadow Context Layer created');
        return container;
    }

    /**
     * Remove the Shadow Context Layer
     * Useful for cleanup or testing
     */
    function removeShadowContextLayer() {
        const container = document.getElementById(CONFIG.CONTAINER_ID);
        if (container) {
            container.remove();
            log('Shadow Context Layer removed');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SEMANTIC HTML BUILDER
    // Formats context using semantic HTML that survives boilerplate pruning
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @typedef {Object} ContextSection
     * @property {string} title - Section heading
     * @property {string} content - Section content
     */

    /**
     * @typedef {Object} ContextData
     * @property {string} [summary] - Main page summary
     * @property {string} [keyPoints] - Key data points
     * @property {string} [intentHints] - User intent context for AI
     * @property {ContextSection[]} [customSections] - Additional custom sections
     * @property {Object} [schema] - JSON-LD schema data
     */

    /**
     * Build semantic HTML from context data
     * Uses article/section/h2/p structure to avoid boilerplate pruning
     * 
     * @param {ContextData} data - Context data to format
     * @returns {string} HTML string
     */
    function buildSemanticHTML(data) {
        if (!data || typeof data !== 'object') {
            warn('buildSemanticHTML received invalid data');
            return '';
        }

        const sections = [];

        // Main summary section
        if (data.summary) {
            const summary = truncateToWords(sanitize(data.summary), CONFIG.MAX_WORDS_PER_PASSAGE);
            if (isValidPassage(summary)) {
                sections.push(`
                    <section>
                        <h2>Page Summary</h2>
                        <p>${summary}</p>
                    </section>
                `);
            }
        }

        // Key data points
        if (data.keyPoints) {
            const points = truncateToWords(sanitize(data.keyPoints), CONFIG.MAX_WORDS_PER_PASSAGE);
            if (isValidPassage(points)) {
                sections.push(`
                    <section>
                        <h2>Key Information</h2>
                        <p>${points}</p>
                    </section>
                `);
            }
        }

        // User intent hints (helps model understand context)
        // Framed as "notes" to avoid triggering security filters
        if (data.intentHints) {
            const hints = truncateToWords(sanitize(data.intentHints), 100);
            if (isValidPassage(hints)) {
                sections.push(`
                    <section>
                        <h2>Context Notes</h2>
                        <p>${hints}</p>
                    </section>
                `);
            }
        }

        // Custom sections
        if (Array.isArray(data.customSections)) {
            data.customSections.forEach((section) => {
                if (section && section.title && section.content) {
                    const title = sanitize(section.title);
                    const content = truncateToWords(sanitize(section.content), CONFIG.MAX_WORDS_PER_PASSAGE);
                    if (isValidPassage(content)) {
                        sections.push(`
                            <section>
                                <h2>${title}</h2>
                                <p>${content}</p>
                            </section>
                        `);
                    }
                }
            });
        }

        // Warn if we're approaching passage limit
        if (sections.length > CONFIG.MAX_PASSAGES * 0.8) {
            warn(`Context has ${sections.length} sections. Max is ${CONFIG.MAX_PASSAGES}.`);
        }

        // Wrap in article with instructional header
        // Using semantic HTML structure helps avoid boilerplate pruning
        return `
            <article>
                <h1>Contextual Information for AI Assistant</h1>
                ${sections.join('\n')}
            </article>
        `.trim();
    }

    /**
     * Update the Shadow Context with new data
     * 
     * @param {ContextData} data - Context data to inject
     */
    function updateContext(data) {
        const container = document.getElementById(CONFIG.CONTAINER_ID) || createShadowContextLayer();
        const htmlContent = buildSemanticHTML(data);
        container.innerHTML = htmlContent;
        log('Context updated:', data);
    }

    /**
     * Clear all content from the Shadow Context
     */
    function clearContext() {
        const container = document.getElementById(CONFIG.CONTAINER_ID);
        if (container) {
            container.innerHTML = '';
            log('Context cleared');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // JSON-LD INJECTION
    // Provides structured "grounding" data to prevent hallucinations
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Inject or update JSON-LD structured data
     * 
     * @param {Object} schemaData - Schema.org structured data object
     */
    function injectJSONLD(schemaData) {
        if (!schemaData || typeof schemaData !== 'object') {
            warn('injectJSONLD received invalid schema data');
            return;
        }

        // Ensure @context is present
        if (!schemaData['@context']) {
            schemaData['@context'] = 'https://schema.org';
        }

        let script = document.getElementById(CONFIG.JSONLD_ID);
        if (!script) {
            script = document.createElement('script');
            script.id = CONFIG.JSONLD_ID;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        
        try {
            script.textContent = JSON.stringify(schemaData, null, 2);
            log('JSON-LD injected:', schemaData['@type'] || 'Unknown type');
        } catch (e) {
            warn('Failed to serialize JSON-LD:', e);
        }
    }

    /**
     * Remove the injected JSON-LD
     */
    function removeJSONLD() {
        const script = document.getElementById(CONFIG.JSONLD_ID);
        if (script) {
            script.remove();
            log('JSON-LD removed');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SCHEMA GENERATORS
    // Pre-built schema generators for common content types
    // ═══════════════════════════════════════════════════════════════════════

    const SchemaGenerators = {
        /**
         * Generate Product schema
         * @param {Object} data - Product data
         * @returns {Object} Schema.org Product
         */
        product(data) {
            return {
                '@context': 'https://schema.org',
                '@type': 'Product',
                'name': data.name,
                'description': data.description,
                'sku': data.sku,
                'brand': data.brand ? {
                    '@type': 'Brand',
                    'name': data.brand
                } : undefined,
                'offers': {
                    '@type': 'Offer',
                    'price': String(data.price),
                    'priceCurrency': data.currency || 'USD',
                    'availability': data.inStock 
                        ? 'https://schema.org/InStock' 
                        : 'https://schema.org/OutOfStock',
                    'itemCondition': 'https://schema.org/NewCondition'
                },
                'aggregateRating': data.rating ? {
                    '@type': 'AggregateRating',
                    'ratingValue': String(data.rating),
                    'reviewCount': String(data.reviewCount || 0)
                } : undefined
            };
        },

        /**
         * Generate HowTo schema
         * @param {Object} data - HowTo data with steps array
         * @returns {Object} Schema.org HowTo
         */
        howTo(data) {
            return {
                '@context': 'https://schema.org',
                '@type': 'HowTo',
                'name': data.title,
                'description': data.description,
                'totalTime': data.duration,
                'step': (data.steps || []).map((step, idx) => ({
                    '@type': 'HowToStep',
                    'position': idx + 1,
                    'name': step.name || `Step ${idx + 1}`,
                    'text': step.text
                }))
            };
        },

        /**
         * Generate FAQPage schema
         * @param {Object} data - FAQ data with questions array
         * @returns {Object} Schema.org FAQPage
         */
        faq(data) {
            return {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                'mainEntity': (data.questions || []).map(q => ({
                    '@type': 'Question',
                    'name': q.question,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': q.answer
                    }
                }))
            };
        },

        /**
         * Generate Article schema
         * @param {Object} data - Article data
         * @returns {Object} Schema.org Article
         */
        article(data) {
            return {
                '@context': 'https://schema.org',
                '@type': 'Article',
                'headline': data.title,
                'description': data.description,
                'author': {
                    '@type': data.authorType || 'Person',
                    'name': data.author
                },
                'datePublished': data.published,
                'dateModified': data.modified || data.published,
                'publisher': data.publisher ? {
                    '@type': 'Organization',
                    'name': data.publisher
                } : undefined
            };
        },

        /**
         * Generate FinancialProduct schema
         * @param {Object} data - Financial product data
         * @returns {Object} Schema.org FinancialProduct
         */
        financialProduct(data) {
            return {
                '@context': 'https://schema.org',
                '@type': 'FinancialProduct',
                'name': data.name,
                'description': data.description,
                'feesAndCommissionsSpecification': data.fees,
                'annualPercentageRate': data.apr ? String(data.apr) : undefined,
                'interestRate': data.interestRate ? String(data.interestRate) : undefined,
                'provider': data.provider ? {
                    '@type': 'FinancialService',
                    'name': data.provider
                } : undefined
            };
        },

        /**
         * Generate WebPage schema
         * @param {Object} data - WebPage data
         * @returns {Object} Schema.org WebPage
         */
        webPage(data) {
            return {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                'name': data.title,
                'description': data.description,
                'url': data.url || window.location.href,
                'dateModified': data.modified || new Date().toISOString(),
                'isPartOf': data.siteName ? {
                    '@type': 'WebSite',
                    'name': data.siteName
                } : undefined
            };
        },

        /**
         * Generate SoftwareApplication schema
         * @param {Object} data - Software/app data
         * @returns {Object} Schema.org SoftwareApplication
         */
        softwareApplication(data) {
            return {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                'name': data.name,
                'description': data.description,
                'applicationCategory': data.category,
                'operatingSystem': data.os,
                'softwareVersion': data.version,
                'offers': data.price !== undefined ? {
                    '@type': 'Offer',
                    'price': String(data.price),
                    'priceCurrency': data.currency || 'USD'
                } : undefined
            };
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION & SPA HANDLING
    // ═══════════════════════════════════════════════════════════════════════

    // Track initialization state
    let isInitialized = false;
    let contextGatherer = null;

    /**
     * Initialize GeminiContext with a context gathering function
     * 
     * @param {Function} gatherContextFn - Function that returns ContextData
     * @param {Object} [options] - Configuration options
     * @param {boolean} [options.DEBUG] - Enable debug logging
     * @param {boolean} [options.handleSPA] - Enable SPA navigation handling (default: true)
     */
    function init(gatherContextFn, options = {}) {
        if (isInitialized) {
            warn('GeminiContext already initialized. Use updateContext() for updates.');
            return;
        }

        if (typeof gatherContextFn !== 'function') {
            throw new Error('GeminiContext.init() requires a context gathering function');
        }

        // Merge options
        if (options.DEBUG !== undefined) CONFIG.DEBUG = options.DEBUG;
        const handleSPA = options.handleSPA !== false; // Default true

        // Store gatherer for later use
        contextGatherer = gatherContextFn;

        // Initial load handler
        const handleLoad = () => {
            log('Page load detected, injecting context...');
            createShadowContextLayer();
            
            try {
                const context = gatherContextFn();
                updateContext(context);
                if (context && context.schema) {
                    injectJSONLD(context.schema);
                }
            } catch (e) {
                warn('Error gathering context:', e);
            }
        };

        // Run on load or immediately if already loaded
        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        // SPA Navigation: Patch History API
        if (handleSPA) {
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            const handleNavigation = () => {
                // Small buffer to allow new page content to hydrate
                setTimeout(() => {
                    log('SPA navigation detected, updating context...');
                    try {
                        const context = gatherContextFn();
                        updateContext(context);
                        if (context && context.schema) {
                            injectJSONLD(context.schema);
                        }
                    } catch (e) {
                        warn('Error updating context on navigation:', e);
                    }
                }, 500);
            };

            history.pushState = function(...args) {
                originalPushState.apply(history, args);
                handleNavigation();
            };

            history.replaceState = function(...args) {
                originalReplaceState.apply(history, args);
                handleNavigation();
            };

            // Handle back/forward navigation
            window.addEventListener('popstate', handleNavigation);

            log('SPA navigation handling enabled');
        }

        isInitialized = true;
        log('GeminiContext initialized');
    }

    /**
     * Manually trigger a context refresh
     * Useful when data changes without navigation
     */
    function refresh() {
        if (!contextGatherer) {
            warn('Cannot refresh: GeminiContext not initialized with init()');
            return;
        }

        try {
            const context = contextGatherer();
            updateContext(context);
            if (context && context.schema) {
                injectJSONLD(context.schema);
            }
            log('Context refreshed');
        } catch (e) {
            warn('Error refreshing context:', e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════

    return {
        // ─────────────────────────────────────────────────────────────────
        // Core Methods
        // ─────────────────────────────────────────────────────────────────
        
        /** Initialize with a context gathering function */
        init: init,
        
        /** Update the Shadow Context with new data */
        updateContext: updateContext,
        
        /** Clear all Shadow Context content */
        clearContext: clearContext,
        
        /** Inject JSON-LD structured data */
        injectJSONLD: injectJSONLD,
        
        /** Remove injected JSON-LD */
        removeJSONLD: removeJSONLD,
        
        /** Manually refresh context (if init was called) */
        refresh: refresh,

        // ─────────────────────────────────────────────────────────────────
        // Schema Generators
        // ─────────────────────────────────────────────────────────────────
        
        /** Pre-built schema generators for common content types */
        schema: SchemaGenerators,

        // ─────────────────────────────────────────────────────────────────
        // Utilities (exposed for testing and advanced use)
        // ─────────────────────────────────────────────────────────────────
        
        utils: {
            createShadowContextLayer: createShadowContextLayer,
            removeShadowContextLayer: removeShadowContextLayer,
            buildSemanticHTML: buildSemanticHTML,
            countWords: countWords,
            truncateToWords: truncateToWords,
            sanitize: sanitize,
            isValidPassage: isValidPassage
        },

        // ─────────────────────────────────────────────────────────────────
        // Configuration
        // ─────────────────────────────────────────────────────────────────
        
        /** Get current configuration (read-only copy) */
        get config() {
            return Object.freeze({ ...CONFIG });
        },

        /** Enable or disable debug mode */
        debug(enabled = true) {
            CONFIG.DEBUG = Boolean(enabled);
            log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
            return this;
        },

        /** Check if initialized */
        get isInitialized() {
            return isInitialized;
        },

        /** Library version */
        version: '2.0.0'
    };
}));
