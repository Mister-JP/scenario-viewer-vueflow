<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, onBeforeUnmount, watch } from 'vue'
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

const minNodeWidth = 120;
const minNodeHeight = 70;

// --- Get dimensions DIRECTLY from the store's node data ---
const storeNode = computed(() => store.nodes.find(n => n.id === props.id));

const reactiveWidth = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style?.width) {
    return parseFloat(sNode.style.width);
  }
  return sNode?.data?.width || 250; // Fallback
});

const reactiveHeight = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style?.height) {
    return parseFloat(sNode.style.height);
  }
  return sNode?.data?.height || 180; // Fallback
});


const nodeStyle = computed(() => {
  // This console log will now directly reflect changes from the store
  // console.log(`nodeStyle computed from store: width=${reactiveWidth.value}px, height=${reactiveHeight.value}px`);
  return {
    width: `${reactiveWidth.value}px`,
    height: `${reactiveHeight.value}px`,
  };
});

const handleResizeMouseDown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).classList.contains('node-resize-handle')) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();

  isResizing.value = true;
  resizeStartX.value = event.clientX;
  resizeStartY.value = event.clientY;
  resizeStartWidth.value = reactiveWidth.value; // Use current computed value from store
  resizeStartHeight.value = reactiveHeight.value; // Use current computed value from store

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
    <!-- TEMPORARY DEBUGGING REMOVED -->

    <MarkdownLabel
      :label="markdownContent"
      class="markdown-label-component"
    />

    <!-- Connection Handles -->
    <Handle id="top-source" type="source" :position="Position.Top" class="custom-handle" />
    <Handle id="top-target" type="target" :position="Position.Top" class="custom-handle custom-handle-target" />
    <Handle id="right-source" type="source" :position="Position.Right" class="custom-handle" />
    <Handle id="right-target" type="target" :position="Position.Right" class="custom-handle custom-handle-target" />
    <Handle id="bottom-source" type="source" :position="Position.Bottom" class="custom-handle" />
    <Handle id="bottom-target" type="target" :position="Position.Bottom" class="custom-handle custom-handle-target" />
    <Handle id="left-source" type="source" :position="Position.Left" class="custom-handle" />
    <Handle id="left-target" type="target" :position="Position.Left" class="custom-handle custom-handle-target" />

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
/* Styles remain the same as your last provided version */
.markdown-node-wrapper {
  background-color: #4A5568;
  border: 1px solid #2D3748;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  min-width: v-bind('minNodeWidth + "px"');
  min-height: v-bind('minNodeHeight + "px"');
}
.markdown-label-component {
  flex-grow: 1; margin: 4px; min-height: 0; min-width: 0; border-radius: 4px; overflow: hidden;
}
.custom-handle {
  @apply w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-900 shadow-md;
  opacity: 0.7; transition: opacity 0.2s, background-color 0.2s; z-index: 10; position: absolute;
}
.custom-handle[data-handlepos="top"] { top: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="right"] { right: -6px; top: 50%; transform: translateY(-50%); }
.custom-handle[data-handlepos="bottom"] { bottom: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="left"] { left: -6px; top: 50%; transform: translateY(-50%); }
.markdown-node-wrapper:hover .custom-handle,
:global(.vue-flow__node-selected) .custom-handle,
:global(.vue-flow__node-dragging) .custom-handle {
  opacity: 1;
}
.custom-handle:hover { @apply bg-sky-500; opacity: 1 !important; }
.node-resize-handle {
  position: absolute; bottom: 0px; right: 0px; width: 16px; height: 16px;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, #a0aec0 50%, #a0aec0 100%);
  border-bottom-right-radius: 6px; cursor: nwse-resize; opacity: 0.7;
  transition: opacity 0.2s, background-color 0.2s; z-index: 20;
}
.node-resize-handle:hover {
  opacity: 1; background: linear-gradient(135deg, transparent 0%, transparent 50%, #718096 50%, #718096 100%);
}
</style>