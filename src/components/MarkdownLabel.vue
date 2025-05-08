<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
  label?: string | object; // Expecting a string for markdown content
}>();

marked.setOptions({
  gfm: true,
  breaks: false, // Using false is a common default
  pedantic: false,
  smartypants: true
});

const renderedMarkdown = computed(() => {
  if (typeof props.label === 'string' && props.label) {
    try {
      return marked.parse(props.label) as string;
    } catch (e) {
      console.error("Error parsing Markdown in MarkdownLabel:", e);
      // Provide a user-friendly error message in the UI
      return '<p style="color: red; font-weight: bold; padding: 10px;">Error rendering Markdown content.</p>';
    }
  }
  return ''; // Return empty string if no label or not a string
});
</script>

<template>
  <div class="custom-markdown-label-wrapper">
    <div class="markdown-label-content" v-html="renderedMarkdown"></div>
  </div>
</template>

<style scoped>
.custom-markdown-label-wrapper {
  background-color: #ffffff; /* White background for the content area */
  color: #374151; /* Default text color (Tailwind gray-700) */
  padding: 10px 14px; /* Internal padding for content */
  border-radius: 3px; /* A subtle radius, less than the node's main radius */
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
  width: 100%; /* Fill width of parent (MarkdownNode's content area) */
  height: 100%; /* Fill height of parent */
  box-sizing: border-box; /* Padding included in width/height */
  display: flex; /* Allow content to grow and manage overflow */
  flex-direction: column;
  overflow: hidden; /* This wrapper hides scrollbars, the child div shows them */
}

.markdown-label-content {
  width: 100%;
  height: 100%;
  overflow: auto; /* This makes the content scrollable if it exceeds dimensions */
  box-sizing: border-box;
  flex-grow: 1; /* Ensure it takes up available space in the flex container */
}

/* --- Styles for v-html content using :deep() --- */
/* These styles ensure the HTML rendered from Markdown looks good. */
/* Keep all your existing :deep() styles here. Example subset below: */
.markdown-label-content :deep(> *:first-child) { margin-top: 0; }
.markdown-label-content :deep(> *:last-child) { margin-bottom: 0; }
.markdown-label-content :deep(p) { margin-top: 0; margin-bottom: 0.6em; color: #4b5563; }
.markdown-label-content :deep(h1), .markdown-label-content :deep(h2), .markdown-label-content :deep(h3), .markdown-label-content :deep(h4), .markdown-label-content :deep(h5), .markdown-label-content :deep(h6) { margin-top: 0.8em; margin-bottom: 0.4em; line-height: 1.3; font-weight: 600; color: #1f2937; border-bottom: none; padding-bottom: 0; }
.markdown-label-content :deep(h1) { font-size: 1.3em; }
.markdown-label-content :deep(h2) { font-size: 1.2em; }
.markdown-label-content :deep(h3) { font-size: 1.1em; }
.markdown-label-content :deep(ul), .markdown-label-content :deep(ol) { padding-left: 1.5em; margin-top: 0.4em; margin-bottom: 0.6em; }
.markdown-label-content :deep(ul) { list-style-type: disc; }
.markdown-label-content :deep(ol) { list-style-type: decimal; }
.markdown-label-content :deep(li) { margin-bottom: 0.2em; color: #4b5563; list-style-position: outside; }
.markdown-label-content :deep(li::marker) { color: #9ca3af; }
.markdown-label-content :deep(code) { background-color: #f3f4f6; color: #1e293b; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.85em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; border: 1px solid #e5e7eb; }
.markdown-label-content :deep(pre) { background-color: #f3f4f6; color: #1e293b; padding: 0.5em 0.7em; border-radius: 4px; overflow-x: auto; margin: 0.8em 0; font-size: 0.85em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; border: 1px solid #e5e7eb; }
.markdown-label-content :deep(pre code) { background-color: transparent; color: inherit; padding: 0; border-radius: 0; font-size: inherit; font-family: inherit; border: none; }
.markdown-label-content :deep(strong) { font-weight: 600; color: #1f2937; }
.markdown-label-content :deep(em) { font-style: italic; color: inherit; }
.markdown-label-content :deep(blockquote) { border-left: 3px solid #d1d5db; padding-left: 0.8em; margin: 0.8em 0; font-style: normal; color: #6b7280; }
.markdown-label-content :deep(a) { color: #2563eb; text-decoration: none; }
.markdown-label-content :deep(a:hover) { color: #1d4ed8; text-decoration: underline; }
.markdown-label-content :deep(img) { max-width: 100%; height: auto; border-radius: 4px; margin-top: 0.5em; margin-bottom: 0.5em; display: block; }
.markdown-label-content :deep(hr) { border: 0; height: 1px; background-color: #e5e7eb; margin: 1em 0; }
</style>