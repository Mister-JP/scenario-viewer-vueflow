<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
  label?: string | object;
  initialWidth?: number | string; // Can be number or string like '250px'
  initialHeight?: number | string; // Can be number or string like '150px'
}>();

const emit = defineEmits<{
  (e: 'update:dimensions', dimensions: { width: number; height: number }): void;
}>();

// --- Parse initial dimensions ---
const parseDimension = (dim: number | string | undefined, defaultValue: number): number => {
  if (typeof dim === 'string') {
    return parseInt(dim, 10) || defaultValue;
  }
  return dim || defaultValue;
};

// --- State for Resizing ---
const currentWidth = ref<number>(parseDimension(props.initialWidth, 250));
const currentHeight = ref<number | null>(props.initialHeight ? parseDimension(props.initialHeight, null) : null); // Allow auto height if initialHeight is not set or 0

const isResizing = ref(false);
const startX = ref(0);
const startY = ref(0);
const startWidth = ref(0);
const startHeight = ref(0);
const wrapperRef = ref<HTMLDivElement | null>(null);

const minWidth = 100;
const minHeight = 50;

// --- Watch for prop changes to update internal dimensions ---
watch(() => props.initialWidth, (newVal) => {
  currentWidth.value = parseDimension(newVal, minWidth);
});
watch(() => props.initialHeight, (newVal) => {
  // If new value is provided, use it; otherwise, keep existing or allow auto if it was null
  currentHeight.value = newVal ? parseDimension(newVal, minHeight) : currentHeight.value;
});


marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  smartypants: true
});

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

const handleMouseDown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).classList.contains('resize-handle')) {
    return;
  }
  isResizing.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  startWidth.value = wrapperRef.value?.offsetWidth || currentWidth.value;
  const currentElemHeight = wrapperRef.value?.offsetHeight;
  startHeight.value = currentHeight.value === null ? (currentElemHeight || minHeight) : currentHeight.value;

  if(currentHeight.value === null && currentElemHeight){
     currentHeight.value = currentElemHeight; // Set explicit height to resize from
  }

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  event.preventDefault();
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isResizing.value) return;
  const dx = event.clientX - startX.value;
  const dy = event.clientY - startY.value;
  const newWidth = Math.max(minWidth, startWidth.value + dx);
  const newHeight = Math.max(minHeight, startHeight.value + dy);
  currentWidth.value = newWidth;
  currentHeight.value = newHeight;
};

const handleMouseUp = () => {
  if (isResizing.value) {
    isResizing.value = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    // Emit the final dimensions
    emit('update:dimensions', { width: currentWidth.value, height: currentHeight.value || minHeight });
  }
};

const wrapperStyle = computed(() => ({
  width: `${currentWidth.value}px`,
  height: currentHeight.value !== null ? `${currentHeight.value}px` : 'auto',
}));

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});

// If height is auto, emit its actual rendered height once mounted and rendered
onMounted(async () => {
  await nextTick();
  if (currentHeight.value === null && wrapperRef.value) {
    const actualHeight = wrapperRef.value.offsetHeight;
    if (actualHeight > 0) {
        // Do not set currentHeight.value here if we want it to remain 'auto'
        // until explicitly resized.
        // Only emit if you want the parent to know the initial auto height.
        // For now, only emitting on resize to avoid potential loops if parent sets height back to auto.
        // emit('update:dimensions', { width: currentWidth.value, height: actualHeight });
    }
  }
});

</script>

<template>
  <div
    ref="wrapperRef"
    class="custom-markdown-label-wrapper resizable"
    :style="wrapperStyle"
    @mousedown.passive="handleMouseDown"
    >
    <div class="markdown-label-content" v-html="renderedMarkdown"></div>
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
  text-align: left;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid #e5e7eb;
  white-space: normal;
  position: relative;
  overflow: hidden;
  resize: none;
  min-width: v-bind(minWidth + 'px');
  min-height: v-bind(minHeight + 'px');
  display: flex; /* Ensure content area expands */
  flex-direction: column; /* Stack content and handle */
}

.markdown-label-content {
  width: 100%;
  height: 100%; /* Take available space */
  overflow: auto;
  padding-bottom: 10px; /* Space for resize handle not to overlap text */
  box-sizing: border-box;
  flex-grow: 1; /* Allow content to grow */
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: #cbd5e1;
  border: 1px solid #94a3b8;
  border-radius: 2px;
  cursor: nwse-resize;
  opacity: 0.6;
  transition: opacity 0.2s;
  z-index: 10; /* Ensure handle is clickable */
}
.resize-handle:hover {
  opacity: 1;
  background-color: #94a3b8;
}

/* --- Styles for v-html content using :deep() --- */
.markdown-label-content :deep(> *:first-child) { margin-top: 0; }
.markdown-label-content :deep(> *:last-child) { margin-bottom: 0; }
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