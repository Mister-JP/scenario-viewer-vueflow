<script setup lang="ts">
import { VueFlow, useVueFlow, addEdge as addEdgeHelper } from '@vue-flow/core'
import type { Connection, Edge, Node } from '@vue-flow/core' // Added Node type here for the addNewNode function
import { Background } from '@vue-flow/background'     // Specific import for Background
import { MiniMap } from '@vue-flow/minimap'           // Specific import for MiniMap
import { Controls } from '@vue-flow/controls'         // Specific import for Controls

import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from './stores/workspace'

const workspaceStore = useWorkspaceStore()
const { nodes, edges, hostUrl } = storeToRefs(workspaceStore)

const { fitView } = useVueFlow()

const onConnect = (params: Connection | Edge) => { // params can be Connection or Edge
  const newEdge: Edge = { // Ensure we create an Edge object
    ...params,
    id: `e${params.source}-${params.target}-${Math.random().toString(36).substring(7)}`,
    label: 'New Connection'
  }
  edges.value = addEdgeHelper(newEdge, edges.value)
  console.log('New connection made:', params);
}

const addNewNode = () => {
  const newNodeId = (nodes.value.length + 1).toString();
  const newNode: Node = { // Explicitly type newNode as Node
    id: newNodeId,
    label: `Scenario ${newNodeId}`,
    position: { x: Math.random() * 400, y: Math.random() * 400 },
    data: { scenarioId: parseInt(newNodeId) }
  };
  nodes.value.push(newNode);
};

</script>

<template>
  <div class="w-screen h-screen flex flex-col">
    <header class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <h1 class="text-xl font-semibold">Scenario Viewer</h1>
      <div class="flex items-center space-x-2">
        <span>Host: {{ hostUrl }}</span>
        <button @click="workspaceStore.updateHostUrl(prompt('Enter new host URL:', hostUrl ? hostUrl : '') || (hostUrl ? hostUrl : ''))" class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded">
          Edit Host
        </button>
        <button @click="addNewNode" class="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded">
          Add Node
        </button>
        <button @click="fitView()" class="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded">
          Fit View
        </button>
      </div>
    </header>

    <div class="flex-grow relative">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        @connect="onConnect"
        :fit-view-on-init="true"
        class="basic-flow"
      >
        <!-- Ensure :gap is bound if it's a number -->
        <Background pattern-color="#aaa" :gap="16" />
        <MiniMap />
        <Controls />
      </VueFlow>
    </div>
  </div>
</template>

<style>
.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}
</style>