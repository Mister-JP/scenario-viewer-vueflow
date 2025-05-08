<!-- src/pages/MarkdownTestPage.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { marked } from 'marked';

// Initial Markdown content for the editor
const initialMarkdown = `## Heading 1 (H2)

### Heading 2 (H3)

This is a paragraph with **bold text** and *italic text*.

---

- Unordered List Item 1
- Unordered List Item 2
  - Nested Unordered Item

1. Ordered List Item 1
2. Ordered List Item 2
   1. Nested Ordered Item

\`\`\`javascript
// Code block example
function greet(message) {
  console.log(message);
}
greet("Hello from Markdown Code Block!");
\`\`\`

> This is a blockquote.
> It can span multiple lines.

A link to [Vue.js Official Site](https://vuejs.org/).

An image:
![Sample Image](https://t4.ftcdn.net/jpg/01/43/42/83/360_F_143428338_gcxw3Jcd0tJpkvvb53pfEztwtU9sxsgT.jpg)
`;

const markdownInput = ref(initialMarkdown);

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: false, // Set breaks back to false for standard paragraph handling (requires blank lines between paragraphs)
  pedantic: false,
  smartypants: true
});

const renderedMarkdown = computed(() => {
  if (markdownInput.value) {
    try {
      // Basic sanitization example (consider a more robust library like DOMPurify if security is critical)
      const dirtyHtml = marked.parse(markdownInput.value) as string;
      // Very basic link sanitization (allow http, https, mailto)
      // const cleanHtml = dirtyHtml.replace(/<a href="(?!http|https|mailto:)[^"]*"/g, '<a href="#"'); // Example - Replace with proper sanitizer if needed
      return dirtyHtml; // Return the parsed HTML
    } catch (e) {
      console.error("Error parsing Markdown:", e);
      return '<p style="color: red; font-weight: bold;">Error rendering Markdown. Check console.</p>';
    }
  }
  return '<p><em>Start typing Markdown...</em></p>';
});
</script>

<template>
  <div class="markdown-test-container">
    <header class="test-page-header">
      <h1>Markdown Editor & Preview</h1>
      <p>Changes are not saved on reload. This is for testing rendering.</p>
    </header>
    <div class="editor-preview-wrapper">
      <div class="editor-pane">
        <textarea v-model="markdownInput" class="markdown-input-area" placeholder="Type your Markdown here..."></textarea>
      </div>
      <div class="preview-pane">
        <div class="custom-markdown-label-wrapper">
          <div class="markdown-label-content" v-html="renderedMarkdown"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base styles for the page structure */
.markdown-test-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc; /* Tailwind gray-50 */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  margin: 0;
  overflow: hidden;
}

.test-page-header {
  background-color: #ffffff; /* White header */
  color: #1f2937; /* Tailwind gray-800 text */
  padding: 0.75rem 1.5rem;
  text-align: center;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb; /* Tailwind gray-200 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.test-page-header h1 {
  margin: 0 0 0.1rem 0;
  font-size: 1.5rem; /* Slightly smaller header */
  font-weight: 600;
}
.test-page-header p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280; /* Tailwind gray-500 */
}

.editor-preview-wrapper {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.editor-pane,
.preview-pane {
  flex: 1;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100%;
}

.editor-pane {
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb; /* Tailwind gray-200 */
}

.preview-pane {
  background-color: #f9fafb; /* Tailwind gray-50 */
}

.markdown-input-area {
  width: 100%;
  height: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db; /* Tailwind gray-300 */
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #111827; /* Tailwind gray-900 */
}
.markdown-input-area:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #2563eb; /* Tailwind blue-600 */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); /* Focus ring */
}

/* --- Styles for the Minimalistic Markdown Preview Card --- */
.custom-markdown-label-wrapper {
  background-color: #ffffff; /* White background for the card */
  color: #374151;           /* Default text color (Tailwind gray-700) */
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 13px;           /* Adjust base font size if needed */
  line-height: 1.6;
  max-width: 100%;
  text-align: left;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); /* Tailwind shadow-md */
  border: 1px solid #e5e7eb; /* Tailwind gray-200 border */
  white-space: normal;
}

/* --- Minimalistic Styles for v-html content using :deep() --- */
.markdown-label-content :deep(> *:first-child) {
  margin-top: 0;
}
.markdown-label-content :deep(> *:last-child) {
  margin-bottom: 0;
}

.markdown-label-content :deep(p) {
  margin-top: 0; /* Reset top margin for paragraphs */
  margin-bottom: 0.75em; /* Consistent bottom margin */
  color: #4b5563; /* Tailwind gray-600 for slightly lighter paragraphs */
}

/* Headings */
.markdown-label-content :deep(h1),
.markdown-label-content :deep(h2),
.markdown-label-content :deep(h3),
.markdown-label-content :deep(h4),
.markdown-label-content :deep(h5),
.markdown-label-content :deep(h6) {
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  line-height: 1.3;
  font-weight: 600; /* Semibold */
  color: #1f2937; /* Tailwind gray-800 */
  border-bottom: none; /* Remove border */
  padding-bottom: 0;
}
.markdown-label-content :deep(h1) { font-size: 1.6em; } /* ~21px */
.markdown-label-content :deep(h2) { font-size: 1.4em; } /* ~18px */
.markdown-label-content :deep(h3) { font-size: 1.25em; }/* ~16px */
.markdown-label-content :deep(h4) { font-size: 1.1em; } /* ~14px */
.markdown-label-content :deep(h5) { font-size: 1em; font-weight: 600; }
.markdown-label-content :deep(h6) { font-size: 0.9em; font-weight: 600; color: #6b7280; } /* Lighter color for h6 */

/* Lists */
.markdown-label-content :deep(ul),
.markdown-label-content :deep(ol) {
  padding-left: 1.8em; /* Standard indentation */
  margin-top: 0.5em;
  margin-bottom: 0.75em;
}
.markdown-label-content :deep(ul) {
  list-style-type: disc;
}
.markdown-label-content :deep(ol) {
  list-style-type: decimal;
}
.markdown-label-content :deep(li) {
  margin-bottom: 0.3em;
  color: #4b5563; /* Match paragraph color */
  list-style-position: outside;
}
.markdown-label-content :deep(li::marker) {
  color: #9ca3af; /* Tailwind gray-400 for markers */
}

/* Inline Code */
.markdown-label-content :deep(code) {
  background-color: #f3f4f6; /* Tailwind gray-100 */
  color: #1e293b; /* Tailwind slate-800 */
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  border: 1px solid #e5e7eb; /* Tailwind gray-200 */
}

/* Code Blocks */
.markdown-label-content :deep(pre) {
  background-color: #f3f4f6; /* Tailwind gray-100 */
  color: #1e293b; /* Tailwind slate-800 */
  padding: 0.75em 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  border: 1px solid #e5e7eb; /* Tailwind gray-200 */
}
/* Reset styles for code *inside* pre */
.markdown-label-content :deep(pre code) {
  background-color: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  font-family: inherit;
  border: none;
}

/* Bold / Italic */
.markdown-label-content :deep(strong) {
  font-weight: 600; /* Semibold */
  color: #1f2937; /* Tailwind gray-800 */
}
.markdown-label-content :deep(em) {
  font-style: italic;
  color: inherit; /* Inherit paragraph/list color */
}

/* Blockquotes */
.markdown-label-content :deep(blockquote) {
  border-left: 3px solid #d1d5db; /* Tailwind gray-300 */
  padding-left: 1em;
  margin: 1em 0;
  font-style: normal; /* Often preferred over italic for quotes */
  color: #6b7280; /* Tailwind gray-500 */
}
.markdown-label-content :deep(blockquote p) {
    color: inherit;
    margin-bottom: 0.3em;
}

/* Links */
.markdown-label-content :deep(a) {
  color: #2563eb; /* Tailwind blue-600 */
  text-decoration: none; /* No underline by default */
}
.markdown-label-content :deep(a:hover) {
  color: #1d4ed8; /* Tailwind blue-700 */
  text-decoration: underline;
}

/* Images */
.markdown-label-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-top: 0.8em;
  margin-bottom: 0.8em;
  display: block;
}

/* Horizontal Rules */
.markdown-label-content :deep(hr) {
  border: 0;
  height: 1px;
  background-color: #e5e7eb; /* Tailwind gray-200 */
  margin: 1.5em 0;
}
</style>