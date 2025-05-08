<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, onBeforeUnmount } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import MarkdownLabel from './MarkdownLabel.vue'
import EditMarkdownNodeModal from './EditMarkdownNodeModal.vue'

const props = defineProps<NodeProps>()
const store = useWorkspaceStore()

const showEditModal = ref(false)
const markdownContent = computed(() => props.data?.markdownContent || '')

// --- Sizing and Resizing Logic for the Node itself ---
const nodeRef = ref<HTMLDivElement | null>(null);
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);

const minNodeWidth = 120; // Minimum overall width for the node
const minNodeHeight = 70;  // Minimum overall height for the node

const currentNodeWidth = computed(() => {
  const styleWidth = props.style?.width;
  return typeof styleWidth === 'string' ? parseFloat(styleWidth) : (props.data?.width || 250);
});

const currentNodeHeight = computed(() => {
  const styleHeight = props.style?.height;
  return typeof styleHeight === 'string' ? parseFloat(styleHeight) : (props.data?.height || 180);
});

const nodeStyle = computed(() => ({
  width: `${currentNodeWidth.value}px`,
  height: `${currentNodeHeight.value}px`,
}));

const handleResizeMouseDown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).classList.contains('node-resize-handle')) {
    return;
  }
  event.preventDefault();
  event.stopPropagation(); // Important to prevent node dragging via Vue Flow

  isResizing.value = true;
  resizeStartX.value = event.clientX;
  resizeStartY.value = event.clientY;
  resizeStartWidth.value = currentNodeWidth.value;
  resizeStartHeight.value = currentNodeHeight.value;

  window.addEventListener('mousemove', handleResizeMouseMove);
  window.addEventListener('mouseup', handleResizeMouseUp);
};

const handleResizeMouseMove = (event: MouseEvent) => {
  if (!isResizing.value) return;
  const dx = event.clientX - resizeStartX.value;
  const dy = event.clientY - resizeStartY.value;

  let newWidth = Math.max(minNodeWidth, resizeStartWidth.value + dx);
  let newHeight = Math.max(minNodeHeight, resizeStartHeight.value + dy);

  store.updateNodeDimensions(props.id, newWidth, newHeight);
};

const handleResizeMouseUp = () => {
  if (isResizing.value) {
    isResizing.value = false;
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleResizeMouseMove);
  window.removeEventListener('mouseup', handleResizeMouseUp);
});

// --- Modal Logic ---
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
</script>

<template>
  <div
    ref="nodeRef"
    class="markdown-node-wrapper"
    :style="nodeStyle"
    @dblclick.stop="handleDoubleClick"
    @mousedown.left="handleResizeMouseDown"
  >
    <MarkdownLabel
      :label="markdownContent"
      class="markdown-label-component"
    />

    <!-- Connection Handles: Positioned absolutely relative to this wrapper -->
    <Handle id="top-source" type="source" :position="Position.Top" class="custom-handle" />
    <Handle id="top-target" type="target" :position="Position.Top" class="custom-handle custom-handle-target" />
    <Handle id="right-source" type="source" :position="Position.Right" class="custom-handle" />
    <Handle id="right-target" type="target" :position="Position.Right" class="custom-handle custom-handle-target" />
    <Handle id="bottom-source" type="source" :position="Position.Bottom" class="custom-handle" />
    <Handle id="bottom-target" type="target" :position="Position.Bottom" class="custom-handle custom-handle-target" />
    <Handle id="left-source" type="source" :position="Position.Left" class="custom-handle" />
    <Handle id="left-target" type="target" :position="Position.Left" class="custom-handle custom-handle-target" />

    <!-- Resize Handle for the Node itself -->
    <div class="node-resize-handle"></div>

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
  background-color: #4A5568; /* tailwindcss gray-700 */
  border: 1px solid #2D3748; /* tailwindcss gray-800 */
  border-radius: 8px; /* Slightly larger radius for the main node */
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); /* md shadow */
  display: flex;
  flex-direction: column;
  position: relative; /* Crucial for absolute positioning of handles and resize corner */
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  min-width: v-bind(minNodeWidth + 'px');
  min-height: v-bind(minNodeHeight + 'px');
  /* overflow: hidden; NO LONGER NEEDED - REMOVE TO SHOW HANDLES */
}

.markdown-label-component {
  flex-grow: 1; /* Makes MarkdownLabel fill the available space */
  margin: 4px; /* Creates a small "frame" of the node's background around the white label */
  min-height: 0; /* Essential for flex children that need to shrink and scroll within */
  min-width: 0;  /* Essential for flex children that need to shrink and scroll within */
  border-radius: 4px; /* Give the inner label a slightly smaller radius */
  overflow: hidden; /* The label component itself will handle its content scrolling */
}

/* --- Connection Handles --- */
.custom-handle {
  @apply w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-900 shadow-md; /* Amber color, dark border, shadow */
  opacity: 0.7; /* Start somewhat visible */
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 10; /* Ensure handles are clickable */
  position: absolute; /* Positioned relative to .markdown-node-wrapper */
}

/* Precise positioning for handles on the node's perimeter */
.custom-handle[data-handlepos="top"] { top: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="right"] { right: -6px; top: 50%; transform: translateY(-50%); }
.custom-handle[data-handlepos="bottom"] { bottom: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="left"] { left: -6px; top: 50%; transform: translateY(-50%); }

/* Make handles fully visible on node hover/selection/drag */
.markdown-node-wrapper:hover .custom-handle,
:global(.vue-flow__node-selected) .custom-handle,
:global(.vue-flow__node-dragging) .custom-handle {
  opacity: 1;
}
.custom-handle:hover {
  @apply bg-sky-500; /* Visual feedback on handle hover */
  opacity: 1 !important; /* Ensure it's fully opaque */
}
.custom-handle-target {
  /* Optional: if you want target handles to look slightly different */
  /* e.g., @apply bg-pink-400; */
}

/* --- Node Resize Handle (bottom-right corner of the node) --- */
.node-resize-handle {
  position: absolute;
  bottom: 0px; /* Align with bottom border */
  right: 0px;  /* Align with right border */
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, #a0aec0 50%, #a0aec0 100%); /* Tailwind gray-500 */
  border-bottom-right-radius: 6px; /* Match node's corner radius */
  cursor: nwse-resize;
  opacity: 0.7;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 20; /* Ensure it's above other elements like handles if overlapping */
}
.node-resize-handle:hover {
  opacity: 1;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, #718096 50%, #718096 100%); /* Tailwind gray-600 */
}
</style>