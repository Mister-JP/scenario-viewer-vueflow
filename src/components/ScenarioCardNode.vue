<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, onBeforeUnmount } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

const props = defineProps<NodeProps>()
const store = useWorkspaceStore()

const nodeRef = ref<HTMLDivElement | null>(null);
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);

const minNodeWidth = 200;
const minNodeHeight = 150;

const storeNode = computed(() => store.nodes.find(n => n.id === props.id));

const reactiveWidth = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style && typeof sNode.style === 'object' && 'width' in sNode.style) {
    const widthValue = (sNode.style as { width?: string }).width; // TS2339 fix
    if (widthValue) return parseFloat(widthValue);
  }
  return 350; // Default width if not set in style
});

const reactiveHeight = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style && typeof sNode.style === 'object' && 'height' in sNode.style) {
    const heightValue = (sNode.style as { height?: string }).height; // TS2339 fix
    if (heightValue) return parseFloat(heightValue);
  }
  return 250; // Default height if not set in style
});

const nodeStyle = computed(() => ({
  width: `${reactiveWidth.value}px`,
  height: `${reactiveHeight.value}px`,
}));

const handleResizeMouseDown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).classList.contains('node-resize-handle')) {
    return;
  }
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

const iframeSrc = computed(() => {
  if (props.data && (typeof props.data.scenarioId === 'string' || typeof props.data.scenarioId === 'number')) { 
    const baseUrl = store.hostUrl.replace(/\/$/, '');
    return `${baseUrl}?scenario=${encodeURIComponent(props.data.scenarioId)}`;
  }
  return 'about:blank';
})

const cardLabel = computed(() => props.label || `Scenario: ${props.data?.scenarioId || props.id}`)

const editScenarioId = () => {
  const currentId = props.data?.scenarioId;
  const newIdString = window.prompt(`Enter new Scenario ID for node "${props.id}":`, currentId !== undefined ? String(currentId) : '');

  if (newIdString !== null) { 
    if (newIdString.trim() !== "") {
      store.updateNodeScenarioId(props.id, newIdString.trim());
    } else {
      window.alert('Invalid Scenario ID. It cannot be empty.');
    }
  }
}

</script>

<template>
  <div
    ref="nodeRef"
    class="scenario-card bg-gray-700 border border-gray-600 rounded-lg shadow-lg flex flex-col overflow-hidden"
    :style="nodeStyle"
    @mousedown.left="handleResizeMouseDown"
  >
    <div class="card-header bg-gray-800 text-white p-2 text-sm font-semibold border-b border-gray-600 cursor-move flex justify-between items-center">
      <span>{{ cardLabel }}</span>
      <button
        @click.stop="editScenarioId"
        title="Edit Scenario ID"
        class="edit-scenario-btn p-1 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        ✏️
      </button>
    </div>
    <div class="card-content flex-grow overflow-hidden">
        <iframe
        :key="`iframe-${props.id}-${props.data?.scenarioId}`"
        :src="iframeSrc"
        frameborder="0"
        class="w-full h-full"
        :title="`Scenario ${props.data?.scenarioId}`"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        ></iframe>
    </div>

    <Handle id="top-source" type="source" :position="Position.Top" class="custom-handle" />
    <Handle id="top-target" type="target" :position="Position.Top" class="custom-handle custom-handle-target" />
    <Handle id="right-source" type="source" :position="Position.Right" class="custom-handle" />
    <Handle id="right-target" type="target" :position="Position.Right" class="custom-handle custom-handle-target" />
    <Handle id="bottom-source" type="source" :position="Position.Bottom" class="custom-handle" />
    <Handle id="bottom-target" type="target" :position="Position.Bottom" class="custom-handle custom-handle-target" />
    <Handle id="left-source" type="source" :position="Position.Left" class="custom-handle" />
    <Handle id="left-target" type="target" :position="Position.Left" class="custom-handle custom-handle-target" />

    <div class="node-resize-handle"></div>
  </div>
</template>

<style scoped>
.scenario-card {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  min-width: v-bind('minNodeWidth + "px"');
  min-height: v-bind('minNodeHeight + "px"');
  position: relative;
}
.card-header {
  user-select: none;
}
.card-content {
  min-height: 0;
}
.edit-scenario-btn {
  font-size: 0.8rem;
  line-height: 1;
}
.custom-handle {
  @apply w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-900 shadow-md;
  opacity: 0.7;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 10;
  position: absolute;
}
.custom-handle[data-handlepos="top"] { top: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="right"] { right: -6px; top: 50%; transform: translateY(-50%); }
.custom-handle[data-handlepos="bottom"] { bottom: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="left"] { left: -6px; top: 50%; transform: translateY(-50%); }
.scenario-card:hover .custom-handle,
:global(.vue-flow__node-selected) .custom-handle,
:global(.vue-flow__node-dragging) .custom-handle {
  opacity: 1;
}
.custom-handle:hover {
  @apply bg-sky-500;
  opacity: 1 !important;
}
.node-resize-handle {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, #a0aec0 50%, #a0aec0 100%);
  border-bottom-right-radius: 6px;
  cursor: nwse-resize;
  opacity: 0.7;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 20;
}
.node-resize-handle:hover {
  opacity: 1;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, #718096 50%, #718096 100%);
}
</style>