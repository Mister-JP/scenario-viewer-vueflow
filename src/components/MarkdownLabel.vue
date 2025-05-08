<!-- src/components/MarkdownLabel.vue -->
<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
  label?: string | object;
  // Optional initial dimensions (could be useful later)
  initialWidth?: number;
  initialHeight?: number;
}>();

// --- State for Resizing ---
// Use refs for reactive width and height
// Initialize with props or defaults
const currentWidth = ref<number>(props.initialWidth || 250); // Default width
const currentHeight = ref<number | null>(props.initialHeight || null); // Default to auto height initially
const isResizing = ref(false);
const startX = ref(0);
const startY = ref(0);
const startWidth = ref(0);
const startHeight = ref(0);
const wrapperRef = ref<HTMLDivElement | null>(null); // Ref for the main wrapper element

// --- Minimum Dimensions ---
const minWidth = 100;
const minHeight = 50;

// --- Marked Configuration ---
marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  smartypants: true
});

// --- Rendered Markdown ---
const renderedMarkdown = computed(() => {
  if (typeof props.label === 'string' && props.label) {
    try {
      return marked.parse(props.label) as string;
    } catch (e) {
      console.error("Error parsing Markdown in MarkdownLabel:", e);
      return '<p style="color: red; font-weight: bold;">Render Error</p>';
    }
  }
  return '';
});

// --- Resize Event Handlers ---
const handleMouseDown = (event: MouseEvent) => {
  // Only start resize if clicking the handle specifically
  if (!(event.target as HTMLElement).classList.contains('resize-handle')) {
    return;
  }

  isResizing.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  startWidth.value = wrapperRef.value?.offsetWidth || currentWidth.value;

  // If height is currently 'auto', get the actual rendered height
  const currentElemHeight = wrapperRef.value?.offsetHeight;
  startHeight.value = currentHeight.value || currentElemHeight || minHeight;
  // Set explicit height to start resizing from actual value if it was auto
  if(currentHeight.value === null && currentElemHeight){
     currentHeight.value = currentElemHeight;
  }


  // Attach listeners to the window to capture mouse movements anywhere
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  // Prevent default text selection/dragging
  event.preventDefault();
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isResizing.value) return;

  const dx = event.clientX - startX.value;
  const dy = event.clientY - startY.value;

  // Calculate new dimensions, applying minimum constraints
  const newWidth = Math.max(minWidth, startWidth.value + dx);
  const newHeight = Math.max(minHeight, startHeight.value + dy);

  currentWidth.value = newWidth;
  currentHeight.value = newHeight;
};

const handleMouseUp = () => {
  if (isResizing.value) {
    isResizing.value = false;
    // Remove window listeners
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }
};

// --- Style Calculation ---
const wrapperStyle = computed(() => ({
  width: `${currentWidth.value}px`,
  // Apply height only if it's not null (allowing auto initially)
  height: currentHeight.value !== null ? `${currentHeight.value}px` : 'auto',
  // Add resize cursor when hovering the handle area implicitly
  // cursor: isResizing.value ? 'nwse-resize' : 'default', // Cursor handled by handle CSS
}));

// --- Lifecycle Hooks for Cleanup ---
onBeforeUnmount(() => {
  // Ensure listeners are removed if component is unmounted while resizing
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});

</script>

<template>
  <div
    ref="wrapperRef"
    class="custom-markdown-label-wrapper resizable"
    :style="wrapperStyle"
    @mousedown.passive="handleMouseDown"
    >
    <!-- Content Area -->
    <div class="markdown-label-content" v-html="renderedMarkdown"></div>

    <!-- Resize Handle -->
    <div class="resize-handle"></div>
  </div>
</template>

<style scoped>
/* --- Styles for the Minimalistic Markdown Preview Card --- */
.custom-markdown-label-wrapper {
  background-color: #ffffff;
  color: #374151;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  /* max-width removed as width is now dynamic */
  text-align: left;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid #e5e7eb;
  white-space: normal;
  position: relative; /* Needed for absolute positioning of handle */
  overflow: hidden; /* Clip content, show scrollbars on content div if needed */
  resize: none; /* Disable browser default resize */
  min-width: v-bind(minWidth + 'px'); /* Apply CSS min-width */
  min-height: v-bind(minHeight + 'px');/* Apply CSS min-height */
}

.resizable {
   /* Indicate it can be resized, although handle provides specific cursor */
   /* cursor: grab; */ /* Optional: Cursor for the whole element */
}

.markdown-label-content {
  width: 100%;
  height: 100%;
  overflow: auto; /* Allow content scrolling if it overflows */
  padding-bottom: 10px; /* Add padding at bottom to avoid handle overlap */
  box-sizing: border-box;
}

/* Resize Handle Styling */
.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: #cbd5e1; /* Tailwind gray-300 */
  border: 1px solid #94a3b8; /* Tailwind slate-400 */
  border-radius: 2px;
  cursor: nwse-resize; /* Diagonal resize cursor */
  opacity: 0.6;
  transition: opacity 0.2s;
}
.resize-handle:hover {
  opacity: 1;
  background-color: #94a3b8;
}

/* --- Styles for v-html content using :deep() --- */
/* (Keep the minimalistic styles from the previous response here) */
.markdown-label-content :deep(> *:first-child) {
  margin-top: 0;
}
.markdown-label-content :deep(> *:last-child) {
  margin-bottom: 0;
}
.markdown-label-content :deep(p) { margin-top: 0; margin-bottom: 0.6em; color: #4b5563; }
.markdown-label-content :deep(h1), .markdown-label-content :deep(h2), .markdown-label-content :deep(h3), .markdown-label-content :deep(h4), .markdown-label-content :deep(h5), .markdown-label-content :deep(h6) { margin-top: 0.8em; margin-bottom: 0.4em; line-height: 1.3; font-weight: 600; color: #1f2937; border-bottom: none; padding-bottom: 0; }
.markdown-label-content :deep(h1) { font-size: 1.3em; }
.markdown-label-content :deep(h2) { font-size: 1.2em; }
.markdown-label-content :deep(h3) { font-size: 1.1em; }
.markdown-label-content :deep(h4) { font-size: 1.0em; font-weight: 600; }
.markdown-label-content :deep(h5) { font-size: 0.9em; font-weight: 600; }
.markdown-label-content :deep(h6) { font-size: 0.85em; font-weight: 600; color: #6b7280; }
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
.markdown-label-content :deep(blockquote p) { color: inherit; margin-bottom: 0.2em; }
.markdown-label-content :deep(a) { color: #2563eb; text-decoration: none; }
.markdown-label-content :deep(a:hover) { color: #1d4ed8; text-decoration: underline; }
.markdown-label-content :deep(img) { max-width: 100%; height: auto; border-radius: 4px; margin-top: 0.5em; margin-bottom: 0.5em; display: block; }
.markdown-label-content :deep(hr) { border: 0; height: 1px; background-color: #e5e7eb; margin: 1em 0; }
</style>