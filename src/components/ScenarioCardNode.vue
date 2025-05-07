<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { computed } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

const props = defineProps<NodeProps>()

const store = useWorkspaceStore()

const iframeSrc = computed(() => {
  if (props.data && typeof props.data.scenarioId === 'number') {
    const baseUrl = store.hostUrl.replace(/\/$/, '');
    return `${baseUrl}?scenario=${props.data.scenarioId}`;
  }
  return 'about:blank';
})

const cardLabel = computed(() => props.label || `Scenario ${props.data?.scenarioId || props.id}`)

</script>

<template>
  <div class="scenario-card bg-gray-700 border border-gray-600 rounded-lg shadow-lg flex flex-col overflow-hidden w-[350px] h-[250px]">
    <div class="card-header bg-gray-800 text-white p-2 text-sm font-semibold border-b border-gray-600 cursor-move"> <!-- Added cursor-move to header -->
      {{ cardLabel }}
    </div>
    <div class="card-content flex-grow overflow-hidden">
      <iframe
        :src="iframeSrc"
        frameborder="0"
        class="w-full h-full"
        :title="`Scenario ${props.data?.scenarioId}`"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      ></iframe>
    </div>

    <!-- Connection Handles -->
    <Handle type="source" :position="Position.Top" class="custom-handle" />
    <Handle type="target" :position="Position.Top" class="custom-handle custom-handle-target" :style="{ top: '-6px' }" /> <!-- Example style adjustment -->

    <Handle type="source" :position="Position.Right" class="custom-handle" />
    <Handle type="target" :position="Position.Right" class="custom-handle custom-handle-target" :style="{ right: '-6px' }" />

    <Handle type="source" :position="Position.Bottom" class="custom-handle" />
    <Handle type="target" :position="Position.Bottom" class="custom-handle custom-handle-target" :style="{ bottom: '-6px' }" />

    <Handle type="source" :position="Position.Left" class="custom-handle" />
    <Handle type="target" :position="Position.Left" class="custom-handle custom-handle-target" :style="{ left: '-6px' }" />
  </div>
</template>

<style scoped>
.scenario-card {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.card-header {
  user-select: none;
}

.custom-handle {
  @apply w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-700;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10; /* Ensure handles are above the card content for clicking */
}
.scenario-card:hover .custom-handle,
.vue-flow__node-selected .custom-handle, /* Show handles when node is selected */
.vue-flow__node-dragging .custom-handle { /* Show handles when node is dragging */
  opacity: 0.8;
}
.custom-handle:hover {
  @apply bg-sky-500;
  opacity: 1 !important;
}

/* Optional: Slightly different color for target handles */
.custom-handle-target {
   /* @apply bg-emerald-400; */
}

/*
  Vue Flow's default handle positioning is inside the node.
  If you want them slightly outside like Draw.io, you might need to
  use absolute positioning relative to the node or negative margins
  and adjust their `top`, `left`, `right`, `bottom` style properties.
  The :style bindings above are examples of how you might nudge them.
  The exact values will depend on handle size and border width.
*/
</style>