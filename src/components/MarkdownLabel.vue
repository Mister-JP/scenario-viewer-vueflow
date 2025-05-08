<!-- src/components/MarkdownLabel.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps<{ label?: string | object }>();

const renderedMarkdown = computed(() => {
  // Ensure the label is a string before parsing
  if (typeof props.label === 'string' && props.label) {
    try {
      return marked.parse(props.label) as string; // Use marked.parse()
    } catch (e) {
      console.error("Error parsing Markdown:", e);
      return 'Error rendering Markdown'; // Fallback
    }
  }
  return ''; // Return empty if label is not a string or is empty
});
</script>

<template>
  <div class="custom-markdown-label-wrapper">
    <div class="markdown-label-content" v-html="renderedMarkdown"></div>
  </div>
</template>

<!-- 
  The styles for MarkdownLabel.vue are already in your provided CSS:
  Path: src/components/MarkdownLabel.vue?vue&type=style&index=0&lang.css 
-->