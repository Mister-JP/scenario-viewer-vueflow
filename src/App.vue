<script setup lang="ts">
import { VueFlow, useVueFlow, addEdge as addEdgeHelper } from '@vue-flow/core'
import type { Connection, Edge, Node } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from './stores/workspace'
import { computed, markRaw } from 'vue' // <-- IMPORTED markRaw

// Import your custom node
import ScenarioCardNode from './components/ScenarioCardNode.vue'

const workspaceStore = useWorkspaceStore()
const { nodes, edges, hostUrl } = storeToRefs(workspaceStore)

const { fitView, onPaneReady } = useVueFlow()

onPaneReady(({ fitView: fitViewInstance }) => {
  console.log('Vue Flow Pane is ready, fitting view.');
  fitViewInstance();
});

// Define custom node types, marking the component as raw
const nodeTypes = computed(() => ({
  scenarioCard: markRaw(ScenarioCardNode), // <-- USED markRaw
}))

const onConnect = (params: Connection | Edge) => {
  const newEdge: Edge = {
    ...params,
    id: `e${params.source}-${params.target}-${Date.now()}`,
    label: 'New Connection'
  }
  edges.value = addEdgeHelper(newEdge, edges.value)
  console.log('New connection made:', params);
}

const addNewNode = () => {
  const newNodeId = `scn-${nodes.value.length + 1}-${Date.now()}`;
  const newNode: Node = {
    id: newNodeId,
    type: 'scenarioCard',
    label: `Scenario ${nodes.value.length + 1}`, // This can be used by the custom node if needed
    position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
    data: { scenarioId: nodes.value.length + 1 }
  };
  nodes.value.push(newNode);
};

</script>

<template>
  <div class="w-screen h-screen flex flex-col bg-gray-800">
    <header class="bg-blue-600 text-white p-3 shadow-md flex justify-between items-center flex-shrink-0">
      <h1 class="text-lg font-semibold">Scenario Viewer</h1>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Host: {{ hostUrl }}</span>
        <button @click="workspaceStore.updateHostUrl(prompt('Enter new host URL:', hostUrl ? hostUrl : 'http://localhost:8080') || (hostUrl ? hostUrl : 'http://localhost:8080'))" class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 text-sm rounded">
          Edit Host
        </button>
        <button @click="addNewNode" class="bg-green-500 hover:bg-green-700 text-white py-1 px-2 text-sm rounded">
          Add Node
        </button>
        <button @click="fitView()" class="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 text-sm rounded">
          Fit View
        </button>
      </div>
    </header>

    <div class="flex-grow relative vue-flow-container">
      <!-- VueFlow Configuration Comments -->
      <!-- :fit-view-on-init is set to false because we call fitView manually via onPaneReady -->
      <!-- :default-viewport sets the initial zoom/pan state -->
      
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        @connect="onConnect"
        :fit-view-on-init="false"
        class="basic-flow"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.1"
        :max-zoom="4"
      >
        <!-- Components rendered inside VueFlow -->
        <Background :pattern-color="'#666'" :gap="20" />
        <MiniMap />
        <Controls />
      </VueFlow>
    </div>
  </div>
</template>

<style>
/* Ensure the Vue Flow container takes up all available space */
.vue-flow-container {
  width: 100%;
  height: 100%;
  overflow: hidden; /* Prevents scrollbars on this div if content overflows slightly */
}

.vue-flow__minimap {
  transform: scale(0.75);
  transform-origin: bottom right;
  background-color: rgba(40, 40, 40, 0.8); /* Darker minimap background */
  border-radius: 4px;
}

.vue-flow__controls {
  /* You can style controls if needed */
}

/* If you are exclusively using custom nodes, you might not need these default styles.
   However, they are harmless if `type: 'scenarioCard'` is always used for your main nodes.
*/
.vue-flow__node-default {
  @apply bg-gray-700 border-gray-500 text-white rounded-lg shadow-xl;
  padding: 8px 12px;
  font-size: 12px;
}

.vue-flow__node-input { /* For type: 'input' in initial store nodes */
 @apply bg-blue-700 border-blue-500 text-white rounded-lg shadow-xl;
  padding: 8px 12px;
  font-size: 12px;
}

.vue-flow__edge-path {
  stroke: #888;
}
.vue-flow__edge-text {
  fill: #ccc;
  font-size: 10px;
}
</style>