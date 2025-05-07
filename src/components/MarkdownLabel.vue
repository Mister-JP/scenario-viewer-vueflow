<script setup lang="ts">
import { computed, onMounted } from 'vue' // Added onMounted
import { marked } from 'marked'

const props = defineProps<{
  label: string | undefined
}>()
console.log('[MarkdownLabel] Received label prop:', props.label); // Log received prop

marked.setOptions({
  breaks: true, // Convert single line breaks in input into <br> tags
  gfm: true, // Use GitHub Flavored Markdown
});

const renderedHtml = computed(() => {
  // Ensure label is treated as a string, default to empty string if undefined/null
  const markdownInput = typeof props.label === 'string' ? props.label : '';
  const html = markdownInput ? marked.parse(markdownInput) : '';
  console.log('[MarkdownLabel] Rendered HTML for "'+ markdownInput +'":', html); // Log parsed HTML
  return html;
})

onMounted(() => {
    console.log('[MarkdownLabel] Component mounted for label:', props.label); // Log when mounted
})
</script>

<template>
  <div class="custom-markdown-label-wrapper">
    <!-- Use v-html carefully. Ensure labels are from trusted sources or sanitize. -->
    <div v-html="renderedHtml" class="markdown-label-content"></div>
  </div>
</template>

<style>
/* Styles for the wrapper providing the background and padding */
.custom-markdown-label-wrapper {
  background-color: rgba(50, 50, 50, 0.85); /* Dark semi-transparent background */
  color: #fafafa; /* Light text */
  padding: 6px 10px; /* Padding inside the background */
  border-radius: 5px;
  font-size: 11px;
  line-height: 1.4;
  display: inline-block; /* Crucial: Makes the wrapper size to its content */
  max-width: 250px; /* Optional: Prevents labels from becoming excessively wide */
  text-align: left; /* Ensures content inside aligns left by default */
  box-shadow: 0 1px 3px rgba(0,0,0,0.3); /* Subtle shadow for depth */
  white-space: normal; /* Allow text wrapping */
}

/* Styles for the content rendered from Markdown */
.markdown-label-content {
  /* Reset potential parent styles */
}
.markdown-label-content > *:first-child {
  margin-top: 0; /* Remove top margin from the first rendered HTML element (e.g., <p>, <h2>) */
}
.markdown-label-content > *:last-child {
  margin-bottom: 0; /* Remove bottom margin from the last rendered HTML element */
}
.markdown-label-content p {
  margin: 0 0 0.3em 0; /* Consistent paragraph spacing */
}
.markdown-label-content h1,
.markdown-label-content h2,
.markdown-label-content h3,
.markdown-label-content h4,
.markdown-label-content h5,
.markdown-label-content h6 {
  margin-top: 0.5em;
  margin-bottom: 0.2em;
  line-height: 1.2;
  font-weight: 600; /* Make headings bolder */
}
.markdown-label-content h1 { font-size: 1.5em; } /* 16.5px */
.markdown-label-content h2 { font-size: 1.3em; } /* 14.3px */
.markdown-label-content h3 { font-size: 1.15em; } /* 12.65px */
/* Adjust heading sizes as needed */

.markdown-label-content ul,
.markdown-label-content ol {
  padding-left: 1.2em; /* Indent lists */
  margin-top: 0.3em;
  margin-bottom: 0.3em;
}
.markdown-label-content li {
  margin-bottom: 0.1em;
}

.markdown-label-content code {
  background-color: rgba(255, 255, 255, 0.15); /* Slightly lighter code background */
  padding: 0.15em 0.4em;
  border-radius: 3px;
  font-size: 0.9em; /* Slightly smaller code font */
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.markdown-label-content strong {
  font-weight: bold;
}
.markdown-label-content em {
  font-style: italic;
}
.markdown-label-content blockquote {
  border-left: 3px solid #777;
  padding-left: 0.8em;
  margin-left: 0;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-style: italic;
  color: #ccc;
}
.markdown-label-content a {
    color: #87CEEB; /* Sky blue links */
    text-decoration: underline;
}
.markdown-label-content a:hover {
    color: #ADD8E6; /* Lighter blue on hover */
}
</style>