<!-- src/pages/MarkdownTestPage.vue -->
<script setup lang="ts">
import { ref } from 'vue';
// We no longer need 'computed' or 'marked' here
import MarkdownLabel from '../components/MarkdownLabel.vue'; // Import the component

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

// No need for renderedMarkdown computed property here anymore

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
        <!-- Use the MarkdownLabel component directly -->
        <!-- Pass the textarea content as the 'label' prop -->
        <MarkdownLabel :label="markdownInput" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base styles for the page structure - KEEP THESE */
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

/* --- Styles for the Markdown Preview Card are REMOVED from here --- */
/* They now live inside MarkdownLabel.vue */

</style>