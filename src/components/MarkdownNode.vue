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
  const currentWidthPx = parseFloat(props.style?.width as string || '0');
  const currentHeightPx = parseFloat(props.style?.height as string || '0');

  if (dimensions.width !== currentWidthPx || dimensions.height !== currentHeightPx) {
    store.updateNodeDimensions(props.id, dimensions.width, dimensions.height);
  }
}

const markdownLabelKey = computed(() => `${props.id}-mdlabel-${nodeWidth.value}-${nodeHeight.value}`);

</script>

<template>
  <div
    class="markdown-node-wrapper bg-gray-700 border border-gray-600 rounded-md shadow-md flex flex-col relative"
    :style="{ width: nodeWidth, height: nodeHeight }"
    @dblclick.stop="handleDoubleClick"
  >
    <MarkdownLabel
      :key="markdownLabelKey"
      :label="markdownContent"
      :initial-width="nodeWidth"
      :initial-height="nodeHeight"
      @update:dimensions="handleDimensionsUpdate"
      class="flex-grow"
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
  /* REMOVE overflow: hidden; to prevent clipping of handles and ensure resize works as expected */
}

/* Corrected selectors for selected/dragging states and opacity */
.markdown-node-wrapper:hover .custom-handle,
.vue-flow__node-selected .custom-handle, /* VueFlow adds this class to the root node element */
.vue-flow__node-dragging .custom-handle {
  opacity: 1; /* Make fully visible on interaction */
}

.custom-handle {
  /* Changed to amber, increased default opacity, and ensured border is distinct */
  @apply w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-900 shadow-sm; /* Changed to amber, darker border for visibility */
  opacity: 0.6; /* Make them visible by default but slightly transparent */
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 20;
}
.custom-handle:hover {
  @apply bg-sky-500; /* Keep hover effect or change as desired */
  opacity: 1 !important;
}
.custom-handle-target {
  /* Optional: Slightly different style for target handles if needed for visual distinction */
  /* Example: @apply bg-pink-400; */
}

/* Remove external margin from MarkdownLabel via this specific rule */
/* Let MarkdownLabel fill the entire space of MarkdownNode's wrapper */
.markdown-node-wrapper > .custom-markdown-label-wrapper {
  margin: 0 !important; /* Ensure no margin from this rule */
  flex-grow: 1; /* Allow MarkdownLabel to take up available space */
}
</style>