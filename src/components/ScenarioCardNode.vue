<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { computed } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

const props = defineProps<NodeProps>()

const store = useWorkspaceStore()

const iframeSrc = computed(() => {
  console.log(`ScenarioCardNode (${props.id}): iframeSrc computed. scenarioId: ${props.data?.scenarioId}, hostUrl: ${store.hostUrl}`);
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
  <div class="scenario-card bg-gray-700 border border-gray-600 rounded-lg shadow-lg flex flex-col overflow-hidden w-[350px] h-[250px]">
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
    <Handle id="top-source" type="source" :position="Position.Top" class="custom-handle" :style="{ top: '-5px' }" />
    <Handle id="top-target" type="target" :position="Position.Top" class="custom-handle custom-handle-target" :style="{ top: '-5px' }" />

    <Handle id="right-source" type="source" :position="Position.Right" class="custom-handle" :style="{ right: '-5px' }" />
    <Handle id="right-target" type="target" :position="Position.Right" class="custom-handle custom-handle-target" :style="{ right: '-5px' }" />

    <Handle id="bottom-source" type="source" :position="Position.Bottom" class="custom-handle" :style="{ bottom: '-5px' }" />
    <Handle id="bottom-target" type="target" :position="Position.Bottom" class="custom-handle custom-handle-target" :style="{ bottom: '-5px' }" />

    <Handle id="left-source" type="source" :position="Position.Left" class="custom-handle" :style="{ left: '-5px' }" />
    <Handle id="left-target" type="target" :position="Position.Left" class="custom-handle custom-handle-target" :style="{ left: '-5px' }" />
  </div>
</template>

<style scoped>
.scenario-card {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.card-header {
  user-select: none;
}

.edit-scenario-btn {
  font-size: 0.8rem;
  line-height: 1;
}

.custom-handle {
  @apply w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-800;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}
.scenario-card:hover .custom-handle,
.vue-flow__node-selected .custom-handle,
.vue-flow__node-dragging .custom-handle {
  opacity: 0.8;
}
.custom-handle:hover {
  @apply bg-sky-500;
  opacity: 1 !important;
}
/* Optional: Add specific styles for target handles if needed, e.g., for debugging */
/* .custom-handle-target { */
  /* Example: outline: 1px dashed blue; */
/* } */
</style>