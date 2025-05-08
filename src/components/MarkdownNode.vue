<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import MarkdownLabel from './MarkdownLabel.vue'
import EditMarkdownNodeModal from './EditMarkdownNodeModal.vue'

const props = defineProps<NodeProps>()
const store = useWorkspaceStore()

const showEditModal = ref(false)
const markdownContent = computed(() => props.data?.markdownContent || '')

const nodeWidth = computed(() => {
  const styleWidth = props.style?.width;
  return typeof styleWidth === 'string' ? styleWidth : `${props.data?.width || 250}px`;
});

const nodeHeight = computed(() => {
  const styleHeight = props.style?.height;
  return typeof styleHeight === 'string' ? styleHeight : `${props.data?.height || 180}px`;
});

const handleDoubleClick = () => {
  showEditModal.value = true
}

const handleSaveMarkdown = (newContent: string) => {
  store.updateNodeData(props.id, { markdownContent: newContent })
  showEditModal.value = false
}

const handleCancelEdit = () => {
  showEditModal.value = false
}

const handleDimensionsUpdate = (dimensions: { width: number; height: number }) => {
  // Check if dimensions actually changed to prevent potential loops
  // Note: props.style.width/height will be strings like '250px'
  const currentWidthPx = parseFloat(props.style?.width as string || '0');
  const currentHeightPx = parseFloat(props.style?.height as string || '0');

  if (dimensions.width !== currentWidthPx || dimensions.height !== currentHeightPx) {
    store.updateNodeDimensions(props.id, dimensions.width, dimensions.height);
  }
}

// Ensure key for MarkdownLabel updates when dimensions change via props
// to force re-evaluation of its internal initialWidth/Height if needed.
const markdownLabelKey = computed(() => `${props.id}-mdlabel-${nodeWidth.value}-${nodeHeight.value}`);

</script>

<template>
  <div
    class="markdown-node-wrapper bg-gray-700 border border-gray-600 rounded-md shadow-md flex flex-col overflow-hidden relative"
    :style="{ width: nodeWidth, height: nodeHeight }"
    @dblclick.stop="handleDoubleClick"
  >
    <!-- Optional: Node Header (non-editable for now) -->
    <!-- <div class="node-header bg-gray-800 text-xs text-gray-400 px-2 py-1 border-b border-gray-600 cursor-move">
      Markdown Note
    </div> -->

    <MarkdownLabel
      :key="markdownLabelKey"
      :label="markdownContent"
      :initial-width="nodeWidth"
      :initial-height="nodeHeight"
      @update:dimensions="handleDimensionsUpdate"
      class="flex-grow m-1"
    />

    <!-- Handles (Source = outgoing, Target = incoming) -->
    <!-- Top Handles -->
    <Handle id="top-source" type="source" :position="Position.Top" class="custom-handle" :style="{ top: '-5px' }" />
    <Handle id="top-target" type="target" :position="Position.Top" class="custom-handle custom-handle-target" :style="{ top: '-5px' }" />

    <!-- Right Handles -->
    <Handle id="right-source" type="source" :position="Position.Right" class="custom-handle" :style="{ right: '-5px' }" />
    <Handle id="right-target" type="target" :position="Position.Right" class="custom-handle custom-handle-target" :style="{ right: '-5px' }" />

    <!-- Bottom Handles -->
    <Handle id="bottom-source" type="source" :position="Position.Bottom" class="custom-handle" :style="{ bottom: '-5px' }" />
    <Handle id="bottom-target" type="target" :position="Position.Bottom" class="custom-handle custom-handle-target" :style="{ bottom: '-5px' }" />

    <!-- Left Handles -->
    <Handle id="left-source" type="source" :position="Position.Left" class="custom-handle" :style="{ left: '-5px' }" />
    <Handle id="left-target" type="target" :position="Position.Left" class="custom-handle custom-handle-target" :style="{ left: '-5px' }" />

    <EditMarkdownNodeModal
      :show="showEditModal"
      :initial-value="markdownContent"
      @save="handleSaveMarkdown"
      @cancel="handleCancelEdit"
    />
  </div>
</template>

<style scoped>
.markdown-node-wrapper {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  min-width: 120px; /* Corresponds to MarkdownLabel's minWidth + padding/border */
  min-height: 70px; /* Corresponds to MarkdownLabel's minHeight + padding/border */
  display: flex;
  flex-direction: column;
}

.markdown-node-wrapper:hover .custom-handle,
.vue-flow__node-selected .markdown-node-wrapper .custom-handle,
.vue-flow__node-dragging .markdown-node-wrapper .custom-handle {
  opacity: 0.8;
}

.custom-handle {
  @apply w-3 h-3 bg-teal-400 rounded-full border-2 border-gray-800; /* Different color for MarkdownNode handles */
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 20; /* Ensure handles are above MarkdownLabel's resize handle if overlapping */
}
.custom-handle:hover {
  @apply bg-sky-500;
  opacity: 1 !important;
}
.custom-handle-target {
  /* Optional: Slightly different style for target handles if needed for visual distinction */
  /* Example: @apply bg-pink-400; */
}

/* The MarkdownLabel will have its own padding and border.
   If you want the node wrapper to have additional padding around MarkdownLabel: */
.markdown-node-wrapper > .custom-markdown-label-wrapper {
  margin: 2px; /* Small margin around the label component inside the node */
  flex-grow: 1; /* Allow MarkdownLabel to take up available space */
}
</style>