<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, onBeforeUnmount, watch, toRaw, onMounted, nextTick } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import MarkdownLabel from './MarkdownLabel.vue'
import EditMarkdownNodeModal from './EditMarkdownNodeModal.vue'

const props = defineProps<NodeProps>()
const store = useWorkspaceStore()

console.log(`[MarkdownNode ${props.id}] Initializing. Initial props.data:`, JSON.parse(JSON.stringify(props.data)));

// Local reactive state for the markdown content within this node instance
const localMarkdownContent = ref(props.data?.markdownContent || '');

// Watch for external changes to props.data.markdownContent (e.g., from loading a layout)
// and update the local state if it's different.
watch(() => props.data?.markdownContent, (newContentFromProps) => {
  console.log(`[MarkdownNode ${props.id}] props.data.markdownContent externally changed to: "${newContentFromProps?.substring(0,30)}..."`);
  if (newContentFromProps !== undefined && newContentFromProps !== localMarkdownContent.value) {
    console.log(`[MarkdownNode ${props.id}] Updating localMarkdownContent from props.`);
    localMarkdownContent.value = newContentFromProps;
  }
}, { immediate: false }); // Don't run immediately, let initial value be set by ref()

const showEditModal = ref(false)

// --- Sizing and Resizing Logic ---
const nodeRef = ref<HTMLDivElement | null>(null);
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);

const minNodeWidth = 120;
const minNodeHeight = 70;

const storeNode = computed(() => store.nodes.find(n => n.id === props.id));

const reactiveWidth = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style?.width) {
    return parseFloat(sNode.style.width);
  }
  return sNode?.data?.width || 250;
});

const reactiveHeight = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style?.height) {
    return parseFloat(sNode.style.height);
  }
  return sNode?.data?.height || 180;
});

const nodeStyle = computed(() => ({
  width: `${reactiveWidth.value}px`,
  height: `${reactiveHeight.value}px`,
}));

const handleResizeMouseDown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).classList.contains('node-resize-handle')) return;
  event.preventDefault();
  event.stopPropagation();
  isResizing.value = true;
  resizeStartX.value = event.clientX;
  resizeStartY.value = event.clientY;
  resizeStartWidth.value = reactiveWidth.value;
  resizeStartHeight.value = reactiveHeight.value;
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
  console.log(`[MarkdownNode ${props.id}] Double clicked. Opening modal. Current localMarkdownContent: "${localMarkdownContent.value.substring(0,30)}..."`);
  showEditModal.value = true;
}

const handleSaveMarkdown = (newContent: string) => {
  console.log(`[MarkdownNode ${props.id}] handleSaveMarkdown called. New content for local: "${newContent.substring(0,30)}..."`);
  localMarkdownContent.value = newContent; // Update local state FIRST
  console.log(`[MarkdownNode ${props.id}] localMarkdownContent is now: "${localMarkdownContent.value.substring(0,30)}..."`);
  
  // Now, tell the store to update its version.
  store.updateNodeData(props.id, { markdownContent: newContent });
  console.log(`[MarkdownNode ${props.id}] Called store.updateNodeData.`);
  
  showEditModal.value = false;
}

const handleCancelEdit = () => {
  console.log(`[MarkdownNode ${props.id}] Modal cancelled.`);
  showEditModal.value = false;
}

// For the modal, pass the localMarkdownContent
const initialModalValue = computed(() => localMarkdownContent.value);

</script>

<template>
  <div
    ref="nodeRef"
    class="markdown-node-wrapper"
    :style="nodeStyle"
    @dblclick.stop="handleDoubleClick"
    @mousedown.left="handleResizeMouseDown"
  >
    <div style="position: absolute; top: -20px; left: 0; font-size: 10px; color: orange; background: rgba(0,0,0,0.5); padding: 2px; z-index: 100;">
      Local: {{ localMarkdownContent?.substring(0,15) }}...
    </div>

    <!-- Bind to localMarkdownContent -->
    <MarkdownLabel
      :label="localMarkdownContent" 
      class="markdown-label-component"
    />

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
      :initial-value="initialModalValue"
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