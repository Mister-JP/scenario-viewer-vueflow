<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, onBeforeUnmount } from 'vue' // Added ref, onBeforeUnmount
import { useWorkspaceStore } from '../stores/workspace'

const props = defineProps<NodeProps>()
const store = useWorkspaceStore()

// --- Sizing and Resizing Logic ---
const nodeRef = ref<HTMLDivElement | null>(null); // For potential future use, or direct mousedown if preferred
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);

const minNodeWidth = 200; // Minimum width for scenario card
const minNodeHeight = 150; // Minimum height for scenario card

const storeNode = computed(() => store.nodes.find(n => n.id === props.id));

const reactiveWidth = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style?.width) {
    return parseFloat(sNode.style.width);
  }
  return 350; // Fallback default width
});

const reactiveHeight = computed(() => {
  const sNode = storeNode.value;
  if (sNode?.style?.height) {
    return parseFloat(sNode.style.height);
  }
  return 250; // Fallback default height
});

const nodeStyle = computed(() => ({
  width: `${reactiveWidth.value}px`,
  height: `${reactiveHeight.value}px`,
}));

const handleResizeMouseDown = (event: MouseEvent) => {
  // Important: Only trigger resize if mousedown is on the resize handle
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
// --- End Sizing and Resizing Logic ---

const iframeSrc = computed(() => {
  // console.log(`ScenarioCardNode (${props.id}): iframeSrc computed. scenarioId: ${props.data?.scenarioId}, hostUrl: ${store.hostUrl}`);
  if (props.data && typeof props.data.scenarioId === 'number') {
    const baseUrl = store.hostUrl.replace(/\/$/, '');
    return `${baseUrl}?scenario=${props.data.scenarioId}`;
  }
  return 'about:blank';
})

const cardLabel = computed(() => props.label || `Scenario ${props.data?.scenarioId || props.id}`)

const editScenarioId = () => {
  const currentId = props.data?.scenarioId;
  const newIdString = prompt(`Enter new Scenario ID for node "${props.id}":`, currentId !== undefined ? String(currentId) : '');

  if (newIdString !== null) {
    const newId = parseInt(newIdString, 10);
    if (!isNaN(newId) && newId > 0) {
      store.updateNodeScenarioId(props.id, newId);
    } else {
      alert('Invalid Scenario ID. Please enter a positive number.');
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
    <!-- TEMPORARY DEBUGGING (optional) -->
    <!-- <pre style="position: absolute; top: 0; left: 0; color: yellow; font-size: 10px; z-index: 1000; background: rgba(0,0,0,0.5); padding: 2px; border-radius: 3px; pointer-events: none;">
      {{ nodeStyle }}
    </pre> -->

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

    <!-- Connection Handles with unique IDs -->
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
  /* Removed fixed w/h, now controlled by :style and min-width/height */
  min-width: v-bind('minNodeWidth + "px"');
  min-height: v-bind('minNodeHeight + "px"');
  position: relative; /* Needed for absolute positioning of resize handle and handles */
  /* display: flex; and flex-direction: column; are already applied by Tailwind classes */
}

.card-header {
  user-select: none; /* Prevent text selection when dragging header for node move */
}

.card-content {
  min-height: 0; /* Allows flex-grow to shrink content area properly */
}

.edit-scenario-btn {
  font-size: 0.8rem;
  line-height: 1;
}

.custom-handle {
  @apply w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-900 shadow-md; /* Matched MarkdownNode */
  opacity: 0.7; /* Matched MarkdownNode */
  transition: opacity 0.2s, background-color 0.2s; /* Matched MarkdownNode */
  z-index: 10;
  position: absolute; /* Ensure handles are positioned relative to the card */
}

/* Adjust handle positions to be exactly on the edge, similar to MarkdownNode */
.custom-handle[data-handlepos="top"] { top: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="right"] { right: -6px; top: 50%; transform: translateY(-50%); }
.custom-handle[data-handlepos="bottom"] { bottom: -6px; left: 50%; transform: translateX(-50%); }
.custom-handle[data-handlepos="left"] { left: -6px; top: 50%; transform: translateY(-50%); }


/* Show handles on hover of card, or if node is selected/dragging - Matched MarkdownNode */
.scenario-card:hover .custom-handle,
:global(.vue-flow__node-selected) .custom-handle, /* For selected via VueFlow global class */
:global(.vue-flow__node-dragging) .custom-handle { /* For dragging via VueFlow global class */
  opacity: 1;
}

.custom-handle:hover {
  @apply bg-sky-500;
  opacity: 1 !important;
}

/* Resize Handle Style - Copied from MarkdownNode.vue */
.node-resize-handle {
  position: absolute;
  bottom: 0px; /* Placed at the very corner */
  right: 0px;  /* Placed at the very corner */
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, #a0aec0 50%, #a0aec0 100%); /* Tailwind gray-400 equivalent */
  border-bottom-right-radius: 6px; /* Match node's border-radius slightly */
  cursor: nwse-resize;
  opacity: 0.7;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 20; /* Above handles but below modal if any */
}

.node-resize-handle:hover {
  opacity: 1;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, #718096 50%, #718096 100%); /* Tailwind gray-500 equivalent */
}
</style>